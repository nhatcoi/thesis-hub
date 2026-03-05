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
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header Area -->
      <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isGlobal() ? 'Lịch sử hệ thống' : 'Lịch sử hoạt động' }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ isGlobal() ? 'Xem toàn bộ biến động dữ liệu trên hệ thống.' : 'Xem lại các thao tác bạn đã thực hiện gần đây.' }}
          </p>
        </div>
        <button (click)="refresh()" 
          class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-all text-sm">
          <mat-icon [class.animate-spin]="loading()" class="!text-[20px]">refresh</mat-icon>
          Làm mới
        </button>
      </div>

      <!-- Content Area -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (history().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center animate-in fade-in zoom-in-95">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-gray-300 !text-[32px]">history_toggle_off</mat-icon>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Không có dữ liệu lịch sử</h3>
          <p class="text-gray-500 mt-1">Các thao tác trên hệ thống dành cho bạn sẽ được ghi nhận tại đây.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (log of history(); track log.id) {
            <div
              class="group relative bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-bottom-2">
              
              <div class="p-4 sm:p-5 flex items-start space-x-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  [ngClass]="getBgColor(log.action)">
                  <mat-icon [ngClass]="getIconColor(log.action)" class="!text-[20px]">
                    {{ getIcon(log.action) }}
                  </mat-icon>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <span class="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-tight border"
                        [ngClass]="getBadgeStyles(log.action)">
                        {{ log.action }}
                      </span>
                      @if (isGlobal()) {
                        <span class="text-xs font-semibold text-gray-500">• {{ log.userName }}</span>
                      }
                    </div>
                    <span class="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                      {{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  
                  <p class="text-[14px] text-gray-700 font-medium leading-relaxed">
                    {{ log.message }}
                  </p>
                  
                  <div class="mt-2 flex items-center gap-3">
                    <span class="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                      <mat-icon class="!text-[12px]">category</mat-icon>
                      {{ log.entityType }}
                    </span>
                    @if (log.entityId) {
                      <span class="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                        <mat-icon class="!text-[12px]">fingerprint</mat-icon>
                        {{ log.entityId.substring(0, 8) }}...
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
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
    const url = this.router.url;
    this.isGlobal.set(url.includes('/pdt/history') || url.includes('/head/history'));
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
