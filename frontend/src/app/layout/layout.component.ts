import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, Role } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  exact: boolean;
}

const MENU_MAP: Record<string, MenuItem[]> = {
  ADMIN: [
    { path: '/pdt/users', label: 'Quản lý người dùng', icon: 'people', exact: false },
    { path: '/pdt/batches', label: 'Quản lý đợt đồ án', icon: 'date_range', exact: false },
    { path: '/pdt/academic-years', label: 'Quản lý niên khóa', icon: 'calendar_today', exact: false },
    { path: '/pdt/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/pdt/history', label: 'Lịch sử hệ thống', icon: 'history', exact: false },
  ],
  TRAINING_DEPT: [
    { path: '/pdt/users', label: 'Quản lý người dùng', icon: 'people', exact: false },
    { path: '/pdt/batches', label: 'Quản lý đợt đồ án', icon: 'date_range', exact: false },
    { path: '/pdt/academic-years', label: 'Quản lý niên khóa', icon: 'calendar_today', exact: false },
    { path: '/pdt/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/pdt/history', label: 'Lịch sử hệ thống', icon: 'history', exact: false },
  ],
  DEPT_HEAD: [
    { path: '/head/students', label: 'DS Sinh viên', icon: 'people', exact: false },
    { path: '/head/topics', label: 'Đề tài đề xuất', icon: 'assignment', exact: false },
    { path: '/head/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/head/history', label: 'Lịch sử của tôi', icon: 'history', exact: false },
  ],
  LECTURER: [
    { path: '/lecturer/topics', label: 'Đề tài của tôi', icon: 'library_books', exact: false },
    { path: '/lecturer/requests', label: 'Yêu cầu đăng ký', icon: 'how_to_reg', exact: false },
    { path: '/lecturer/outlines', label: 'Duyệt đề cương', icon: 'description', exact: false },
    { path: '/lecturer/progress', label: 'Theo dõi tiến độ', icon: 'trending_up', exact: false },
    { path: '/lecturer/defenses', label: 'Duyệt bảo vệ', icon: 'gavel', exact: false },
    { path: '/lecturer/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/lecturer/history', label: 'Lịch sử của tôi', icon: 'history', exact: false },
  ],
  STUDENT: [
    { path: '/student/topics', label: 'Đăng ký đề tài', icon: 'search', exact: false },
    { path: '/student/outline', label: 'Nộp đề cương', icon: 'upload_file', exact: false },
    { path: '/student/progress', label: 'Cập nhật tiến độ', icon: 'update', exact: false },
    { path: '/student/defense', label: 'Đăng ký bảo vệ', icon: 'school', exact: false },
    { path: '/student/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/student/history', label: 'Lịch sử của tôi', icon: 'history', exact: false },
  ],
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div class="h-16 flex items-center px-6 border-b border-gray-200">
          <mat-icon class="text-indigo-600 mr-2">school</mat-icon>
          <span class="text-lg font-bold text-gray-900">ThesisMgr</span>
        </div>
        
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          @for (item of menuItems(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-indigo-50 text-indigo-600"
               [routerLinkActiveOptions]="{exact: item.exact}"
               class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              <mat-icon class="mr-3 text-gray-400">{{item.icon}}</mat-icon>
              {{item.label}}
            </a>
          }
        </nav>
        
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {{auth.currentUser()?.name?.charAt(0) ?? '?'}}
            </div>
            <div class="ml-3 min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">{{auth.currentUser()?.name}}</p>
              <p class="text-xs text-gray-500">{{activeRoleLabel()}}</p>
            </div>
          </div>
          <button (click)="logout()"
            class="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Đăng xuất
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 class="text-xl font-semibold text-gray-900">Hệ thống Quản lý Đồ án</h1>
          
          <div class="flex items-center space-x-4">
            <button (click)="goToNotifications()" class="p-2 text-gray-400 hover:text-gray-500 relative group">
              <mat-icon>notifications</mat-icon>
              @if (notificationService.unreadCount() > 0) {
                <span class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {{ notificationService.unreadCount() > 99 ? '99+' : notificationService.unreadCount() }}
                </span>
              }
            </button>
            
            @if (auth.currentUser(); as user) {
              @if (user.roles.length > 1) {
                <select [value]="user.activeRole" (change)="changeRole($event)"
                  class="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  @for (role of user.roles; track role) {
                    <option [value]="role">{{ roleLabel(role) }}</option>
                  }
                </select>
              } @else {
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ activeRoleLabel() }}
                </span>
              }
            }
          </div>
        </header>

        <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.notificationService.loadUnreadCount();
    }
  }

  menuItems(): MenuItem[] {
    const role = this.auth.currentUser()?.activeRole;
    const base: MenuItem[] = [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true },
    ];
    return role ? [...base, ...(MENU_MAP[role] ?? [])] : base;
  }

  activeRoleLabel(): string {
    const role = this.auth.currentUser()?.activeRole;
    return role ? AuthService.roleLabel(role) : '';
  }

  roleLabel(role: Role): string {
    return AuthService.roleLabel(role);
  }

  changeRole(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.auth.setActiveRole(select.value as Role);
    this.router.navigate(['/dashboard']);
  }

  goToNotifications(): void {
    const role = this.auth.currentUser()?.activeRole?.toLowerCase();
    const prefix = role === 'admin' || role === 'training_dept' ? 'pdt' : role;
    this.router.navigate([`/${prefix}/notifications`]);
  }

  logout(): void {
    this.auth.logout();
  }
}
