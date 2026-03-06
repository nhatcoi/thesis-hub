import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TopicService, Topic, TopicRequest } from '../../core/topic.service';
import { BatchService } from '../../core/batch.service';
import { UserService } from '../../core/user.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-topic-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ data.topic ? 'Cập nhật đề tài' : 'Đề xuất đề tài mới' }}
          </h2>
          <p class="text-xs text-gray-400 font-bold uppercase mt-1">Thông tin chi tiết đề tài đồ án</p>
        </div>
        <button (click)="onCancel()" class="text-gray-400 hover:text-gray-600">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tiêu đề đề tài</label>
            <input formControlName="title" type="text" 
              [class.border-red-500]="form.get('title')?.invalid && form.get('title')?.touched"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold"
              placeholder="VD: Xây dựng hệ thống quản lý học tập...">
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="text-[10px] text-red-500 mt-1 ml-1 font-bold italic">Tiêu đề không được để trống</p>
            }
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Đợt đồ án</label>
            <select formControlName="batchId" 
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold">
              <option value="">Chọn đợt đồ án</option>
              @for (batch of batches(); track batch.id) {
                <option [value]="batch.id">{{ batch.name }}</option>
              }
            </select>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Ngành học áp dụng</label>
            <select formControlName="majorCode" 
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold">
              <option value="">Cả Khoa</option>
              @for (major of majors(); track major.id) {
                <option [value]="major.code">{{ major.name }}</option>
              }
            </select>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Số sinh viên tối đa</label>
            <input formControlName="maxStudents" type="number" min="1" max="10"
              [class.border-red-500]="form.get('maxStudents')?.invalid && form.get('maxStudents')?.touched"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold">
            @if (form.get('maxStudents')?.invalid && form.get('maxStudents')?.touched) {
              <p class="text-[10px] text-red-500 mt-1 ml-1 font-bold italic">Tối đa 10 sinh viên</p>
            }
          </div>

          <div class="col-span-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Mô tả đề tài</label>
            <textarea formControlName="description" rows="4"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              placeholder="Nhập mô tả chi tiết về nội dung đề tài..."></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Yêu cầu chuyên môn</label>
            <textarea formControlName="requirements" rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              placeholder="VD: Thành thạo Angular, Java Spring Boot..."></textarea>
          </div>
        </div>
 
        @if (errorMessage()) {
          <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-2 animate-in fade-in">
            <mat-icon class="text-red-500 !text-[20px]">error_outline</mat-icon>
            <p class="text-xs text-red-700 font-medium">{{ errorMessage() }}</p>
          </div>
        }
 
        <div class="flex justify-end gap-3 pt-6 border-t border-gray-50">
          <button type="button" (click)="onCancel()"
            class="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
            Hủy bỏ
          </button>
          <button type="submit" [disabled]="form.invalid || submitting()"
            class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center">
            @if (submitting()) {
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            } @else {
              {{ data.topic ? 'Lưu thay đổi' : 'Tạo đề tài' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class TopicDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private topicService = inject(TopicService);
  private batchService = inject(BatchService);
  private userService = inject(UserService);
  private auth = inject(AuthService);

  form: FormGroup;
  batches = signal<any[]>([]);
  majors = signal<any[]>([]);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<TopicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { topic?: Topic }
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      requirements: [''],
      maxStudents: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      batchId: ['', [Validators.required]],
      majorCode: ['']
    });

    if (data.topic) {
      this.form.patchValue({
        title: data.topic.title,
        description: data.topic.description,
        requirements: data.topic.requirements,
        maxStudents: data.topic.maxStudents,
        batchId: data.topic.batchId,
        majorCode: data.topic.majorCode || ''
      });
    }
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // Load active batches
    this.batchService.listBatches({ status: 'ACTIVE' }).subscribe(res => {
      this.batches.set(res.content);
      // If creating and no batch selected, pick first active one
      if (!this.data.topic && res.content.length > 0 && !this.form.get('batchId')?.value) {
        this.form.patchValue({ batchId: res.content[0].id });
      }
    });

    // Load majors of current faculty
    this.userService.getMajors().subscribe(res => {
      // Filter majors by current user's faculty if possible, 
      // but getMajors currently returns all.
      // For now show all, we can refine later.
      this.majors.set(res);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const request: TopicRequest = this.form.value;

    if (this.data.topic) {
      this.topicService.updateTopic(this.data.topic.id, request).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Có lỗi xảy ra khi cập nhật đề tài.');
        }
      });
    } else {
      this.topicService.createTopic(request).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Có lỗi xảy ra khi tạo đề tài.');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
