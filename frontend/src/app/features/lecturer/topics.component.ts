import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TopicService, Topic } from '../../core/topic.service';
import { TopicDialogComponent } from './topic-dialog.component';
import { BatchService } from '../../core/batch.service';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'app-lecturer-topics',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, MatSnackBarModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Quản lý đề tài của tôi</h2>
          <p class="text-sm text-gray-500 mt-1">Đề xuất và quản lý các đề tài đồ án bạn hướng dẫn.</p>
        </div>
        <button (click)="openTopicDialog()" 
          class="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95">
          <mat-icon class="mr-2 !text-lg">add</mat-icon>
          Tạo đề tài mới
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div class="relative flex-grow min-w-[300px]">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pt-1">
            <mat-icon class="text-gray-400">search</mat-icon>
          </span>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onFilterChange()"
            placeholder="Tìm theo tên đề tài..."
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
        </div>

        <select [(ngModel)]="selectedBatch" (ngModelChange)="onFilterChange()"
          class="px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50/50 focus:bg-white outline-none min-w-[180px]">
          <option value="">Tất cả đợt đồ án</option>
          @for (batch of batches(); track batch.id) {
            <option [value]="batch.id">{{ batch.name }}</option>
          }
        </select>

        <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()"
          class="px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50/50 focus:bg-white outline-none min-w-[150px]">
          <option value="">Tất cả trạng thái</option>
          <option value="AVAILABLE">Sẵn sàng</option>
          <option value="FULL">Đã đầy</option>
          <option value="CLOSED">Đã đóng</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>

        <select [(ngModel)]="selectedMajor" (ngModelChange)="onFilterChange()"
          class="px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50/50 focus:bg-white outline-none min-w-[180px]">
          <option value="">Tất cả ngành học</option>
          @for (major of majors(); track major.id) {
            <option [value]="major.code">{{ major.name }}</option>
          }
        </select>

        <button (click)="resetFilters()" class="p-2.5 text-gray-400 hover:text-indigo-600 transition-colors" title="Đặt lại bộ lọc">
          <mat-icon>restart_alt</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (topics().length === 0) {
        <div class="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
          <div class="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-indigo-600">inventory_2</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Chưa có đề tài nào</h3>
          <p class="text-gray-500 mt-2 max-w-xs mx-auto">Hãy bắt đầu bằng cách đề xuất đề tài đồ án đầu tiên của bạn cho sinh viên.</p>
          <button (click)="openTopicDialog()" class="mt-6 text-indigo-600 font-bold hover:underline">Tạo đề tài ngay</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (topic of topics(); track topic.id) {
            <div class="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
              <div class="flex justify-between items-start mb-4">
                <div class="flex flex-col gap-1 pr-4">
                  <div class="flex items-center gap-2 mb-1">
                    <span [class]="getStatusClass(topic.status)" 
                      class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {{ getStatusLabel(topic.status) }}
                    </span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded-lg">
                      {{ topic.batchName }}
                    </span>
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {{ topic.title }}
                  </h3>
                </div>
                <div class="flex gap-1 shrink-0">
                  @if (topic.status === 'AVAILABLE' || topic.status === 'FULL') {
                    <button (click)="closeTopic(topic.id)" 
                      class="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-lg transition-colors" title="Đóng đề tài (Dừng nhận SV)">
                      <mat-icon class="!text-lg">lock_outline</mat-icon>
                    </button>
                  } @else if (topic.status === 'CLOSED') {
                    <button (click)="reopenTopic(topic.id)" 
                      class="p-2 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors" title="Mở lại đề tài (Tiếp tục nhận SV)">
                      <mat-icon class="!text-lg">lock_open</mat-icon>
                    </button>
                  }

                  @if (canEdit(topic)) {
                    <button (click)="openTopicDialog(topic)" 
                      class="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors" title="Chỉnh sửa">
                      <mat-icon class="!text-lg">edit</mat-icon>
                    </button>
                  }
                  
                  @if (topic.status !== 'CLOSED' && topic.currentStudents === 0) {
                    <button (click)="confirmDelete(topic)" 
                      class="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors" title="Xóa">
                      <mat-icon class="!text-lg">delete</mat-icon>
                    </button>
                  }
                </div>
              </div>

              <p class="text-sm text-gray-600 line-clamp-3 mb-6 flex-grow">
                {{ topic.description || 'Không có mô tả.' }}
              </p>

              <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <div class="flex items-center gap-4">
                  <div class="flex items-center text-gray-500">
                    <mat-icon class="!text-base mr-1.5">groups</mat-icon>
                    <span class="text-xs font-bold text-gray-900">{{ topic.currentStudents }}/{{ topic.maxStudents }}</span>
                    <span class="text-xs text-gray-400 ml-1">sinh viên</span>
                  </div>
                  @if (topic.majorName) {
                    <div class="flex items-center text-gray-500">
                      <mat-icon class="!text-base mr-1.5">school</mat-icon>
                      <span class="text-xs font-bold text-gray-900">{{ topic.majorName }}</span>
                    </div>
                  }
                </div>
                <div class="text-[10px] text-gray-400 font-medium italic">
                  Tạo ngày: {{ topic.createdAt | date:'dd/MM/yyyy' }}
                </div>
              </div>

              @if (topic.status === 'REJECTED' && topic.rejectReason) {
                <div class="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <p class="text-xs font-bold text-rose-600 uppercase mb-1 flex items-center">
                    <mat-icon class="!text-xs mr-1">warning</mat-icon> Lý do từ chối:
                  </p>
                  <p class="text-xs text-rose-800 italic">{{ topic.rejectReason }}</p>
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

  // Filters
  searchQuery = '';
  selectedBatch = '';
  selectedStatus = '';
  selectedMajor = '';

  batches = signal<any[]>([]);
  majors = signal<any[]>([]);

  ngOnInit(): void {
    this.loadInitialData();
    this.loadTopics();
  }

  loadInitialData(): void {
    this.batchService.listBatches({ status: 'ACTIVE' }).subscribe((res: any) => {
      this.batches.set(res.content);
    });
    this.userService.getMajors().subscribe((res: any) => {
      this.majors.set(res);
    });
  }

  loadTopics(): void {
    this.loading.set(true);
    this.topicService.getMyTopics({
      page: 0,
      size: 50,
      search: this.searchQuery || undefined,
      status: this.selectedStatus || undefined,
      batchId: this.selectedBatch || undefined,
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
    this.selectedBatch = '';
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

  canEdit(topic: Topic): boolean {
    // Lecturers can edit if not closed
    return topic.status !== 'CLOSED';
  }
}
