import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, Role } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatSnackBarModule, CommonModule],
  template: `
    <div class="flex h-screen bg-white">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-50/50 border-r border-gray-100 flex flex-col animate-in slide-in-from-left-2 duration-300">
        <div class="h-16 flex items-center px-6 border-b border-gray-100 gap-2">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <mat-icon class="!text-lg">school</mat-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">ThesisMgr</span>
            <span class="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter italic">Quản lý Đồ án</span>
          </div>
        </div>
        
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
          @for (item of menuItems(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="!bg-white !text-indigo-600 shadow-sm border-indigo-100"
               [routerLinkActiveOptions]="{exact: item.exact}"
               class="flex items-center px-3 py-2 text-[12px] font-bold rounded-lg text-gray-500 hover:bg-white hover:text-indigo-600 border border-transparent transition-all group">
              <mat-icon class="mr-3 !text-lg text-gray-300 group-hover:text-indigo-400">{{item.icon}}</mat-icon>
              {{item.label}}
            </a>
          }
        </nav>
        
        <!-- Profile Section -->
        <div class="p-4 border-t border-gray-100 bg-white/50 m-2 rounded-xl border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3">
             <div class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50 shadow-md">
               {{auth.currentUser()?.name?.charAt(0) ?? '?'}}
             </div>
             <div class="min-w-0">
               <p class="text-[11px] font-black text-gray-900 truncate tracking-tight">{{auth.currentUser()?.name}}</p>
               <p class="text-[9px] text-indigo-500 font-bold italic uppercase tracking-tighter">{{activeRoleLabel()}}</p>
             </div>
          </div>
          <button (click)="logout()"
            class="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
            <mat-icon class="!text-sm">power_settings_new</mat-icon>
            Đăng xuất
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden bg-white">
        <!-- Topbar -->
        <header class="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div class="flex items-center gap-4">
            <h1 class="text-xs font-black text-gray-400 uppercase tracking-widest italic">Phenikaa University Thesis System</h1>
          </div>
          
          <div class="flex items-center gap-6">
            <button (click)="goToNotifications()" class="p-2 text-gray-400 hover:text-indigo-600 relative group transition-colors">
              <mat-icon class="!text-xl">notifications_none</mat-icon>
              @if (notificationService.unreadCount() > 0) {
                <span class="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white animate-pulse">
                  {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                </span>
              }
            </button>
            
            <div class="h-6 w-px bg-gray-100"></div>

            @if (auth.currentUser(); as user) {
              @if (user.roles.length > 1) {
                <div class="flex items-center gap-2">
                   <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Vai trò</span>
                   <select [value]="user.activeRole" (change)="changeRole($event)"
                     class="app-select !py-1 !px-2 !text-[11px] font-bold border-indigo-100 text-indigo-700 bg-indigo-50/50 italic">
                     @for (role of user.roles; track role) {
                       <option [value]="role">{{ roleLabel(role) }}</option>
                     }
                   </select>
                </div>
              } @else {
                <span class="app-badge font-black uppercase tracking-widest !bg-indigo-50 !text-indigo-600 border-indigo-100 italic">
                  {{ activeRoleLabel() }}
                </span>
              }
            }
          </div>
        </header>

        <!-- Viewport -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth bg-gray-50/30">
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
      this.notificationService.connectWebSocket();
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
    this.notificationService.disconnectWebSocket();
    this.auth.logout();
  }
}
