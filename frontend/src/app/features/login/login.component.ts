import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, Role } from '../../core/auth.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center">
            <img src="/logo.svg" alt="ThesisHub Logo" class="w-16 h-16">
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 uppercase tracking-widest">
          ThesisHub PKA
        </h2>
        <p class="mt-2 text-center text-sm font-medium text-gray-500 italic">
          Nền tảng Quản lý Đồ án Tốt nghiệp - Đại học Phenikaa
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">

          @if (showRoleSelector) {
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900 text-center">Chọn vai trò</h3>
              <p class="text-sm text-gray-500 text-center">
                Tài khoản của bạn có nhiều vai trò. Vui lòng chọn vai trò để tiếp tục.
              </p>
              @for (role of availableRoles; track role) {
                <button (click)="selectRole(role)"
                  class="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div class="flex items-center">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border"
                        [class]="getRoleBadgeClass(role)">
                        <mat-icon>{{ getRoleIcon(role) }}</mat-icon>
                      </div>
                      <span class="ml-3 text-sm font-semibold text-gray-700">{{ getRoleLabel(role) }}</span>
                    </div>
                    <mat-icon class="text-gray-300">chevron_right</mat-icon>
                </button>
              }
            </div>
          } @else {
            <div class="space-y-6">
              <button (click)="loginSSO()"
                class="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.98]">
                <mat-icon class="mr-2">vpn_key</mat-icon>
                Đăng nhập bằng SSO
              </button>
              <p class="text-xs text-center text-gray-400">
                Sử dụng tài khoản SSO của trường (Zitadel)
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  showRoleSelector = false;
  availableRoles: Role[] = [];

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      if (user.roles.length > 1) {
        this.showRoleSelector = true;
        this.availableRoles = user.roles;
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  loginSSO(): void {
    this.auth.login();
  }

  selectRole(role: Role): void {
    this.auth.setActiveRole(role);
    this.router.navigate(['/dashboard']);
  }

  getRoleLabel(role: Role): string {
    return AuthService.roleLabel(role);
  }

  getRoleIcon(role: Role): string {
    const icons: Record<Role, string> = {
      ADMIN: 'admin_panel_settings',
      TRAINING_DEPT: 'account_balance',
      DEPT_HEAD: 'manage_accounts',
      LECTURER: 'school',
      STUDENT: 'person',
    };
    return icons[role] ?? 'account_circle';
  }

  getRoleBadgeClass(role: Role): string {
    const classes: Record<Role, string> = {
      ADMIN: 'bg-red-100 text-red-600',
      TRAINING_DEPT: 'bg-purple-100 text-purple-600',
      DEPT_HEAD: 'bg-blue-100 text-blue-600',
      LECTURER: 'bg-green-100 text-green-600',
      STUDENT: 'bg-amber-100 text-amber-600',
    };
    return classes[role] ?? 'bg-gray-100 text-gray-600';
  }
}
