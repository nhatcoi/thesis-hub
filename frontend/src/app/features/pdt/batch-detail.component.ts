import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BatchService, ThesisBatch, BatchStatus } from '../../core/batch.service';

@Component({
    selector: 'app-batch-detail',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center space-x-3">
        <button (click)="goBack()" class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Chi tiết đợt đồ án</h2>
          <p class="text-sm text-gray-500">Xem thông tin cấu hình và lộ trình của đợt.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (batch(); as b) {
        <!-- Content -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left: Overview Card -->
          <div class="md:col-span-1 space-y-6">
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tổng quan</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-[11px] font-bold text-gray-400">Trạng thái</p>
                  <span [class]="statusBadgeClass(b.status)" class="mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium inline-block">
                    {{ statusLabel(b.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-gray-400">Niên khóa</p>
                  <p class="text-sm font-bold text-gray-900">{{ b.academicYearName }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-gray-400">Học kỳ</p>
                  <p class="text-sm font-bold text-indigo-600">Học kỳ {{ b.semester }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-gray-400">Người tạo</p>
                  <p class="text-sm font-medium text-gray-700">{{ b.createdByName }}</p>
                </div>
                <div class="pt-4 border-t border-gray-50">
                  <p class="text-[10px] text-gray-400">Lần cuối cập nhật: {{ b.updatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Details -->
          <div class="md:col-span-2 space-y-6">
            <!-- Name Card -->
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h1 class="text-xl font-black text-gray-900">{{ b.name }}</h1>
            </div>

            <!-- Timeline Card -->
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="text-sm font-bold text-gray-800 mb-6 border-b border-gray-50 pb-3 flex items-center gap-2">
                <mat-icon class="text-indigo-500 !text-[20px]">event_note</mat-icon>
                Lộ trình chi tiết
              </h3>

              <div class="space-y-8 relative">
                <!-- Phase 1 -->
                <div class="relative pl-8 border-l-2 border-indigo-100 pb-8 last:pb-0">
                  <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500"></div>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-bold text-gray-900">Đăng ký đề tài</h4>
                      <p class="text-xs text-gray-500 mt-1">Giai đoạn giảng viên đề xuất và sinh viên chọn lựa đề tài.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-indigo-600">{{ b.topicRegStart | date:'dd/MM/yyyy' }}</p>
                      <p class="text-xs font-bold text-indigo-600">đến {{ b.topicRegEnd | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Phase 2 -->
                <div class="relative pl-8 border-l-2 border-blue-100 pb-8 last:pb-0">
                  <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-bold text-gray-900">Lập & Duyệt đề cương</h4>
                      <p class="text-xs text-gray-500 mt-1">Sinh viên nộp đề cương chi tiết để giảng viên hướng dẫn phê duyệt.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-blue-600">{{ b.outlineStart | date:'dd/MM/yyyy' }}</p>
                      <p class="text-xs font-bold text-blue-600">đến {{ b.outlineEnd | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Phase 3 -->
                <div class="relative pl-8 border-l-2 border-green-100 pb-8 last:pb-0">
                  <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-bold text-gray-900">Thực hiện đồ án</h4>
                      <p class="text-xs text-gray-500 mt-1">Giai đoạn tập trung nghiên cứu, CODE và viết báo cáo chính thức.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-green-600">{{ b.implementationStart | date:'dd/MM/yyyy' }}</p>
                      <p class="text-xs font-bold text-green-600">đến {{ b.implementationEnd | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Phase 4 -->
                <div class="relative pl-8 border-l-2 border-orange-100 pb-8 last:pb-0">
                  <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500"></div>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-bold text-gray-900">Xét duyệt bảo vệ</h4>
                      <p class="text-xs text-gray-500 mt-1">Giai đoạn đăng ký và phê duyệt điều kiện để ra hội đồng bảo vệ.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-orange-600">{{ b.defenseRegStart | date:'dd/MM/yyyy' }}</p>
                      <p class="text-xs font-bold text-orange-600">đến {{ b.defenseRegEnd | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Phase 5 -->
                @if (b.defenseStart) {
                  <div class="relative pl-8 border-l-2 border-red-100 last:pb-0">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-500"></div>
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="text-sm font-bold text-gray-900">Bảo vệ chính thức</h4>
                        <p class="text-xs text-gray-500 mt-1">Lịch biểu các hội đồng chấm đồ án tốt nghiệp.</p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs font-bold text-red-600">{{ b.defenseStart | date:'dd/MM/yyyy' }}</p>
                        <p class="text-xs font-bold text-red-600">đến {{ b.defenseEnd | date:'dd/MM/yyyy' }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      } @else if (error()) {
        <div class="p-8 bg-red-50 rounded-2xl text-center border border-red-100">
           <mat-icon class="text-red-400 !text-[48px] h-auto w-auto mb-2">error_outline</mat-icon>
           <h3 class="text-lg font-bold text-red-900">Không tìm thấy thông tin</h3>
           <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
           <button (click)="goBack()" class="mt-4 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold">Quay lại danh sách</button>
        </div>
      }
    </div>
  `
})
export class BatchDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private batchService = inject(BatchService);

    batch = signal<ThesisBatch | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Mã đợt đồ án không hợp lệ.');
            this.loading.set(false);
            return;
        }

        this.batchService.getBatch(id).subscribe({
            next: data => {
                this.batch.set(data);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err?.error?.message || 'Không thể tải chi tiết đợt đồ án này.');
                this.loading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/pdt/batches']);
    }

    statusLabel(s: BatchStatus): string {
        return { DRAFT: 'Bản nháp', ACTIVE: 'Đang hoạt động', CLOSED: 'Đã đóng', ARCHIVED: 'Lưu trữ' }[s];
    }

    statusBadgeClass(s: BatchStatus): string {
        const classes: any = {
            DRAFT: 'bg-yellow-100 text-yellow-800',
            ACTIVE: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800',
            ARCHIVED: 'bg-blue-100 text-blue-800',
        };
        return classes[s] || 'bg-gray-100 text-gray-800';
    }
}
