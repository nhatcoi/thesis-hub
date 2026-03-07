import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuditLogService, AuditLogResponse } from '../../core/audit-log.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="app-section-header">
        <div>
          <h2 class="app-title lowercase first-letter:uppercase">
            {{ isGlobal() ? 'Lịch sử hệ thống' : 'Lịch sử của tôi' }}
          </h2>
          <p class="app-subtitle italic">
            {{ isGlobal() ? 'Xem toàn bộ biến động dữ liệu trên toàn bộ hệ thống đồ án.' : 'Xem lại các thao tác và thay đổi bạn đã thực hiện gần đây.' }}
          </p>
        </div>
        <button (click)="refresh()" class="app-btn-secondary !bg-white">
          <mat-icon [class.animate-spin]="loading()" class="!text-sm">refresh</mat-icon>
          Cập nhật
        </button>
      </div>

      <!-- Main Content -->
      <div class="app-card !p-0 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        } @else if (history().length === 0) {
          <div class="p-12 text-center">
            <div class="mx-auto w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
              <mat-icon class="text-gray-300">history_toggle_off</mat-icon>
            </div>
            <h3 class="text-sm font-bold text-gray-900">Không có dữ liệu</h3>
            <p class="text-xs text-gray-400 mt-1 italic">Chưa ghi nhận thao tác nào từ tài khoản này.</p>
          </div>
        } @else {
          <div class="app-list-container !border-0 !rounded-none">
            @for (log of history(); track log.id) {
              <div class="app-list-item !border-x-0 first:!border-t-0 hover:bg-gray-50/50 transition-colors">
                <div class="flex items-start gap-4">
                  <!-- Action Icon Dot -->
                  <div class="mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    [ngClass]="getBgColor(log.action)">
                    <mat-icon [ngClass]="getIconColor(log.action)" class="!text-lg">
                      {{ getIcon(log.action) }}
                    </mat-icon>
                  </div>

                  <div class="flex-grow min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <span class="app-badge !text-[9px] !px-1.5 !font-black uppercase tracking-tighter"
                        [ngClass]="getBadgeStyles(log.action)">
                        {{ log.action }}
                      </span>
                      @if (isGlobal()) {
                        <span class="text-[11px] font-bold text-gray-900">{{ log.userName }}</span>
                      }
                      <span class="text-[10px] font-mono text-gray-400 ml-auto">{{ log.createdAt | date:'HH:mm dd/MM/yyyy' }}</span>
                    </div>

                    <p class="text-xs text-gray-700 leading-relaxed font-medium">
                      {{ log.message }}
                    </p>

                    <div class="mt-2 flex items-center gap-3">
                      <span class="text-[10px] text-gray-400 italic flex items-center gap-1">
                        <mat-icon class="!text-[12px]">category</mat-icon>
                        {{ log.entityType }}
                      </span>
                      @if (log.entityId) {
                        <span class="text-[10px] text-gray-400 italic flex items-center gap-1">
                          <mat-icon class="!text-[12px]">fingerprint</mat-icon>
                          {{ log.entityId.substring(0, 8) }}...
                        </span>
                      }
                      @if (log.ipAddress) {
                        <span class="text-[10px] text-gray-300 ml-auto font-mono">IP: {{ log.ipAddress }}</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class HistoryListComponent implements OnInit {
  private service = inject(AuditLogService);
  private router = inject(Router);

  history = signal<AuditLogResponse[]>([]);
  loading = signal(true);
  isGlobal = signal(false);

  ngOnInit(): void {
    // Determine if we should show global or personal history based on the URL
    this.isGlobal.set(this.router.url.includes('/pdt/'));
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const obs = this.isGlobal() ? this.service.getGlobalHistory() : this.service.getMyHistory();

    obs.subscribe({
      next: (res) => {
        this.history.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getIcon(action: string): string {
    if (action.includes('CREATE')) return 'add_circle';
    if (action.includes('UPDATE')) return 'edit_note';
    if (action.includes('DELETE')) return 'delete_sweep';
    if (action.includes('ACTIVATE')) return 'bolt';
    if (action.includes('CLOSE')) return 'lock';
    if (action.includes('IMPORT')) return 'cloud_upload';
    return 'history';
  }

  getBgColor(action: string): string {
    if (action.includes('CREATE') || action.includes('IMPORT')) return 'bg-green-50';
    if (action.includes('UPDATE')) return 'bg-blue-50';
    if (action.includes('DELETE') || action.includes('CLOSE')) return 'bg-red-50';
    return 'bg-indigo-50';
  }

  getIconColor(action: string): string {
    if (action.includes('CREATE') || action.includes('IMPORT')) return 'text-green-600';
    if (action.includes('UPDATE')) return 'text-blue-600';
    if (action.includes('DELETE') || action.includes('CLOSE')) return 'text-red-600';
    return 'text-indigo-600';
  }

  getBadgeStyles(action: string): string {
    if (action.includes('CREATE') || action.includes('IMPORT')) return 'bg-green-50 text-green-700 border-green-200';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('DELETE') || action.includes('CLOSE')) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
}
