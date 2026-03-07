import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TopicService, Topic } from '../../core/topic.service';
import { TopicDialogComponent } from './topic-dialog.component';
import { TopicDetailDialogComponent } from './topic-detail-dialog.component';
import { BatchService, ThesisBatch } from '../../core/batch.service';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'app-lecturer-topics',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, MatSnackBarModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="app-section-header flex items-center justify-between">
        <div>
          <h2 class="app-title">
            @if (activeBatch()) {
              Đợt ĐATN đang hoạt động: <span class="text-indigo-600">{{ activeBatch()!.name }}</span>
            } @else if (!loadingBatch()) {
              Quản lý đề tài của tôi
            }
          </h2>
          <p class="app-subtitle italic flex flex-wrap items-center gap-x-4 gap-y-1">
            @if (activeBatch()) {
              <span>Danh sách đề tài bạn đang hướng dẫn trong đợt này.</span>
              @if (activeBatch()!.topicRegStart && activeBatch()!.topicRegEnd) {
                <span class="flex items-center gap-1.5 text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50 font-mono">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">event</mat-icon>
                  ĐK đề tài: {{ activeBatch()!.topicRegStart | date:'dd/MM/yyyy HH:mm' }} - {{ activeBatch()!.topicRegEnd | date:'dd/MM/yyyy HH:mm' }}
                </span>
                @if (isRegEnded()) {
                  <span class="flex items-center gap-1 text-red-500 font-black uppercase tracking-tighter">
                    <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">alarm_off</mat-icon>
                    (Đã kết thúc ĐK)
                  </span>
                } @else if (isBeforeReg()) {
                  <span class="flex items-center gap-1 text-amber-500 font-black uppercase tracking-tighter">
                    <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">schedule</mat-icon>
                    (Chưa mở ĐK)
                  </span>
                } @else {
                  <span class="flex items-center gap-1 text-emerald-500 font-black uppercase tracking-tighter">
                    <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">check_circle</mat-icon>
                    (Đang mở ĐK)
                  </span>
                }
              }
            } @else if (!loadingBatch()) {
              Hiện không có đợt đồ án nào đang hoạt động.
            }
          </p>
        </div>
        @if (activeBatch() && isInRegPeriod()) {
          <button (click)="openTopicDialog()" class="app-btn-primary animate-in zoom-in-95 duration-200">
            <mat-icon class="mr-1.5 !text-base">add</mat-icon> Tạo đề tài mới
          </button>
        }
      </div>

      <!-- No active batch state -->
      @if (!loadingBatch() && !activeBatch()) {
        <div class="app-card">
          <div class="p-12 text-center">
            <div class="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <mat-icon class="!text-3xl text-amber-500">event_busy</mat-icon>
            </div>
            <h3 class="text-sm font-bold text-gray-900">Không có đợt đồ án đang hoạt động</h3>
            <p class="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              Hiện tại chưa có đợt đồ án nào ở trạng thái hoạt động.<br>
              Vui lòng liên hệ <strong>Phòng Đào tạo</strong> để biết thêm chi tiết.
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

      <!-- Main content (only when has active batch) -->
      @if (!loadingBatch() && activeBatch()) {
        <div class="app-card">
          <!-- Filters -->
          <div class="p-3 flex flex-wrap gap-2 items-center border-b border-gray-100">
            <div class="relative flex-grow min-w-[200px]">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-base text-gray-400">search</mat-icon>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onFilterChange()"
                placeholder="Tìm đề tài..." class="app-input pl-9" />
            </div>

            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()" class="app-select min-w-[130px]">
              <option value="">Trạng thái</option>
              <option value="AVAILABLE">Sẵn sàng</option>
              <option value="PENDING_APPROVAL">Chờ duyệt</option>
              <option value="FULL">Đã đầy</option>
              <option value="CLOSED">Đã đóng</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>

            <select [(ngModel)]="selectedMajor" (ngModelChange)="onFilterChange()" class="app-select min-w-[150px]">
              <option value="">Ngành học</option>
              @for (major of majors(); track major.id) {
                <option [value]="major.code">{{ major.name }}</option>
              }
            </select>

            <button (click)="resetFilters()" class="app-btn-ghost" title="Đặt lại">
              <mat-icon class="!text-lg">restart_alt</mat-icon>
            </button>
          </div>

          <!-- Topic List -->
          @if (loading()) {
            <div class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          } @else if (topics().length === 0) {
            <div class="p-10 text-center border-t border-gray-50">
              <div class="mx-auto w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                <mat-icon class="!text-2xl text-gray-300">topic</mat-icon>
              </div>
              <h3 class="text-sm font-bold text-gray-900">Chưa có đề tài nào</h3>
              <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                @if (isInRegPeriod()) {
                  Hãy bắt đầu bằng cách tạo đề tài đồ án cho sinh viên.
                } @else {
                  Đợt đăng ký đề tài chưa mở hoặc đã kết thúc.
                }
              </p>
            </div>
          } @else {
            <div class="app-list-container">
              @for (topic of topics(); track topic.id) {
                <div class="app-list-item">
                  <div class="flex flex-col sm:flex-row justify-between gap-4">
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span [class]="getStatusClass(topic.status)" class="app-badge">{{ getStatusLabel(topic.status) }}</span>
                        @if (topic.majorName) {
                          <span class="app-badge border-gray-100 bg-gray-50 text-gray-400 lowercase">{{ topic.majorName }}</span>
                        }
                      </div>
                      <h3 (click)="viewTopicDetail(topic)" class="text-sm font-bold text-gray-900 leading-snug cursor-pointer hover:text-indigo-600 transition-colors" title="Xem chi tiết">{{ topic.title }}</h3>
                      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-500">
                        <span class="flex items-center gap-1"><mat-icon class="!text-xs">groups</mat-icon> {{ topic.currentStudents }}/{{ topic.maxStudents }} SV</span>
                        <span>• Ngày tạo: {{ topic.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                      @if (topic.status === 'REJECTED' && topic.rejectReason) {
                        <div class="mt-2 bg-rose-50 p-2 rounded border border-rose-100 text-[11px] text-rose-700 italic">
                          Lý do từ chối: {{ topic.rejectReason }}
                        </div>
                      }
                    </div>

                    <div class="flex sm:flex-col items-center sm:items-end justify-center gap-1 shrink-0">
                      <div class="flex gap-1">
                        @if (topic.status === 'AVAILABLE' || topic.status === 'FULL') {
                          <button (click)="closeTopic(topic.id)" class="app-btn-ghost text-amber-500" title="Đóng đề tài">
                            <mat-icon class="!text-lg">lock_outline</mat-icon>
                          </button>
                        } @else if (topic.status === 'CLOSED') {
                          <button (click)="reopenTopic(topic.id)" class="app-btn-ghost text-emerald-500" title="Mở lại đề tài">
                            <mat-icon class="!text-lg">lock_open</mat-icon>
                          </button>
                        }
                        @if (canEdit(topic)) {
                          <button (click)="openTopicDialog(topic)" class="app-btn-ghost text-indigo-500" title="Sửa">
                            <mat-icon class="!text-lg">edit</mat-icon>
                          </button>
                        }
                        @if (topic.status !== 'CLOSED' && topic.currentStudents === 0) {
                          <button (click)="confirmDelete(topic)" class="app-btn-ghost text-rose-500" title="Xóa">
                            <mat-icon class="!text-lg">delete</mat-icon>
                          </button>
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
  `
})

export class TopicsComponent implements OnInit {
  private topicService = inject(TopicService);
  private batchService = inject(BatchService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  topics = signal<Topic[]>([]);
  loading = signal(true);
  loadingBatch = signal(true);

  activeBatch = signal<ThesisBatch | null>(null);

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedMajor = '';

  batches = signal<any[]>([]);
  majors = signal<any[]>([]);

  ngOnInit(): void {
    this.detectActiveBatch();
    this.userService.getMajors().subscribe((res: any) => {
      this.majors.set(res);
    });
  }

  /** Detect active batch for the lecturer */
  detectActiveBatch(): void {
    this.loadingBatch.set(true);
    this.batchService.listBatches({ status: 'ACTIVE', size: 1 }).subscribe({
      next: (res) => {
        if (res.content && res.content.length > 0) {
          this.activeBatch.set(res.content[0]);
          this.loadTopics();
        } else {
          this.activeBatch.set(null);
          this.loading.set(false);
        }
        this.loadingBatch.set(false);
      },
      error: () => {
        this.activeBatch.set(null);
        this.loadingBatch.set(false);
        this.loading.set(false);
      }
    });
  }

  isRegEnded(): boolean {
    const batch = this.activeBatch();
    if (!batch?.topicRegEnd) return false;
    return new Date() > new Date(batch.topicRegEnd);
  }

  isBeforeReg(): boolean {
    const batch = this.activeBatch();
    if (!batch?.topicRegStart) return false;
    return new Date() < new Date(batch.topicRegStart);
  }

  isInRegPeriod(): boolean {
    return !this.isRegEnded() && !this.isBeforeReg() && !!this.activeBatch();
  }

  loadTopics(): void {
    const batch = this.activeBatch();
    if (!batch) {
      this.topics.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.topicService.getMyTopics({
      page: 0,
      size: 50,
      search: this.searchQuery || undefined,
      status: this.selectedStatus || undefined,
      batchId: batch.id,
      majorCode: this.selectedMajor || undefined
    }).subscribe({
      next: (res: any) => {
        this.topics.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.loadTopics();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedMajor = '';
    this.loadTopics();
  }

  openTopicDialog(topic?: Topic): void {
    const dialogRef = this.dialog.open(TopicDialogComponent, {
      width: '600px',
      data: { topic },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTopics();
        this.snackBar.open(topic ? 'Đã cập nhật đề tài' : 'Đã tạo đề tài mới', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  confirmDelete(topic: Topic): void {
    if (confirm(`Bạn có chắc muốn xóa đề tài "${topic.title}"?`)) {
      this.topicService.deleteTopic(topic.id).subscribe({
        next: () => {
          this.loadTopics();
          this.snackBar.open('Đã xóa đề tài', 'Đóng', { duration: 3000 });
        },
        error: (err: any) => {
          this.snackBar.open(err.error?.message || 'Không thể xóa đề tài', 'Đóng', { duration: 3000 });
        }
      });
    }
  }

  closeTopic(id: string): void {
    if (confirm('Bạn có chắc muốn đóng đề tài này? Sinh viên sẽ không thể đăng ký thêm.')) {
      this.topicService.closeTopic(id).subscribe({
        next: () => {
          this.loadTopics();
          this.snackBar.open('Đã đóng đề tài', 'Đóng', { duration: 3000 });
        },
        error: (err: any) => {
          this.snackBar.open(err.error?.message || 'Không thể đóng đề tài', 'Đóng', { duration: 3000 });
        }
      });
    }
  }

  reopenTopic(id: string): void {
    this.topicService.reopenTopic(id).subscribe({
      next: () => {
        this.loadTopics();
        this.snackBar.open('Đã mở lại đề tài', 'Đóng', { duration: 3000 });
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Không thể mở lại đề tài', 'Đóng', { duration: 3000 });
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'Sẵn sàng';
      case 'PENDING_APPROVAL': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'FULL': return 'Đã đầy';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'PENDING_APPROVAL': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'APPROVED': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'FULL': return 'bg-gray-50 text-gray-500 border border-gray-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  }

  viewTopicDetail(topic: Topic): void {
    this.dialog.open(TopicDetailDialogComponent, {
      width: '720px',
      maxHeight: '90vh',
      data: { topicId: topic.id },
      autoFocus: false
    });
  }

  canEdit(topic: Topic): boolean {
    return topic.status !== 'CLOSED';
  }
}
