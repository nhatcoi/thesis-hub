import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TopicService, Topic } from '../../core/topic.service';
import { TopicRegistrationService, TopicRegistration } from '../../core/topic-registration.service';
import { ThesisService } from '../../core/thesis.service';
import { StudentProposalDialogComponent } from './student-proposal-dialog.component';

@Component({
  selector: 'app-student-topics',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="app-section-header flex items-center justify-between">
        <div>
          <h2 class="app-title">
            @if (myBatchId()) {
              Bạn đang trong đợt làm ĐATN: <span class="text-indigo-600">{{ myBatchName() }}</span>
            } @else {
              Đăng ký đề tài
            }
          </h2>
          <p class="app-subtitle italic flex flex-wrap items-center gap-x-4 gap-y-1">
            @if (myBatchId()) {
              <span>Dưới đây là danh sách đề tài sẵn có phù hợp với bạn.</span>
              @if (topicRegStart() && topicRegEnd()) {
                <span class="flex items-center gap-1.5 text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50 font-mono">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">event</mat-icon>
                  Thời gian: {{ topicRegStart() | date:'dd/MM/yyyy HH:mm' }} - {{ topicRegEnd() | date:'dd/MM/yyyy HH:mm' }}
                </span>
                @if (isRegEnded()) {
                  <span class="flex items-center gap-1 text-red-500 font-black uppercase tracking-tighter">
                    <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">alarm_off</mat-icon>
                    (Đã kết thúc)
                  </span>
                }
              }
            } @else {
              Tìm kiếm và đăng ký đề tài đồ án tốt nghiệp từ danh sách các đề tài có sẵn.
            }
          </p>
        </div>
        @if (myBatchId() && !hasActiveRegistration() && !isRegEnded() && !isBeforeReg()) {
          <button (click)="openProposalDialog()" class="app-btn-primary animate-in zoom-in-95 duration-200">
            <mat-icon class="!text-sm">add</mat-icon>
            Đề xuất đề tài mới
          </button>
        }
      </div>

      <!-- No batch state -->
      @if (!loadingBatch() && !myBatchId()) {
        <div class="app-card">
          <div class="p-12 text-center">
            <div class="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <mat-icon class="!text-3xl text-amber-500">event_busy</mat-icon>
            </div>
            <h3 class="text-sm font-bold text-gray-900">Bạn chưa thuộc đợt đồ án nào</h3>
            <p class="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              Hiện tại bạn chưa được gán vào đợt làm đồ án đang hoạt động.<br>
              Vui lòng liên hệ <strong>Trưởng ngành</strong> hoặc <strong>Phòng Đào tạo</strong> để được hỗ trợ.
            </p>
          </div>
        </div>
      }

      <!-- Loading batch -->
      @if (loadingBatch()) {
        <div class="app-card">
          <div class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      }

      <!-- Main content (only when has batch) -->
      @if (!loadingBatch() && myBatchId()) {
        <div class="app-card">
          <!-- Batch info badge + Tabs -->

          <div class="app-tabs">
            <button (click)="activeTab.set('available')"
              [class]="activeTab() === 'available' ? 'app-tab-btn-active' : 'app-tab-btn-inactive'"
              class="app-tab-btn">
              Đề tài có sẵn
            </button>
            <button (click)="activeTab.set('my')"
              [class]="activeTab() === 'my' ? 'app-tab-btn-active' : 'app-tab-btn-inactive'"
              class="app-tab-btn">
              Đề tài đăng ký
              @if (myRegistrations().length > 0) {
                <span class="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 rounded">{{ myRegistrations().length }}</span>
              }
            </button>
          </div>

          <!-- Tab: Available Topics -->
          @if (activeTab() === 'available') {
            <div class="p-4">
              <!-- Search only -->
              <div class="mb-4">
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-base text-gray-400">search</mat-icon>
                  <input type="text" placeholder="Tìm theo tên đề tài..."
                    [(ngModel)]="searchText"
                    (input)="onSearchChange()"
                    class="app-input pl-9 w-full" />
                </div>
              </div>

              <!-- Topic List -->
              @if (loading()) {
                <div class="flex justify-center py-10">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (topics().length === 0) {
                <div class="p-10 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
                  <h3 class="text-sm font-bold text-gray-900">Không tìm thấy đề tài</h3>
                  <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Hiện chưa có đề tài nào khả dụng trong đợt này hoặc không phù hợp với bộ lọc.</p>
                </div>
              } @else {
                <div class="app-list-container">
                  @for (topic of topics(); track topic.id) {
                    <div class="app-list-item">
                      <div class="flex flex-col sm:flex-row justify-between gap-4">
                        <div class="flex-grow min-w-0">
                          <h3 class="text-sm font-bold text-gray-900 leading-snug">{{ topic.title }}</h3>
                          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-500">
                            <span class="flex items-center gap-1"><mat-icon class="!text-xs">person</mat-icon> GVHD: {{ topic.proposedByName }}</span>
                            @if (topic.majorName) {
                              <span class="bg-gray-100 px-1.5 py-0.5 rounded">{{ topic.majorName }}</span>
                            }
                          </div>
                          @if (topic.description) {
                            <p class="text-xs text-gray-500 mt-2 line-clamp-2">{{ topic.description }}</p>
                          }
                          @if (topic.requirements) {
                            <div class="mt-2">
                              <span class="app-badge border-amber-100 bg-amber-50 text-amber-700">YC: {{ topic.requirements }}</span>
                            </div>
                          }
                        </div>

                        <div class="flex flex-col items-end gap-2 shrink-0 sm:min-w-[140px]">
                          @if (getSlotsRemaining(topic) > 0) {
                            <span class="app-badge border-emerald-100 bg-emerald-50 text-emerald-700">Còn {{ getSlotsRemaining(topic) }} chỗ</span>
                          } @else {
                            <span class="app-badge border-gray-200 bg-gray-100 text-gray-500">Hết chỗ</span>
                          }
                          <div class="text-[11px] text-gray-400">{{ topic.currentStudents }}/{{ topic.maxStudents }} SV</div>
                          
                          @if (isAlreadyRegistered(topic.id)) {
                            <button disabled class="app-btn-secondary w-full justify-center !text-indigo-600 bg-indigo-50 border-indigo-100">Đã đăng ký</button>
                          } @else if (hasActiveRegistration()) {
                            <button disabled class="app-btn-secondary w-full justify-center !text-gray-400 bg-gray-50">Đã đăng ký đề tài khác</button>
                          } @else if (isBeforeReg()) {
                            <button disabled class="app-btn-secondary w-full justify-center !text-amber-600 bg-amber-50 border-amber-100">Chưa đến hạn</button>
                          } @else if (isRegEnded()) {
                            <button disabled class="app-btn-secondary w-full justify-center !text-red-500 bg-red-50 border-red-100">Đã hết hạn</button>
                          } @else if (getSlotsRemaining(topic) > 0) {
                            <button (click)="registerForTopic(topic)" [disabled]="registering()" class="app-btn-primary w-full justify-center">Đăng ký</button>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Tab: My Registrations -->
          @if (activeTab() === 'my') {
            <div class="p-4">
              @if (loadingRegistrations()) {
                <div class="flex justify-center py-10">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (myRegistrations().length === 0) {
                <div class="p-10 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/20">
                  <h3 class="text-sm font-bold text-gray-900">Chưa gửi yêu cầu nào</h3>
                  <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Hãy chọn đề tài từ tab "Đề tài có sẵn" và nhấn Đăng ký.</p>
                </div>
              } @else {
                <div class="app-list-container">
                  @for (reg of myRegistrations(); track reg.id) {
                    <div class="app-list-item !p-5">
                      <div class="flex flex-col md:flex-row justify-between gap-6">
                        <div class="flex-grow space-y-3">
                          <div class="flex items-center gap-3">
                            <span [class]="getRegStatusClass(reg.status)" class="app-badge">
                              {{ getRegStatusLabel(reg.status) }}
                            </span>
                            <span class="text-[11px] text-gray-400">Ngày gửi: {{ reg.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                          </div>

                          <div class="space-y-4">
                            <div>
                              <h3 class="text-lg font-bold text-gray-900 leading-tight">{{ reg.topicTitle }}</h3>
                              @if (reg.advisorName) {
                                <div class="flex items-center gap-1.5 text-indigo-600 font-bold text-[11px] mt-1.5 uppercase tracking-wide">
                                  <mat-icon class="!w-4 !h-4 !text-[16px]">person</mat-icon>
                                  GVHD: {{ reg.advisorName }}
                                </div>
                              }
                            </div>

                            @if (reg.topicDescription) {
                              <div class="bg-gray-50/80 p-4 rounded-xl border border-gray-100/50">
                                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mô tả chi tiết</span>
                                <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{{ reg.topicDescription }}</p>
                              </div>
                            }

                            @if (reg.topicRequirements) {
                              <div class="flex items-start gap-2">
                                <div class="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100 uppercase">
                                  Yêu cầu: {{ reg.topicRequirements }}
                                </div>
                              </div>
                            }

                            @if (reg.rejectReason) {
                              <div class="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 items-start">
                                <mat-icon class="text-red-500 !text-lg mt-0.5">warning</mat-icon>
                                <div class="text-xs text-red-700 leading-relaxed">
                                  <span class="font-bold uppercase tracking-wider block mb-0.5">Lý do từ chối</span>
                                  {{ reg.rejectReason }}
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TopicsComponent implements OnInit {
  private topicService = inject(TopicService);
  private regService = inject(TopicRegistrationService);
  private thesisService = inject(ThesisService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  activeTab = signal<'available' | 'my'>('available');
  topics = signal<Topic[]>([]);
  myRegistrations = signal<TopicRegistration[]>([]);
  loading = signal(true);
  loadingBatch = signal(true);
  loadingRegistrations = signal(true);
  registering = signal(false);

  hasActiveRegistration = signal(false);

  myBatchId = signal<string | null>(null);
  myBatchName = signal<string>('');
  topicRegStart = signal<string | null>(null);
  topicRegEnd = signal<string | null>(null);

  searchText = '';
  private searchTimeout: any;

  ngOnInit(): void {
    this.detectMyBatch();
    this.loadMyRegistrations();
  }

  /** Tự động phát hiện đợt ĐA mà SV đang thuộc → load đề tài đợt đó */
  detectMyBatch(): void {
    this.loadingBatch.set(true);
    this.thesisService.getMyActiveBatch().subscribe({
      next: (batch) => {
        if (batch && batch.batchId) {
          this.myBatchId.set(batch.batchId);
          this.myBatchName.set(batch.batchName);
          this.topicRegStart.set(batch.topicRegStart);
          this.topicRegEnd.set(batch.topicRegEnd);
          this.loadTopics();
        } else {
          this.myBatchId.set(null);
          this.loading.set(false);
        }
        this.loadingBatch.set(false);
      },
      error: () => {
        this.myBatchId.set(null);
        this.loadingBatch.set(false);
        this.loading.set(false);
      }
    });
  }

  isRegEnded(): boolean {
    if (!this.topicRegEnd()) return false;
    const end = new Date(this.topicRegEnd()!);
    return new Date() > end;
  }

  isBeforeReg(): boolean {
    if (!this.topicRegStart()) return false;
    const start = new Date(this.topicRegStart()!);
    return new Date() < start;
  }

  loadTopics(): void {
    if (!this.myBatchId()) { 
      this.topics.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    const params: any = { 
      batchId: this.myBatchId()!
    };
    if (this.searchText) params.search = this.searchText;

    this.topicService.getAvailableTopics(params).subscribe({
      next: (res) => {
        this.topics.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMyRegistrations(): void {
    this.loadingRegistrations.set(true);
    this.regService.getMyStudentRegistrations().subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.myRegistrations.set(data);
        
        // Check if student has an active/pending/approved registration in this batch
        const active = data.some((r: any) => r.status === 'APPROVED' || r.status === 'PENDING');
        this.hasActiveRegistration.set(active);

        this.loadingRegistrations.set(false);
      },
      error: () => this.loadingRegistrations.set(false)
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadTopics(), 400);
  }

  registerForTopic(topic: Topic): void {
    if (!confirm(`Bạn muốn đăng ký đề tài "${topic.title}"?`)) return;
    this.registering.set(true);
    this.regService.registerTopic(topic.id).subscribe({
      next: () => {
        this.snackBar.open('Đăng ký thành công! Bạn đã được gán vào đề tài này.', 'OK', { duration: 4000 });
        this.registering.set(false);
        this.loadMyRegistrations();
        this.loadTopics();
        // Chuyển sang tab yêu cầu để xem kết quả
        this.activeTab.set('my');
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        this.snackBar.open(msg, 'Đóng', { duration: 5000 });
        this.registering.set(false);
      }
    });
  }

  getSlotsRemaining(topic: Topic): number {
    return topic.maxStudents - topic.currentStudents;
  }

  isAlreadyRegistered(topicId: string): boolean {
    return this.myRegistrations().some(r => r.topicId === topicId && (r.status === 'PENDING' || r.status === 'APPROVED'));
  }

  getRegStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'CHỜ DUYỆT';
      case 'APPROVED': return 'ĐÃ DUYỆT';
      case 'REJECTED': return 'BỊ TỪ CHỐI';
      default: return status;
    }
  }

  getRegStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'REJECTED': return 'bg-red-50 text-red-500 border border-red-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  }

  openProposalDialog(): void {
    const dialogRef = this.dialog.open(StudentProposalDialogComponent, {
      width: '560px',
      maxHeight: '90vh',
      data: {},
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (result.error) {
        this.snackBar.open(result.error, 'Đóng', { duration: 5000 });
        return;
      }
      this.snackBar.open('Đề xuất đề tài thành công! Vui lòng chờ duyệt.', 'OK', { duration: 4000 });
      this.loadMyRegistrations();
      this.activeTab.set('my');
    });
  }
}
