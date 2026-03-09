import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThesisService } from '../../core/thesis.service';
import { ProgressService, ProgressUpdateResponse } from '../../core/progress.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="app-section-header">
        <h2 class="app-title truncate max-w-lg">Cập nhật tiến độ</h2>
        <p class="app-subtitle italic flex flex-wrap items-center gap-x-4 gap-y-1">
          @if (batchName()) {
            <span>Báo cáo tiến độ thực hiện đồ án theo tuần.</span>
            @if (implStart() && implEnd()) {
              <span class="flex items-center gap-1.5 text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50 font-mono">
                <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">event</mat-icon>
                Giai đoạn: {{ implStart() | date:'dd/MM/yyyy' }} - {{ implEnd() | date:'dd/MM/yyyy' }}
              </span>
              @if (isAfterImpl()) {
                <span class="flex items-center gap-1 text-red-500 font-black uppercase tracking-tighter">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">alarm_off</mat-icon>
                  (Đã kết thúc)
                </span>
              }
            }
          } @else {
            Bạn cần tham gia đợt ĐATN và được phân công đề tài trước.
          }
        </p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (!batchName()) {
        <div class="app-card p-12 text-center">
          <mat-icon class="!text-amber-400 !text-[28px]">info</mat-icon>
          <h3 class="text-sm font-bold text-gray-900 mt-2">Chưa tham gia đợt ĐATN</h3>
        </div>
      } @else if (!canSubmit()) {
        <div class="app-card p-12 text-center">
          <mat-icon class="!text-gray-300 !text-[28px]">lock</mat-icon>
          <h3 class="text-sm font-bold text-gray-900 mt-2">Chưa khả dụng</h3>
          <p class="text-xs text-gray-500 mt-1">
            @if (isBeforeImpl()) {
              Chưa đến giai đoạn thực hiện.
            } @else if (isAfterImpl()) {
              Đã kết thúc giai đoạn thực hiện.
            } @else {
              Đề cương cần được duyệt trước. Trạng thái: <strong>{{ thesisStatus() }}</strong>
            }
          </p>
        </div>
      } @else {
        <!-- Submit form -->
        <div class="app-card !p-5 space-y-4">
          <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
            <mat-icon class="!text-indigo-500 !text-[18px]">add_circle</mat-icon>
            Cập nhật tiến độ mới
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tuần</label>
              <input type="number" min="1" max="20" [(ngModel)]="weekNumber"
                class="app-select w-full !text-xs" placeholder="1">
            </div>
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tiêu đề</label>
              <input type="text" [(ngModel)]="title"
                class="app-select w-full !text-xs" placeholder="VD: Hoàn thành module đăng nhập">
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mô tả chi tiết</label>
            <textarea [(ngModel)]="description" rows="3"
              class="app-select w-full !text-xs resize-none" placeholder="Mô tả công việc đã làm..."></textarea>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">File đính kèm (tuỳ chọn)</label>
            <input #fileInput type="file" class="text-xs" (change)="onFileSelected($event)">
          </div>
          <div class="flex justify-end">
            <button (click)="submit()" [disabled]="submitting() || !weekNumber || !title"
              class="app-btn-primary !py-2 font-bold text-xs"
              [class.opacity-50]="!weekNumber || !title">
              @if (submitting()) {
                <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang gửi...
              } @else {
                <mat-icon class="!text-sm">send</mat-icon> Gửi cập nhật
              }
            </button>
          </div>
        </div>
      }

      <!-- History -->
      @if (!loading() && updates().length > 0) {
        <div class="app-card !p-0 overflow-hidden">
          <div class="p-5 pb-2">
            <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
              <mat-icon class="!text-gray-400 !text-[18px]">history</mat-icon>
              Lịch sử cập nhật
            </h3>
          </div>
          <div class="divide-y divide-gray-50">
            @for (u of updates(); track u.id) {
              <div class="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full"
                      [class]="u.status === 'REVIEWED' ? 'bg-emerald-500' : u.status === 'NEEDS_REVISION' ? 'bg-amber-500' : 'bg-blue-500'"></div>
                    <span class="text-xs font-bold text-gray-900">Tuần {{ u.weekNumber }} · {{ u.title }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] font-bold uppercase tracking-widest"
                      [class]="u.status === 'REVIEWED' ? 'text-emerald-600' : u.status === 'NEEDS_REVISION' ? 'text-amber-600' : 'text-blue-600'">
                      {{ u.status === 'SUBMITTED' ? 'Chờ nhận xét' : u.status === 'REVIEWED' ? 'Đã nhận xét' : 'Cần bổ sung' }}
                    </span>
                    <p class="text-[9px] text-gray-400 font-mono mt-0.5">{{ u.submittedAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
                @if (u.description) {
                  <p class="text-xs text-gray-500 mt-1">{{ u.description }}</p>
                }
                @if (u.fileName) {
                  <a [href]="progressService.getFileUrl(u.publicUrl)" target="_blank"
                    class="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline decoration-indigo-200 underline-offset-4 mt-1 inline-block">
                    📎 {{ u.fileName }}
                  </a>
                }
                @if (u.reviewerComment) {
                  <div class="mt-2 flex gap-1.5 items-start">
                    <span class="text-[10px] text-gray-400 shrink-0">💬</span>
                    <p class="text-[10px] text-gray-500 italic">{{ u.reviewerComment }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ProgressComponent implements OnInit {
  private thesisService = inject(ThesisService);
  public progressService = inject(ProgressService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  batchName = signal('');
  implStart = signal('');
  implEnd = signal('');
  thesisStatus = signal('');

  updates = signal<ProgressUpdateResponse[]>([]);
  submitting = signal(false);

  weekNumber = 1;
  title = '';
  description = '';
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.thesisService.getMyActiveBatch().subscribe({
      next: (batch) => {
        if (batch) {
          this.batchName.set(batch.batchName);
          this.implStart.set(batch.implementationStart);
          this.implEnd.set(batch.implementationEnd);
          this.thesisStatus.set(batch.thesisStatus || '');
        }
        this.loading.set(false);
        if (batch) this.loadUpdates();
      },
      error: () => this.loading.set(false)
    });
  }

  loadUpdates(): void {
    this.progressService.getMyProgress().subscribe({
      next: (data) => this.updates.set(data)
    });
  }

  canSubmit(): boolean {
    const status = this.thesisStatus();
    return (status === 'OUTLINE_APPROVED' || status === 'IN_PROGRESS')
        && !this.isBeforeImpl() && !this.isAfterImpl();
  }

  isBeforeImpl(): boolean {
    return this.implStart() ? new Date() < new Date(this.implStart()) : false;
  }

  isAfterImpl(): boolean {
    return this.implEnd() ? new Date() > new Date(this.implEnd()) : false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  submit(): void {
    if (!this.weekNumber || !this.title) return;
    this.submitting.set(true);

    this.progressService.submitProgress(this.weekNumber, this.title, this.description, this.selectedFile || undefined)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Cập nhật tiến độ thành công!', 'Đóng', { duration: 3000 });
          this.title = '';
          this.description = '';
          this.selectedFile = null;
          this.loadUpdates();
          // Refresh status
          this.thesisService.getMyActiveBatch().subscribe({
            next: (batch) => { if (batch) this.thesisStatus.set(batch.thesisStatus || ''); }
          });
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Có lỗi xảy ra', 'Đóng', { duration: 3000 });
        }
      });
  }
}
