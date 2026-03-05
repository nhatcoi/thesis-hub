import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export type Role = 'ADMIN' | 'TRAINING_DEPT' | 'DEPT_HEAD' | 'LECTURER' | 'STUDENT';

export interface User {
  sub: string;
  name: string;
  email: string;
  roles: Role[];
  activeRole: Role;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị hệ thống',
  TRAINING_DEPT: 'Phòng Đào tạo',
  DEPT_HEAD: 'Trưởng ngành',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
};

const ROLES_CLAIM = 'urn:zitadel:iam:org:project:roles';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  private _readyResolve!: () => void;
  readonly ready$ = new Promise<void>(resolve => {
    this._readyResolve = resolve;
  });

  async init(): Promise<void> {
    // Bỏ qua trên server (SSR)
    if (!isPlatformBrowser(this.platformId)) {
      this._readyResolve();
      return;
    }

    this.oauthService.configure({
      issuer: environment.sso.issuer,
      clientId: environment.sso.clientId,
      redirectUri: environment.sso.redirectUri,
      postLogoutRedirectUri: environment.sso.postLogoutRedirectUri,
      responseType: 'code',
      scope: environment.sso.scope,
      useSilentRefresh: false,
      showDebugInformation: !environment.production,
      requireHttps: environment.production,
    } satisfies AuthConfig);

    const hadTokenBefore = this.oauthService.hasValidAccessToken();

    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      if (this.oauthService.hasValidAccessToken()) {
        this.buildUserFromToken();

        if (!hadTokenBefore) {
          console.log('[AuthService] Login OK, chuyển /dashboard');
          this.router.navigateByUrl('/dashboard');
        }
      }
    } catch (err) {
      console.error('[AuthService] Init lỗi:', err);
    } finally {
      this._readyResolve();
    }
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem('activeRole');
    this.oauthService.logOut();
  }

  setActiveRole(role: Role): void {
    const user = this.currentUser();
    if (user && user.roles.includes(role)) {
      this.currentUser.set({ ...user, activeRole: role });
      sessionStorage.setItem('activeRole', role);
    }
  }

  /**
   * Get current access token (for HTTP interceptor / manual calls).
   */
  getAccessToken(): string | null {
    return this.oauthService.getAccessToken() ?? null;
  }

  private buildUserFromToken(): void {
    const idClaims = this.oauthService.getIdentityClaims() as Record<string, unknown> | null;
    if (!idClaims) return;

    const roles = this.extractRoles();
    const savedRole = sessionStorage.getItem('activeRole') as Role | null;
    const activeRole = savedRole && roles.includes(savedRole)
      ? savedRole
      : roles[0] ?? 'STUDENT';

    this.currentUser.set({
      sub: (idClaims['sub'] as string) ?? '',
      name: (idClaims['name'] as string) ?? '',
      email: (idClaims['email'] as string) ?? '',
      roles,
      activeRole,
    });
  }

  private extractRoles(): Role[] {
    return this.extractRolesFromJwt(this.oauthService.getAccessToken())
      ?? this.extractRolesFromClaims(this.oauthService.getIdentityClaims())
      ?? [];
  }

  private extractRolesFromJwt(token: string | null): Role[] | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return this.parseRolesClaim(payload[ROLES_CLAIM]);
    } catch {
      return null;
    }
  }

  private extractRolesFromClaims(claims: object | null): Role[] | null {
    if (!claims) return null;
    return this.parseRolesClaim((claims as Record<string, unknown>)[ROLES_CLAIM]);
  }

  private parseRolesClaim(rolesObj: unknown): Role[] | null {
    if (!rolesObj || typeof rolesObj !== 'object') return null;
    const keys = Object.keys(rolesObj as Record<string, unknown>);
    if (keys.length === 0) return null;
    return keys
      .map(r => r.toUpperCase() as Role)
      .filter(r => r in ROLE_LABELS);
  }

  static roleLabel(role: Role): string {
    return ROLE_LABELS[role] ?? role;
  }
}
