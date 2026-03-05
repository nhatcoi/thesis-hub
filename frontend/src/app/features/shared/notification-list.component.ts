import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, NotificationResponse } from '../../core/notification.service';

@Component({
    selector: 'app-notification-list',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Thông báo của bạn</h2>
          <p class="text-sm text-gray-500">Xem và quản lý các thông báo từ hệ thống.</p>
        </div>
        <button (click)="markAllAsRead()" 
          class="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition-all">
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (notifications().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center animate-in fade-in zoom-in-95">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-gray-300 !text-[32px]">notifications_off</mat-icon>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Không có thông báo nào</h3>
          <p class="text-gray-500 mt-1">Hệ thống hiện chưa có thông báo mới cho bạn.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (n of notifications(); track n.id) {
            <div
              class="group relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
              [class.border-l-4]="!n.isRead"
              [class.border-l-indigo-500]="!n.isRead"
              [class.border-gray-100]="n.isRead">
              
              <div class="p-4 sm:p-5 flex items-start space-x-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  [ngClass]="getBgColor(n.type)">
                  <mat-icon [ngClass]="getIconColor(n.type)" class="!text-[20px]">
                    {{ getIcon(n.type) }}
                  </mat-icon>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="text-sm font-bold text-gray-900 truncate" [class.font-extrabold]="!n.isRead">
                      {{ n.title }}
                    </h4>
                    <span class="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                      {{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    {{ n.message }}
                  </p>
                  
                  @if (!n.isRead) {
                    <button (click)="markAsRead(n.id)" 
                      class="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                      <mat-icon class="!text-[14px] mr-1">done_all</mat-icon>
                      Đánh dấu đã đọc
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class NotificationListComponent implements OnInit {
    private service = inject(NotificationService);
    notifications = signal<NotificationResponse[]>([]);
    loading = signal(true);

    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.loading.set(true);
        this.service.getNotifications().subscribe({
            next: (res) => {
                this.notifications.set(res.data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    markAsRead(id: string): void {
        this.service.markAsRead(id).subscribe();
        this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    }

    markAllAsRead(): void {
        this.service.markAllAsRead().subscribe();
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    }

    getIcon(type: string): string {
        switch (type) {
            case 'BATCH_OPENED': return 'campaign';
            case 'TOPIC_APPROVED': return 'check_circle';
            case 'TOPIC_REJECTED': return 'cancel';
            case 'ADVISOR_ASSIGNED': return 'person_add';
            case 'OUTLINE_REVIEWED': return 'assignment_turned_in';
            case 'PROGRESS_REMINDER': return 'running_with_errors';
            case 'DEFENSE_SCHEDULED': return 'event';
            case 'SCORE_PUBLISHED': return 'grade';
            default: return 'info';
        }
    }

    getBgColor(type: string): string {
        switch (type) {
            case 'TOPIC_APPROVED': return 'bg-green-50';
            case 'TOPIC_REJECTED': return 'bg-red-50';
            case 'BATCH_OPENED': return 'bg-blue-50';
            case 'PROGRESS_REMINDER': return 'bg-amber-50';
            default: return 'bg-indigo-50';
        }
    }

    getIconColor(type: string): string {
        switch (type) {
            case 'TOPIC_APPROVED': return 'text-green-600';
            case 'TOPIC_REJECTED': return 'text-red-600';
            case 'BATCH_OPENED': return 'text-blue-600';
            case 'PROGRESS_REMINDER': return 'text-amber-600';
            default: return 'text-indigo-600';
        }
    }
}
