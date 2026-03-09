import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DefenseService, DefenseRegistrationResponse } from '../../core/defense.service';

@Component({
  selector: 'app-lecturer-defenses',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="app-section-header">
        <h2 class="app-title">Duyệt đăng ký bảo vệ</h2>
        <p class="app-subtitle">Xem hồ sơ bảo vệ và phê duyệt đăng ký của sinh viên.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (regs().length === 0) {
        <div class="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-gray-300 !text-[32px]">shield</mat-icon>
          </div>
          <h3 class="text-sm font-bold text-gray-900">Không có hồ sơ bảo vệ</h3>
          <p class="text-xs text-gray-500 mt-1">Chưa có sinh viên nào đăng ký bảo vệ.</p>
        </div>
      } @else {
        <!-- Filter tabs -->
        <div class="flex gap-2">
          @for (tab of tabs; track tab.value) {
            <button (click)="activeTab.set(tab.value)"
              class="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
              [class]="activeTab() === tab.value
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'">
              {{ tab.label }} ({{ countByStatus(tab.value) }})
            </button>
          }
        </div>

        <div class="grid gap-4">
          @for (r of filteredRegs(); track r.id) {
            <div class="app-card !p-0 overflow-hidden">
              <div class="flex flex-col lg:flex-row">
                <!-- Info -->
                <div class="flex-grow p-6 space-y-3">
                  <div class="flex items-center gap-3">
                    <span class="app-badge !px-2.5 !py-1 !font-black !text-[10px]"
                      [class]="r.status === 'APPROVED' ? '!bg-emerald-50 !text-emerald-600 !border-emerald-100' : r.status === 'REJECTED' ? '!bg-red-50 !text-red-600 !border-red-100' : '!bg-amber-50 !text-amber-600 !border-amber-100'">
                      {{ r.status === 'SUBMITTED' ? 'CHỜ DUYỆT' : r.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI' }}
                    </span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                      {{ r.submittedAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>

                  <div>
                    <h3 class="text-sm font-black text-gray-900 leading-tight mb-1">{{ r.topicTitle || 'Chưa có đề tài' }}</h3>
                    <div class="flex items-center gap-2 text-[11px] font-bold text-indigo-600">
                      <mat-icon class="!w-4 !h-4 !text-[16px]">account_circle</mat-icon>
                      <span>{{ r.studentName }} ({{ r.studentCode }})</span>
                    </div>
                  </div>

                  <!-- Files -->
                  <div class="space-y-1.5">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hồ sơ</p>
                    @for (f of getFiles(r); track f.label) {
                      <div class="flex items-center gap-2">
                        <mat-icon class="!w-4 !h-4 !text-[14px] text-gray-400">{{ f.icon }}</mat-icon>
                        <a [href]="defenseService.getFileUrl(f.url)" target="_blank"
                          class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4">
                          {{ f.name }}
                        </a>
                        <span class="text-[10px] text-gray-400">({{ formatSize(f.size) }})</span>
                      </div>
                    }
                  </div>

                  @if (r.note) {
                    <p class="text-xs text-gray-500 italic">Ghi chú SV: {{ r.note }}</p>
                  }

                  @if (r.reviewerComment) {
                    <div class="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nhận xét</p>
                      <p class="text-xs text-gray-600">{{ r.reviewerComment }}</p>
                    </div>
                  }
                </div>

                <!-- Actions -->
                @if (r.status === 'SUBMITTED') {
                  <div class="lg:w-72 shrink-0 bg-gray-50/80 p-6 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-center">
                    <div class="space-y-3">
                      <div>
                        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Nhận xét</label>
                        <textarea [id]="'comment-' + r.id" rows="3" placeholder="Nhận xét cho sinh viên..."
                          class="app-select w-full !text-xs font-medium border-gray-200 resize-none"></textarea>
                      </div>
                      <div class="flex gap-2">
                        <button (click)="review(r, 'APPROVED')"
                          [disabled]="processingId() === r.id"
                          class="app-btn-primary flex-1 justify-center !py-2 font-black uppercase tracking-widest text-[10px]">
                          @if (processingId() === r.id && processingAction() === 'approve') {
                            <div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          } @else {
                            <mat-icon class="!text-sm">check_circle</mat-icon> Duyệt
                          }
                        </button>
                        <button (click)="review(r, 'REJECTED')"
                          [disabled]="processingId() === r.id"
                          class="app-btn-ghost !text-red-600 hover:!bg-red-50 flex-1 justify-center !py-2 font-black uppercase tracking-widest text-[10px]">
                          @if (processingId() === r.id && processingAction() === 'reject') {
                            <div class="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                          } @else {
                            <mat-icon class="!text-sm">cancel</mat-icon> Từ chối
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DefensesComponent implements OnInit {
  public defenseService = inject(DefenseService);
  private snackBar = inject(MatSnackBar);

  regs = signal<DefenseRegistrationResponse[]>([]);
  loading = signal(true);
  processingId = signal<string | null>(null);
  processingAction = signal<string | null>(null);
  activeTab = signal('ALL');

  tabs = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'SUBMITTED', label: 'Chờ duyệt' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'REJECTED', label: 'Từ chối' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.defenseService.getAdvisingDefenses().subscribe({
      next: (data) => { this.regs.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  countByStatus(status: string): number {
    if (status === 'ALL') return this.regs().length;
    return this.regs().filter(r => r.status === status).length;
  }

  filteredRegs(): DefenseRegistrationResponse[] {
    if (this.activeTab() === 'ALL') return this.regs();
    return this.regs().filter(r => r.status === this.activeTab());
  }

  getFiles(r: DefenseRegistrationResponse): { label: string; icon: string; name: string; size: number; url?: string }[] {
    return [
      { label: 'Báo cáo', icon: 'description', name: r.reportName, size: r.reportSize, url: r.reportUrl },
      { label: 'Source code', icon: 'code', name: r.sourceCodeName, size: r.sourceCodeSize, url: r.sourceCodeUrl },
      { label: 'Slide', icon: 'slideshow', name: r.slideName, size: r.slideSize, url: r.slideUrl }
    ];
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  review(r: DefenseRegistrationResponse, status: string): void {
    const comment = (document.getElementById('comment-' + r.id) as HTMLTextAreaElement)?.value?.trim() || '';
    if (status === 'REJECTED' && !comment) {
      this.snackBar.open('Vui lòng nhập nhận xét khi từ chối', 'Đóng', { duration: 3000 });
      return;
    }

    this.processingId.set(r.id);
    this.processingAction.set(status === 'APPROVED' ? 'approve' : 'reject');

    this.defenseService.reviewDefense(r.id, status, comment).subscribe({
      next: () => {
        this.snackBar.open(
          status === 'APPROVED' ? 'Đã duyệt đăng ký bảo vệ' : 'Đã từ chối đăng ký bảo vệ',
          'Đóng', { duration: 3000 }
        );
        this.processingId.set(null);
        this.processingAction.set(null);
        this.loadData();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Có lỗi xảy ra', 'Đóng', { duration: 3000 });
        this.processingId.set(null);
        this.processingAction.set(null);
      }
    });
  }
}
