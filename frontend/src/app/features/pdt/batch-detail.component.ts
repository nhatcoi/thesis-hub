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
    <div class="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      <!-- Header -->
      <div class="app-section-header flex items-center gap-3">
        <button (click)="goBack()" class="app-btn-secondary !p-1.5 !rounded-full">
          <mat-icon class="!text-lg">arrow_back</mat-icon>
        </button>
        <div>
          <h2 class="app-title">Chi tiết Đợt Đồ án</h2>
          <p class="app-subtitle italic font-mono uppercase tracking-tighter">Xem cấu hình thời gian và trạng thái vận hành hiện tại.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="app-card p-20 text-center">
          <div class="flex justify-center mb-2"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Đang truy xuất dữ liệu đợt...</p>
        </div>
      } @else if (batch(); as b) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 italic">
          <!-- Sidebar Info -->
          <div class="lg:col-span-1 space-y-4">
            <div class="app-card p-5 space-y-4">
              <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 italic">Thông tin chung</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Trạng thái vận hành</p>
                  <span [class]="statusBadgeClass(b.status)" class="app-badge font-bold uppercase tracking-wider !text-[9px]">
                    {{ statusLabel(b.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Niên khóa áp dụng</p>
                  <p class="text-xs font-bold text-gray-900">{{ b.academicYearName }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Học kỳ đào tạo</p>
                  <p class="text-xs font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4 decoration-2">Học kỳ {{ b.semester }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Người phụ trách khai báo</p>
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-black italic">{{ b.createdByName.charAt(0) }}</div>
                    <p class="text-xs font-bold text-gray-700">{{ b.createdByName }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="app-card p-4 bg-gray-50/50 border-dashed">
                <p class="text-[9px] text-gray-400 font-bold tracking-tighter">Cập nhật lần cuối</p>
                <p class="text-[10px] font-mono text-gray-500 font-bold mt-0.5">{{ b.updatedAt | date:'dd/MM/yyyy • HH:mm' }}</p>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-4">
            <div class="app-card p-6 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100/50 shadow-indigo-50/20">
               <h1 class="text-lg font-black text-gray-900 leading-tight">{{ b.name }}</h1>
            </div>

            <div class="app-card p-5">
              <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2 flex items-center gap-2 italic">
                <mat-icon class="text-indigo-500 !text-base">event_note</mat-icon>
                Lộ trình chi tiết (Timeline)
              </h3>

              <div class="space-y-6 relative ml-2">
                <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                <!-- Phase 1 -->
                <div class="flex gap-4 relative">
                  <div class="w-6 h-6 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  </div>
                  <div class="flex-1 flex justify-between items-start">
                    <div>
                      <h4 class="text-xs font-black text-indigo-700 uppercase tracking-tighter">Đăng ký Đề tài</h4>
                      <p class="text-[10px] text-gray-500 mt-0.5 italic">Thời gian giảng viên công bố & sinh viên lựa chọn.</p>
                    </div>
                    <div class="text-right font-mono text-[10px] font-bold text-indigo-600 leading-tight flex flex-col items-end">
                      <span>{{ b.topicRegStart | date:'dd/MM HH:mm' }}</span>
                      <span class="text-[9px] text-gray-300">|</span>
                      <span>{{ b.topicRegEnd | date:'dd/MM HH:mm' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Phase 2 -->
                <div class="flex gap-4 relative">
                  <div class="w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <div class="flex-1 flex justify-between items-start">
                    <div>
                      <h4 class="text-xs font-black text-blue-700 uppercase tracking-tighter">Lập & Duyệt Đề cương</h4>
                      <p class="text-[10px] text-gray-500 mt-0.5 italic">Giai đoạn định hướng nội dung và phê duyệt.</p>
                    </div>
                    <div class="text-right font-mono text-[10px] font-bold text-blue-600 leading-tight flex flex-col items-end">
                      <span>{{ b.outlineStart | date:'dd/MM HH:mm' }}</span>
                      <span class="text-[9px] text-gray-300">|</span>
                      <span>{{ b.outlineEnd | date:'dd/MM HH:mm' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Phase 3 -->
                <div class="flex gap-4 relative">
                  <div class="w-6 h-6 rounded-full bg-white border-2 border-green-500 flex items-center justify-center z-10 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <div class="flex-1 flex justify-between items-start">
                    <div>
                      <h4 class="text-xs font-black text-green-700 uppercase tracking-tighter">Thực hiện Đồ án</h4>
                      <p class="text-[10px] text-gray-500 mt-0.5 italic">Giai đoạn code, thí nghiệm và viết báo cáo.</p>
                    </div>
                    <div class="text-right font-mono text-[10px] font-bold text-green-600 leading-tight flex flex-col items-end">
                      <span>{{ b.implementationStart | date:'dd/MM HH:mm' }}</span>
                      <span class="text-[9px] text-gray-300">|</span>
                      <span>{{ b.implementationEnd | date:'dd/MM HH:mm' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Phase 4 -->
                <div class="flex gap-4 relative">
                  <div class="w-6 h-6 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center z-10 shadow-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  </div>
                  <div class="flex-1 flex justify-between items-start">
                    <div>
                      <h4 class="text-xs font-black text-orange-700 uppercase tracking-tighter">Xét duyệt Bảo vệ</h4>
                      <p class="text-[10px] text-gray-500 mt-0.5 italic">Đăng ký điều kiện đủ tư cách ra hội đồng.</p>
                    </div>
                    <div class="text-right font-mono text-[10px] font-bold text-orange-600 leading-tight flex flex-col items-end">
                      <span>{{ b.defenseRegStart | date:'dd/MM HH:mm' }}</span>
                      <span class="text-[9px] text-gray-300">|</span>
                      <span>{{ b.defenseRegEnd | date:'dd/MM HH:mm' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Phase 5 -->
                @if (b.defenseStart) {
                  <div class="flex gap-4 relative">
                    <div class="w-6 h-6 rounded-full bg-white border-2 border-red-500 flex items-center justify-center z-10 shadow-sm">
                      <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                    <div class="flex-1 flex justify-between items-start">
                      <div>
                        <h4 class="text-xs font-black text-red-700 uppercase tracking-tighter">Hội đồng Bảo vệ</h4>
                        <p class="text-[10px] text-gray-500 mt-0.5 italic">Lịch biểu bảo vệ chính thức của khoa/viện.</p>
                      </div>
                      <div class="text-right font-mono text-[10px] font-bold text-red-600 leading-tight flex flex-col items-end">
                        <span>{{ b.defenseStart | date:'dd/MM HH:mm' }}</span>
                        <span class="text-[9px] text-gray-300">|</span>
                        <span>{{ b.defenseEnd | date:'dd/MM HH:mm' }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      } @else if (error()) {
        <div class="app-card p-10 text-center border-red-100 bg-red-50/20 italic">
          <mat-icon class="text-red-400 !text-3xl mb-2">report_problem</mat-icon>
          <h3 class="text-sm font-bold text-gray-900">Không tìm thấy thông tin</h3>
          <p class="text-xs text-gray-500 mt-1 italic">{{ error() }}</p>
          <button (click)="goBack()" class="app-btn-secondary mt-4">Quay lại danh sách</button>
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
