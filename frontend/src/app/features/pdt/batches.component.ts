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
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Quản lý đợt đồ án</h2>
          <p class="mt-1 text-sm text-gray-500">Thiết lập và theo dõi các đợt đồ án tốt nghiệp trong hệ thống.</p>
        </div>
        <button (click)="goToCreate()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
          <mat-icon class="mr-2 !text-[20px]">add</mat-icon>
          Tạo đợt đồ án mới
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pt-1">
            <mat-icon class="text-gray-400">search</mat-icon>
          </span>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
            placeholder="Tìm theo tên đợt, năm học..."
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all border">
        </div>
        
        <div class="w-full md:w-48">
          <select [(ngModel)]="statusFilter" (change)="refresh()"
            class="block w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border transition-all">
            <option [ngValue]="null">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
      </div>

      <!-- Batch Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th (click)="toggleSort('name')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                   <div class="flex items-center gap-1">
                      Tên đợt đồ án
                      <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'name'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                   </div>
                </th>
                <th (click)="toggleSort('academicYear.name')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                   <div class="flex items-center gap-1">
                      Năm học - HK
                      <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'academicYear.name'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                   </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mốc thời gian chính</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (batch of batches(); track batch.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ batch.name }}</div>
                    <div class="text-xs text-gray-400">Người tạo: {{ batch.createdByName }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-medium">{{ batch.academicYearName }}</div>
                    <div class="text-xs text-gray-500">Học kỳ {{ batch.semester }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-xs text-gray-600">
                      <p>ĐK đề tài: {{ batch.topicRegStart | date:'dd/MM' }} - {{ batch.topicRegEnd | date:'dd/MM' }}</p>
                      <p>Thực hiện: {{ batch.implementationStart | date:'dd/MM' }} - {{ batch.implementationEnd | date:'dd/MM' }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="statusBadgeClass(batch.status)">
                      {{ statusLabel(batch.status) }}
                    </span>
                  </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-1">
                      @if (batch.status === 'DRAFT') {
                        <button (click)="activate(batch)" title="Kích hoạt" class="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors">
                          <mat-icon class="!text-[20px]">play_circle</mat-icon>
                        </button>
                        <button (click)="remove(batch)" title="Xóa" class="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                          <mat-icon class="!text-[20px]">delete_outline</mat-icon>
                        </button>
                      }
                      @if (batch.status === 'ACTIVE') {
                        <button (click)="close(batch)" title="Đóng đợt" class="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors">
                          <mat-icon class="!text-[20px]">lock_outline</mat-icon>
                        </button>
                      }
                      <button (click)="viewDetail(batch.id)" class="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                        <mat-icon class="!text-[20px]">visibility</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                @if (loading()) {
                  <tr>
                    <td colspan="5" class="px-6 py-10 text-center">
                      <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                } @else {
                  <tr>
                    <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500 font-medium">
                       CHƯA CÓ DỮ LIỆU ĐỢT ĐỒ ÁN
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-700 font-medium font-mono">
               SHOWING: {{ page() * size() + 1 }} - {{ Math.min((page() + 1) * size(), totalElements()) }} OF {{ totalElements() }}
            </div>
            <div class="flex space-x-2">
               <button (click)="changePage(-1)" [disabled]="page() === 0" 
                 class="px-4 py-2 text-sm font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all">Trước</button>
               <button (click)="changePage(1)" [disabled]="page() === totalPages() - 1" 
                 class="px-4 py-2 text-sm font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all">Sau</button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Confirm Modal -->
    @if (confirmAction()) {
      <div class="fixed inset-0 bg-gray-500/75 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4"
              [class]="confirmAction()!.type === 'delete' ? 'bg-red-100' : 'bg-amber-100'">
              <mat-icon [class]="confirmAction()!.type === 'delete' ? 'text-red-600' : 'text-amber-600'">
                {{ confirmAction()!.type === 'delete' ? 'delete' : 'report_problem' }}
              </mat-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ confirmAction()!.title }}</h3>
              <p class="mt-2 text-sm text-gray-500">{{ confirmAction()!.message }}</p>
            </div>
          </div>
          <div class="mt-8 flex justify-end space-x-3">
            <button (click)="cancelConfirm()"
              class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              Hủy bỏ
            </button>
            <button (click)="executeConfirm()"
              [class]="confirmAction()!.type === 'delete' ? 'bg-red-600 hover:bg-red-700 font-bold' : 'bg-indigo-600 hover:bg-indigo-700 font-bold'"
              class="px-5 py-2 text-sm text-white rounded-xl transition-all disabled:opacity-50">
              {{ confirming() ? 'Đang xử lý...' : confirmAction()!.confirmLabel }}
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
