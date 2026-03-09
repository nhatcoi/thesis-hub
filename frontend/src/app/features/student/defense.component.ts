import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThesisService } from '../../core/thesis.service';
import { DefenseService, DefenseRegistrationResponse } from '../../core/defense.service';

@Component({
  selector: 'app-student-defense',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="app-section-header">
        <h2 class="app-title truncate max-w-lg">
          @if (batchName()) {
            Đăng ký bảo vệ — <span class="text-indigo-600">{{ batchName() }}</span>
          } @else {
            Đăng ký bảo vệ đồ án
          }
        </h2>
        <p class="app-subtitle italic flex flex-wrap items-center gap-x-4 gap-y-1">
          @if (batchName()) {
            <span>Upload hồ sơ bảo vệ: báo cáo, source code, slide.</span>
            @if (defenseRegStart() && defenseRegEnd()) {
              <span class="flex items-center gap-1.5 text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50 font-mono">
                <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">event</mat-icon>
                Giai đoạn: {{ defenseRegStart() | date:'dd/MM/yyyy HH:mm' }} - {{ defenseRegEnd() | date:'dd/MM/yyyy HH:mm' }}
              </span>
              @if (isAfterPeriod()) {
                <span class="flex items-center gap-1 text-red-500 font-black uppercase tracking-tighter">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">alarm_off</mat-icon>
                  (Đã kết thúc)
                </span>
              }
            }
          } @else {
            Bạn cần tham gia đợt ĐATN trước.
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
      } @else if (currentReg()) {
        <!-- Already registered -->
        <div class="app-card !p-5 space-y-4">
          <div class="flex items-center gap-3">
            <mat-icon class="!text-emerald-500 !text-[20px]">check_circle</mat-icon>
            <span class="text-sm font-bold text-gray-900">Đã đăng ký bảo vệ</span>
            <span class="text-[10px] font-bold uppercase tracking-widest"
              [class]="currentReg()!.status === 'APPROVED' ? 'text-emerald-600' : currentReg()!.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600'">
              {{ currentReg()!.status === 'SUBMITTED' ? 'Chờ xét duyệt' : currentReg()!.status === 'APPROVED' ? 'Đã duyệt' : 'Bị từ chối' }}
            </span>
          </div>
          <p class="text-[9px] text-gray-400 font-mono">Ngày nộp: {{ currentReg()!.submittedAt | date:'dd/MM/yyyy HH:mm' }}</p>

          <div class="space-y-2">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hồ sơ đã nộp</p>
            @for (f of getFiles(); track f.label) {
              <div class="flex items-center gap-2">
                <mat-icon class="!w-4 !h-4 !text-[14px] text-gray-400">{{ f.icon }}</mat-icon>
                <a [href]="defenseService.getFileUrl(f.url)" target="_blank"
                  class="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline decoration-indigo-200 underline-offset-4">
                  {{ f.name }}
                </a>
                <span class="text-[10px] text-gray-400">({{ formatSize(f.size) }})</span>
              </div>
            }
          </div>

          @if (currentReg()!.note) {
            <p class="text-xs text-gray-500 italic">Ghi chú: {{ currentReg()!.note }}</p>
          }

          @if (currentReg()!.reviewerComment) {
            <div class="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nhận xét GVHD</p>
              <p class="text-xs text-gray-600">{{ currentReg()!.reviewerComment }}</p>
            </div>
          }

          @if (currentReg()!.status === 'REJECTED' && canResubmit()) {
            <button (click)="resetForm()" class="app-btn-primary !py-2 font-bold text-xs">
              <mat-icon class="!text-sm">refresh</mat-icon> Nộp lại hồ sơ
            </button>
          }
        </div>
      } @else if (!canSubmit()) {
        <div class="app-card p-12 text-center">
          <mat-icon class="!text-gray-300 !text-[28px]">lock</mat-icon>
          <h3 class="text-sm font-bold text-gray-900 mt-2">Chưa khả dụng</h3>
          <p class="text-xs text-gray-500 mt-1">
            @if (isBeforePeriod()) {
              Chưa đến giai đoạn xét duyệt bảo vệ.
            } @else if (isAfterPeriod()) {
              Đã kết thúc giai đoạn xét duyệt bảo vệ.
            } @else {
              Đồ án cần ở trạng thái "Đang thực hiện" (IN_PROGRESS). Trạng thái: <strong>{{ thesisStatus() }}</strong>
            }
          </p>
        </div>
      } @else {
        <!-- Submit form -->
        <div class="app-card !p-5 space-y-4">
          <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
            <mat-icon class="!text-indigo-500 !text-[18px]">upload_file</mat-icon>
            Nộp hồ sơ bảo vệ
          </h3>
          <p class="text-xs text-gray-500">Tải lên đầy đủ 3 file bắt buộc:</p>

          <div class="space-y-3">
            @for (f of fileFields; track f.key) {
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  {{ f.label }} <span class="text-red-400">*</span>
                </label>
                <div class="flex items-center gap-2">
                  <mat-icon class="!text-gray-400 !text-[16px]">{{ f.icon }}</mat-icon>
                  <input type="file" class="text-xs" [accept]="f.accept" (change)="onFileSelected($event, f.key)">
                </div>
                @if (selectedFiles[f.key]) {
                  <p class="text-[10px] text-emerald-600 mt-0.5">✓ {{ selectedFiles[f.key]!.name }} ({{ formatSize(selectedFiles[f.key]!.size) }})</p>
                }
              </div>
            }
          </div>

          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ghi chú (tuỳ chọn)</label>
            <textarea [(ngModel)]="note" rows="2"
              class="app-select w-full !text-xs resize-none" placeholder="Ghi chú thêm..."></textarea>
          </div>

          <div class="flex justify-end">
            <button (click)="submit()" [disabled]="submitting() || !allFilesSelected()"
              class="app-btn-primary !py-2 font-bold text-xs"
              [class.opacity-50]="!allFilesSelected()">
              @if (submitting()) {
                <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang nộp...
              } @else {
                <mat-icon class="!text-sm">send</mat-icon> Đăng ký bảo vệ
              }
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DefenseComponent implements OnInit {
  private thesisService = inject(ThesisService);
  public defenseService = inject(DefenseService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  batchName = signal('');
  defenseRegStart = signal('');
  defenseRegEnd = signal('');
  thesisStatus = signal('');
  currentReg = signal<DefenseRegistrationResponse | null>(null);
  submitting = signal(false);

  note = '';
  selectedFiles: Record<string, File | null> = { report: null, sourceCode: null, slide: null };

  fileFields = [
    { key: 'report', label: 'Báo cáo cuối', icon: 'description', accept: '.pdf,.doc,.docx' },
    { key: 'sourceCode', label: 'Source code', icon: 'code', accept: '.zip,.rar,.7z,.tar.gz' },
    { key: 'slide', label: 'Slide trình bày', icon: 'slideshow', accept: '.pptx,.ppt,.pdf' }
  ];

  ngOnInit(): void {
    this.thesisService.getMyActiveBatch().subscribe({
      next: (batch) => {
        if (batch) {
          this.batchName.set(batch.batchName);
          this.defenseRegStart.set(batch.defenseRegStart);
          this.defenseRegEnd.set(batch.defenseRegEnd);
          this.thesisStatus.set(batch.thesisStatus || '');
        }
        this.loading.set(false);
        if (batch) this.loadRegistration();
      },
      error: () => this.loading.set(false)
    });
  }

  loadRegistration(): void {
    this.defenseService.getMyRegistration().subscribe({
      next: (reg) => this.currentReg.set(reg)
    });
  }

  canSubmit(): boolean {
    const status = this.thesisStatus();
    return (status === 'IN_PROGRESS' || status === 'DEFENSE_REJECTED') && !this.isBeforePeriod() && !this.isAfterPeriod();
  }

  canResubmit(): boolean {
    return !this.isBeforePeriod() && !this.isAfterPeriod();
  }

  resetForm(): void {
    this.currentReg.set(null);
  }

  isBeforePeriod(): boolean {
    return this.defenseRegStart() ? new Date() < new Date(this.defenseRegStart()) : false;
  }

  isAfterPeriod(): boolean {
    return this.defenseRegEnd() ? new Date() > new Date(this.defenseRegEnd()) : false;
  }

  allFilesSelected(): boolean {
    return !!(this.selectedFiles['report'] && this.selectedFiles['sourceCode'] && this.selectedFiles['slide']);
  }

  onFileSelected(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles[key] = input.files?.[0] || null;
  }

  getFiles(): { label: string; icon: string; name: string; size: number; url?: string }[] {
    const r = this.currentReg();
    if (!r) return [];
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

  submit(): void {
    if (!this.allFilesSelected()) return;
    this.submitting.set(true);

    this.defenseService.registerDefense(
      this.selectedFiles['report']!, this.selectedFiles['sourceCode']!, this.selectedFiles['slide']!,
      this.note || undefined
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Đã đăng ký bảo vệ thành công!', 'Đóng', { duration: 3000 });
        this.loadRegistration();
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
