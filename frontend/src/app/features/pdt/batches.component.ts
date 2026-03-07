import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchService, ThesisBatch, BatchStatus } from '../../core/batch.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="app-section-header flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="app-title">Quản lý đợt đồ án</h2>
          <p class="app-subtitle">Thiết lập và theo dõi các đợt đồ án tốt nghiệp trong hệ thống.</p>
        </div>
        <button (click)="goToCreate()" class="app-btn-primary">
          <mat-icon class="mr-1.5 !text-base">add</mat-icon> Tạo đợt đồ án mới
        </button>
      </div>

      <!-- Filters -->
      <div class="app-card p-3 flex flex-wrap gap-2 items-center">
        <div class="relative flex-grow min-w-[200px]">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-base text-gray-400">search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
            placeholder="Tìm theo tên đợt, năm học..." class="app-input pl-9" />
        </div>
        
        <select [(ngModel)]="statusFilter" (change)="refresh()" class="app-select min-w-[150px]">
          <option [ngValue]="null">Tất cả trạng thái</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      <!-- Table Content -->
      <div class="app-card">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th (click)="toggleSort('name')" class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors">
                  Tên đợt đồ án
                </th>
                <th (click)="toggleSort('academicYear.name')" class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors">
                  Năm học - HK
                </th>
                <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 italic">
              @for (batch of batches(); track batch.id) {
                <tr class="hover:bg-gray-50/50 transition-colors text-xs">
                  <td class="p-3">
                    <div class="font-bold text-gray-900">{{ batch.name }}</div>
                  </td>
                  <td class="p-3">
                    <div class="font-bold text-gray-700">{{ batch.academicYearName }}</div>
                    <div class="text-[10px] text-gray-400">Học kỳ {{ batch.semester }}</div>
                  </td>
                  <td class="p-3">
                    <div class="text-[10px] text-gray-500 leading-normal font-mono">
                      <div>Đăng ký: {{ batch.topicRegStart | date:'dd/MM HH:mm' }} - {{ batch.topicRegEnd | date:'dd/MM HH:mm' }}</div>
                      <div>Thực hiện: {{ batch.implementationStart | date:'dd/MM HH:mm' }} - {{ batch.implementationEnd | date:'dd/MM HH:mm' }}</div>
                    </div>
                  </td>
                  <td class="p-3">
                    <span [class]="statusBadgeClass(batch.status)" class="app-badge">
                      {{ statusLabel(batch.status) }}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <div class="flex justify-end gap-1">
                      @if (batch.status === 'DRAFT') {
                        <button (click)="activate(batch)" class="app-btn-ghost text-emerald-500" title="Kích hoạt">
                          <mat-icon class="!text-lg">play_circle</mat-icon>
                        </button>
                        <button (click)="remove(batch)" class="app-btn-ghost text-rose-500" title="Xóa">
                          <mat-icon class="!text-lg">delete_outline</mat-icon>
                        </button>
                      }
                      @if (batch.status === 'ACTIVE') {
                        <button (click)="close(batch)" class="app-btn-ghost text-amber-500" title="Đóng">
                          <mat-icon class="!text-lg">lock_outline</mat-icon>
                        </button>
                      }
                      <button (click)="viewDetail(batch.id)" class="app-btn-ghost text-indigo-500" title="Xem">
                        <mat-icon class="!text-lg">visibility</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                @if (loading()) {
                  <tr>
                    <td colspan="5" class="p-10 text-center text-xs">
                      <div class="flex justify-center"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
                    </td>
                  </tr>
                } @else {
                  <tr><td colspan="5" class="p-10 text-center text-[11px] text-gray-400 italic">CHƯA CÓ DỮ LIỆU ĐỢT ĐỒ ÁN</td></tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="p-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <div>Hiển thị <b>{{ page() * size() + 1 }}</b> - <b>{{ Math.min((page() + 1) * size(), totalElements()) }}</b> (Tổng <b>{{ totalElements() }}</b>)</div>
            <div class="flex gap-2">
              <button (click)="changePage(-1)" [disabled]="page() === 0" class="app-btn-secondary !px-3 !py-1 disabled:opacity-30">Trước</button>
              <button (click)="changePage(1)" [disabled]="page() === totalPages() - 1" class="app-btn-secondary !px-3 !py-1 disabled:opacity-30">Sau</button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Confirm Modal -->
    @if (confirmAction()) {
      <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full p-5 border border-gray-100 animate-in zoom-in-95 duration-200">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              [class]="confirmAction()!.type === 'delete' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'">
              <mat-icon class="!text-[22px]">{{ confirmAction()!.type === 'delete' ? 'delete' : 'priority_high' }}</mat-icon>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 leading-tight mb-1">{{ confirmAction()!.title }}</h3>
              <p class="text-[11px] text-gray-500 leading-relaxed">{{ confirmAction()!.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2 text-xs font-bold">
            <button (click)="cancelConfirm()" class="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded transition-colors">Hủy</button>
            <button (click)="executeConfirm()"
              [class]="confirmAction()!.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'"
              class="px-4 py-2 text-white rounded transition-all shadow-sm">
              {{ confirming() ? 'Đang thực hiện...' : confirmAction()!.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class BatchesComponent implements OnInit {
  private batchService = inject(BatchService);
  private router = inject(Router);

  batches = signal<ThesisBatch[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  page = signal(0);
  size = signal(50);
  loading = signal(false);
  sortBy = signal('createdAt');
  sortDir = signal<'asc' | 'desc'>('desc');

  error = signal<string | null>(null);
  statusFilter = signal<BatchStatus | null>(null);
  searchQuery = '';
  private searchSubject = new Subject<string>();
  Math = Math;

  confirmAction = signal<{
    type: 'activate' | 'close' | 'delete';
    batch: ThesisBatch;
    title: string;
    message: string;
    confirmLabel: string;
  } | null>(null);
  confirming = signal(false);

  ngOnInit(): void {
    this.refresh();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this.loading.set(true);
    this.batchService.listBatches({
      search: this.searchQuery,
      status: this.statusFilter(),
      page: this.page(),
      size: this.size(),
      sort: `${this.sortBy()},${this.sortDir()}`
    }).subscribe({
      next: data => {
        this.batches.set(data.content);
        this.totalElements.set(data.totalElements);
        this.totalPages.set(data.totalPages);
        this.loading.set(false);
      },
      error: err => {
        alert(err?.error?.message || 'Không thể tải dữ liệu.');
        this.loading.set(false);
      }
    });
  }

  toggleSort(column: string) {
    if (this.sortBy() === column) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDir.set('asc');
    }
    this.refresh();
  }

  changePage(delta: number) {
    this.page.update(p => p + delta);
    this.refresh();
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  goToCreate(): void {
    this.router.navigate(['/pdt/batch-create']);
  }

  viewDetail(id: string): void {
    this.router.navigate(['/pdt/batches', id]);
  }

  activate(batch: ThesisBatch): void {
    this.confirmAction.set({
      type: 'activate',
      batch,
      title: 'Kích hoạt đợt đồ án?',
      message: `Bắt đầu đợt "${batch.name}". Sinh viên sẽ có thể đăng ký đề tài ngay sau khi kích hoạt.`,
      confirmLabel: 'Xác nhận kích hoạt'
    });
  }

  close(batch: ThesisBatch): void {
    this.confirmAction.set({
      type: 'close',
      batch,
      title: 'Đóng đợt đồ án?',
      message: `Ngừng tiếp nhận mọi đăng ký và nộp bài trong đợt "${batch.name}". Bạn chắc chắn chứ?`,
      confirmLabel: 'Đóng đợt đồ án'
    });
  }

  remove(batch: ThesisBatch): void {
    this.confirmAction.set({
      type: 'delete',
      batch,
      title: 'Xóa đợt đồ án?',
      message: `Dữ liệu về đợt "${batch.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống.`,
      confirmLabel: 'Xóa vĩnh viễn'
    });
  }

  cancelConfirm(): void {
    this.confirmAction.set(null);
  }

  executeConfirm(): void {
    const action = this.confirmAction();
    if (!action) return;
    this.confirming.set(true);

    const obs: any = action.type === 'activate'
      ? this.batchService.activateBatch(action.batch.id)
      : action.type === 'close'
        ? this.batchService.closeBatch(action.batch.id)
        : this.batchService.deleteBatch(action.batch.id);

    obs.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirmAction.set(null);
        this.refresh();
      },
      error: (err: any) => {
        this.confirming.set(false);
        alert(err?.error?.message || 'Có lỗi xảy ra.');
      }
    });
  }

  statusLabel(s: BatchStatus): string {
    return { DRAFT: 'Bản nháp', ACTIVE: 'Đang hoạt động', CLOSED: 'Đã đóng', ARCHIVED: 'Lưu trữ' }[s];
  }

  statusBadgeClass(s: BatchStatus): string {
    const classes: any = {
      DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      CLOSED: 'bg-gray-50 text-gray-700 border-gray-200',
      ARCHIVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return (classes[s] || 'bg-gray-50 text-gray-700 border-gray-200') + ' px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded-full border';
  }
}
