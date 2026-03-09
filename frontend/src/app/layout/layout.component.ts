import { Component, inject, OnInit, signal } from '@angular/core';
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

interface MenuGroup {
  title: string;
  icon: string;
  items: MenuItem[];
}

type MenuEntry = MenuItem | MenuGroup;

function isGroup(entry: MenuEntry): entry is MenuGroup {
  return 'items' in entry;
}

const MENU_MAP: Record<string, MenuEntry[]> = {
  ADMIN: [
    { path: '/profile', label: 'Thông tin cá nhân', icon: 'person', exact: false },
    { path: '/pdt/users', label: 'Quản lý người dùng', icon: 'people', exact: false },
    { path: '/pdt/batches', label: 'Quản lý đợt đồ án', icon: 'date_range', exact: false },
    { path: '/pdt/academic-years', label: 'Quản lý niên khóa', icon: 'calendar_today', exact: false },
    { path: '/pdt/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/pdt/history', label: 'Lịch sử hệ thống', icon: 'history', exact: false },
  ],
  TRAINING_DEPT: [
    { path: '/profile', label: 'Thông tin cá nhân', icon: 'person', exact: false },
    { path: '/pdt/users', label: 'Quản lý người dùng', icon: 'people', exact: false },
    { path: '/pdt/batches', label: 'Quản lý đợt đồ án', icon: 'date_range', exact: false },
    { path: '/pdt/academic-years', label: 'Quản lý niên khóa', icon: 'calendar_today', exact: false },
    { path: '/pdt/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/pdt/history', label: 'Lịch sử hệ thống', icon: 'history', exact: false },
  ],
  DEPT_HEAD: [
    { path: '/profile', label: 'Thông tin cá nhân', icon: 'person', exact: false },
    { path: '/head/students', label: 'DS Sinh viên', icon: 'people', exact: false },
    { path: '/head/topics', label: 'Đề tài đề xuất', icon: 'assignment', exact: false },
    { path: '/head/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/head/history', label: 'Lịch sử của tôi', icon: 'history', exact: false },
  ],
  LECTURER: [
    { path: '/profile', label: 'Thông tin cá nhân', icon: 'person', exact: false },
    {
      title: 'Đăng ký & thực hiện ĐA',
      icon: 'auto_stories',
      items: [
        { path: '/lecturer/topics', label: 'Đề tài của tôi', icon: 'library_books', exact: false },
        { path: '/lecturer/requests', label: 'Yêu cầu đăng ký', icon: 'how_to_reg', exact: false },
        { path: '/lecturer/outlines', label: 'Duyệt đề cương', icon: 'description', exact: false },
        { path: '/lecturer/progress', label: 'Theo dõi tiến độ', icon: 'trending_up', exact: false },
        { path: '/lecturer/defenses', label: 'Duyệt bảo vệ', icon: 'gavel', exact: false },
      ]
    },
    { path: '/lecturer/notifications', label: 'Thông báo', icon: 'notifications', exact: false },
    { path: '/lecturer/history', label: 'Lịch sử của tôi', icon: 'history', exact: false },
  ],
  STUDENT: [
    { path: '/profile', label: 'Thông tin cá nhân', icon: 'person', exact: false },
    {
      title: 'Đăng ký & thực hiện ĐA',
      icon: 'auto_stories',
      items: [
        { path: '/student/topics', label: 'Đăng ký đề tài', icon: 'search', exact: false },
        { path: '/student/outline', label: 'Nộp đề cương', icon: 'upload_file', exact: false },
        { path: '/student/progress', label: 'Cập nhật tiến độ', icon: 'update', exact: false },
        { path: '/student/defense', label: 'Đăng ký bảo vệ', icon: 'school', exact: false },
      ]
    },
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
      <aside [class.w-64]="!collapsed()" [class.w-20]="collapsed()"
        class="bg-gray-50/50 border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out relative group/sidebar">
        
        <!-- Toggle button pinned to border -->
        <button (click)="toggleSidebar()"
          class="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm z-50 hover:bg-gray-50 transition-colors">
          <mat-icon class="!text-[14px] !w-3.5 !h-3.5 text-gray-400 transition-transform duration-300"
            [class.rotate-180]="collapsed()">chevron_left</mat-icon>
        </button>

        <div class="h-16 flex items-center px-6 border-b border-gray-100 gap-2 shrink-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="ThesisHub Logo" class="w-7 h-7">
          </div>
          @if (!collapsed()) {
            <div class="flex flex-col animate-in fade-in duration-300">
              <span class="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">ThesisHub</span>
              <span class="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter italic">Phenikaa University</span>
            </div>
          }
        </div>
        
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <!-- Dashboard (always first) -->
          <a routerLink="/dashboard" routerLinkActive="!bg-white !text-indigo-600 shadow-sm border-indigo-100"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center px-3 py-2 text-[12px] font-bold rounded-lg text-gray-500 hover:bg-white hover:text-indigo-600 border border-transparent transition-all group overflow-hidden"
             [title]="collapsed() ? 'Dashboard' : ''">
            <mat-icon class="mr-3 !text-lg text-gray-300 group-hover:text-indigo-400 shrink-0">dashboard</mat-icon>
            @if (!collapsed()) {
              <span class="truncate animate-in fade-in slide-in-from-left-2 duration-300">Dashboard</span>
            }
          </a>

          @for (entry of menuEntries(); track $index) {
            @if (isMenuGroup(entry)) {
              <!-- Group header -->
              <div class="pt-3">
                <button (click)="toggleGroup(entry.title)"
                  class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-gray-100/80 transition-all group cursor-pointer overflow-hidden"
                  [title]="collapsed() ? entry.title : ''">
                  <div class="flex items-center gap-2 min-w-0">
                    <mat-icon class="!text-[14px] !w-4 !h-4 text-indigo-400 shrink-0">{{ entry.icon }}</mat-icon>
                    @if (!collapsed()) {
                      <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate animate-in fade-in duration-300">{{ entry.title }}</span>
                    }
                  </div>
                  @if (!collapsed()) {
                    <mat-icon class="!text-[16px] !w-4 !h-4 text-gray-300 transition-transform duration-200 shrink-0"
                      [class.rotate-180]="isGroupOpen(entry.title)">expand_more</mat-icon>
                  }
                </button>
                @if (isGroupOpen(entry.title) && !collapsed()) {
                  <div class="mt-1 space-y-0.5 pl-1 border-l-2 border-indigo-100 ml-4 animate-in slide-in-from-top-1 duration-200">
                    @for (item of entry.items; track item.path) {
                      <a [routerLink]="item.path" routerLinkActive="!bg-white !text-indigo-600 shadow-sm border-indigo-100"
                         [routerLinkActiveOptions]="{exact: item.exact}"
                         class="flex items-center px-3 py-1.5 text-[11px] font-bold rounded-lg text-gray-500 hover:bg-white hover:text-indigo-600 border border-transparent transition-all group">
                        <mat-icon class="mr-2.5 !text-base text-gray-300 group-hover:text-indigo-400 shrink-0">{{item.icon}}</mat-icon>
                        <span class="truncate">{{item.label}}</span>
                      </a>
                    }
                  </div>
                }
              </div>
            } @else {
              <!-- Single item -->
              <a [routerLink]="entry.path" routerLinkActive="!bg-white !text-indigo-600 shadow-sm border-indigo-100"
                 [routerLinkActiveOptions]="{exact: entry.exact}"
                 class="flex items-center px-3 py-2 text-[12px] font-bold rounded-lg text-gray-500 hover:bg-white hover:text-indigo-600 border border-transparent transition-all group overflow-hidden"
                 [title]="collapsed() ? entry.label : ''">
                <mat-icon class="mr-3 !text-lg text-gray-300 group-hover:text-indigo-400 shrink-0">{{entry.icon}}</mat-icon>
                @if (!collapsed()) {
                  <span class="truncate animate-in fade-in slide-in-from-left-2 duration-300">{{entry.label}}</span>
                }
              </a>
            }
          }
        </nav>
        
        <!-- Profile Section -->
        <div class="p-4 border-t border-gray-100 bg-white/50 m-2 rounded-xl border border-gray-100 shadow-sm shrink-0">
          <div class="flex items-center gap-3">
             <div class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50 shadow-md shrink-0">
               {{auth.currentUser()?.name?.charAt(0) ?? '?'}}
             </div>
             @if (!collapsed()) {
               <div class="min-w-0 animate-in fade-in duration-300">
                 <p class="text-[11px] font-black text-gray-900 truncate tracking-tight">{{auth.currentUser()?.name}}</p>
                 <p class="text-[9px] text-indigo-500 font-bold italic uppercase tracking-tighter">{{activeRoleLabel()}}</p>
               </div>
             }
          </div>
          @if (!collapsed()) {
            <button (click)="logout()"
              class="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100 animate-in fade-in duration-300">
              <mat-icon class="!text-sm">power_settings_new</mat-icon>
              Đăng xuất
            </button>
          } @else {
            <button (click)="logout()" class="mt-4 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mx-auto" title="Đăng xuất">
              <mat-icon class="!text-sm">power_settings_new</mat-icon>
            </button>
          }
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden bg-white">
        <!-- Topbar -->
        <header class="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div class="flex items-center gap-2">
            <img src="/logo.svg" alt="ThesisHub" class="w-6 h-6">
            <h1 class="text-xs font-black text-gray-600 uppercase tracking-widest">ThesisHub PKA</h1>
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
        <main class="flex-1 overflow-y-auto scroll-smooth bg-gray-50/30">
          <div class="p-4 lg:p-6 min-h-[calc(100vh-64px-200px)]">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <footer class="bg-white border-t border-gray-100 pt-12 pb-8 px-8">
            <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <!-- Branding & Social -->
              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <img src="/logo.svg" alt="ThesisHub Logo" class="w-8 h-8">
                  <span class="text-base font-black text-gray-900 uppercase tracking-widest">ThesisHub PKA</span>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Hệ thống quản lý đồ án tốt nghiệp hiện đại tại Đại học Phenikaa. Tối ưu hóa quy trình, kết nối sinh viên và giảng viên.
                </p>
                <div class="flex gap-3 pt-2">
                  <a href="#" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-gray-100">
                    <mat-icon class="!text-sm">facebook</mat-icon>
                  </a>
                  <a href="#" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-gray-100">
                    <mat-icon class="!text-sm">language</mat-icon>
                  </a>
                  <a href="#" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-gray-100">
                    <mat-icon class="!text-sm">alternate_email</mat-icon>
                  </a>
                </div>
              </div>

              <!-- Links sections -->
              <div>
                <h4 class="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Khám phá</h4>
                <ul class="space-y-2">
                  <li><a routerLink="/support/about" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">Về chúng tôi</a></li>
                  <li><a href="#" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Tin tức & Sự kiện</a></li>
                  <li><a href="#" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Cơ hội nghề nghiệp</a></li>
                  <li><a href="#" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Liên hệ</a></li>
                </ul>
              </div>

              <div>
                <h4 class="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Hỗ trợ</h4>
                <ul class="space-y-2">
                  <li><a routerLink="/support/privacy" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">Chính sách bảo mật</a></li>
                  <li><a routerLink="/support/terms" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">Điều khoản dịch vụ</a></li>
                  <li><a href="https://phenikaa-uni.gitbook.io" target="_blank" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                    Hướng dẫn sử dụng <mat-icon class="!text-[10px] !w-3 !h-3">open_in_new</mat-icon>
                  </a></li>
                  <li><a routerLink="/support/faq" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">Câu hỏi thường gặp</a></li>
                </ul>
              </div>

              <div>
                <h4 class="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Các sản phẩm khác</h4>
                <ul class="space-y-2">
                  <li><a href="#" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors italic">PKA LMS</a></li>
                  <li><a href="#" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors italic">PKA Student Portal</a></li>
                  <li><a href="#" class="text-xs text-gray-500 hover:text-indigo-600 transition-colors italic">PKA Library</a></li>
                </ul>
              </div>
            </div>

            <div class="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <p class="text-[10px] font-bold text-gray-400">
                © 2026 ThesisHub PKA. All rights reserved.
              </p>
              <div class="flex gap-6">
                <a routerLink="/support/faq" class="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors cursor-pointer">Sitemap</a>
                <a routerLink="/support/privacy" class="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors cursor-pointer">Cookies Policy</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  collapsed = signal(false);
  openGroups = signal<Set<string>>(new Set(['Đăng ký & thực hiện ĐA']));

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.notificationService.loadUnreadCount();
      this.notificationService.connectWebSocket();
    }
  }

  toggleSidebar(): void {
    this.collapsed.set(!this.collapsed());
  }

  menuEntries(): MenuEntry[] {
    const role = this.auth.currentUser()?.activeRole;
    return role ? (MENU_MAP[role] ?? []) : [];
  }

  isMenuGroup(entry: MenuEntry): entry is MenuGroup {
    return isGroup(entry);
  }

  toggleGroup(title: string): void {
    if (this.collapsed()) {
      this.collapsed.set(false);
      this.openGroups.set(new Set([title]));
      return;
    }
    const current = new Set(this.openGroups());
    if (current.has(title)) {
      current.delete(title);
    } else {
      current.add(title);
    }
    this.openGroups.set(current);
  }

  isGroupOpen(title: string): boolean {
    return !this.collapsed() && this.openGroups().has(title);
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
    const role = this.auth.currentUser()?.activeRole;
    if (!role) return;

    let prefix = '';
    switch (role) {
      case 'ADMIN':
      case 'TRAINING_DEPT':
        prefix = 'pdt';
        break;
      case 'DEPT_HEAD':
        prefix = 'head';
        break;
      default:
        prefix = role.toLowerCase();
    }
    this.router.navigate([`/${prefix}/notifications`]);
  }

  logout(): void {
    this.notificationService.disconnectWebSocket();
    this.auth.logout();
  }
}
