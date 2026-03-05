import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'ADMIN' | 'TRAINING_DEPT' | 'DEPT_HEAD' | 'LECTURER' | 'STUDENT';

export interface User {
  id: string; // local_user_id từ backend
  sub: string;
  name: string;
  email: string;
  roles: Role[];
  activeRole: Role;
  localRole?: Role;
  facultyName?: string;
  majorName?: string;
  facultyId?: string;
  majorId?: string;
}

export interface AuthCheckResult {
  allowed: boolean;
  reasonCode: string;
  message: string;
  localUserId?: string;
  localRole?: Role;
  tokenRoles: Role[];
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị hệ thống',
  TRAINING_DEPT: 'Phòng Đào tạo',
  DEPT_HEAD: 'Trưởng ngành',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
};

const ROLES_CLAIM = 'urn:zitadel:iam:org:project:roles';

const ROLE_HOME: Record<Role, string> = {
  ADMIN: '/pdt/batches',
  TRAINING_DEPT: '/pdt/batches',
  DEPT_HEAD: '/head/topics',
  LECTURER: '/lecturer/topics',
  STUDENT: '/dashboard',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private oauthService = inject(OAuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());
  loginDenied = signal<AuthCheckResult | null>(null);

  private _readyResolve!: () => void;
  readonly ready$ = new Promise<void>(resolve => {
    this._readyResolve = resolve;
  });

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this._readyResolve();
      return;
    }

    this.oauthService.configure({
      issuer: environment.sso.issuer,
      clientId: environment.sso.clientId,
      redirectUri: environment.sso.redirectUri,
      postLogoutRedirectUri: environment.sso.postLogoutRedirectUri,
      silentRefreshRedirectUri: window.location.origin + '/assets/silent-refresh.html',
      responseType: 'code',
      scope: environment.sso.scope,
      useSilentRefresh: true,
      timeoutFactor: 0.75,
      showDebugInformation: !environment.production,
      requireHttps: environment.production,
    } satisfies AuthConfig);

    // Tự gia hạn token (nếu IdP hỗ trợ)
    this.oauthService.setupAutomaticSilentRefresh();

    const hadTokenBefore = this.oauthService.hasValidAccessToken();

    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      if (this.oauthService.hasValidAccessToken()) {
        this.buildUserFromToken();

        try {
          // Gate: chỉ cho vào hệ thống nếu backend xác nhận
          const checkRes = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/auth/check`));
          const check = checkRes.data as AuthCheckResult;

          if (!check.allowed) {
            this.loginDenied.set(check);
            this.clearLocalState();
            this.router.navigateByUrl('/no-access');
            return;
          }

          // Lấy thông tin user + roles từ backend
          const meRes = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/auth/me`));
          const me = meRes.data;
          const backendRoles = (me.local_roles || []) as Role[];

          const savedRole = sessionStorage.getItem('activeRole') as Role;
          const activeRole: Role = (savedRole && backendRoles.includes(savedRole))
            ? savedRole
            : (backendRoles[0] || 'STUDENT');

          const current = this.currentUser();
          if (current) {
            this.currentUser.set({
              ...current,
              id: me.local_user_id,
              roles: backendRoles,
              activeRole,
              facultyName: me.facultyName,
              majorName: me.majorName,
              facultyId: me.facultyId,
              majorId: me.majorId
            });
          }

          if (!hadTokenBefore) {
            const homePath = ROLE_HOME[activeRole] || '/dashboard';
            this.router.navigateByUrl(homePath);
          }
        } catch (apiError) {
          console.error('[AuthService] Lỗi gọi backend:', apiError);
          this.clearLocalState();
          this.router.navigateByUrl('/no-access');
        }
      }
    } catch (err) {
      console.error('[AuthService] OAuth lỗi:', err);
    } finally {
      this._readyResolve();
    }
  }

  private clearLocalState(): void {
    this.currentUser.set(null);
    this.loginDenied.set(null);
    sessionStorage.removeItem('activeRole');
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.clearLocalState();
    this.oauthService.logOut();
  }

  setActiveRole(role: Role): void {
    const user = this.currentUser();
    if (user && user.roles.includes(role)) {
      this.currentUser.set({ ...user, activeRole: role });
      sessionStorage.setItem('activeRole', role);
      this.router.navigateByUrl(ROLE_HOME[role] || '/dashboard');
    }
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken() ?? null;
  }

  private buildUserFromToken(): void {
    const idClaims = this.oauthService.getIdentityClaims() as any;
    if (!idClaims) return;

    const roles = this.extractRoles();
    this.currentUser.set({
      id: '', // Sẽ được cập nhật sau khi gọi /auth/me
      sub: idClaims.sub,
      name: idClaims.name || idClaims.preferred_username,
      email: idClaims.email,
      roles: roles,
      activeRole: roles[0] || 'STUDENT'
    });
  }

  private extractRoles(): Role[] {
    // Ưu tiên access_token nếu là JWT, fallback sang id_token claims
    const token = this.oauthService.getAccessToken();
    const fromToken = this.extractRolesFromJwt(token);
    if (fromToken.length > 0) return fromToken;

    const claims = this.oauthService.getIdentityClaims() as any;
    const rolesObj = (claims && claims[ROLES_CLAIM]) ? claims[ROLES_CLAIM] : {};
    return Object.keys(rolesObj)
      .map(r => r.toUpperCase() as Role)
      .filter(r => r in ROLE_LABELS);
  }

  private extractRolesFromJwt(token: string | null): Role[] {
    if (!token) return [];
    const dotCount = (token.match(/\./g) || []).length;
    if (dotCount !== 2) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rolesObj = payload[ROLES_CLAIM] || {};
      return Object.keys(rolesObj)
        .map((r: string) => r.toUpperCase() as Role)
        .filter((r: Role) => r in ROLE_LABELS);
    } catch {
      return [];
    }
  }

  static roleLabel(role: Role): string {
    return ROLE_LABELS[role] ?? role;
  }
}
