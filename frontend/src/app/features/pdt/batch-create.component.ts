import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { BatchService, AcademicYear } from '../../core/batch.service';

@Component({
  selector: 'app-batch-create',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Standard Header -->
      <div class="flex items-center space-x-3">
        <button (click)="goBack()" class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Thiết lập đợt đồ án</h2>
          <p class="text-sm text-gray-500">Khai báo thông tin định danh và các mốc thời gian quan trọng.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- 1: General Info -->
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
           <h3 class="text-base font-bold text-gray-800 border-b border-gray-50 pb-3">Thông tin định danh</h3>
           
           <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Tên đợt đồ án <span class="text-red-500">*</span></label>
              <input type="text" formControlName="name" placeholder="VD: Đồ án Tốt nghiệp HK2 2024-2025"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border">
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                 <label class="block text-sm font-semibold text-gray-700 mb-1.5">Niên khóa / Năm học <span class="text-red-500">*</span></label>
                 <select formControlName="academicYearId"
                   class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2.5 border outline-none">
                    <option value="">-- Chọn niên khóa --</option>
                    @for (ay of academicYears(); track ay.id) {
                      <option [value]="ay.id">{{ ay.name }}</option>
                    }
                 </select>
              </div>
              <div>
                 <label class="block text-sm font-semibold text-gray-700 mb-1.5">Học kỳ <span class="text-red-500">*</span></label>
                 <select formControlName="semester"
                   class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2.5 border outline-none">
                    <option [ngValue]="null">-- Chọn học kỳ --</option>
                    <option [ngValue]="1">Học kỳ 1</option>
                    <option [ngValue]="2">Học kỳ 2</option>
                    <option [ngValue]="3">Học kỳ hè</option>
                 </select>
              </div>
           </div>
        </div>

        <!-- 2: Timeline -->
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
           <h3 class="text-base font-bold text-gray-800 border-b border-gray-50 pb-3">Lộ trình đồ án (Deadline)</h3>
           
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <!-- Phase 1 -->
              <div class="space-y-4">
                 <p class="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> 1. Đăng ký đề tài
                 </p>
                 <div class="grid grid-cols-1 gap-3">
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Bắt đầu</label>
                       <input type="date" formControlName="topicRegStart" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Kết thúc (đóng ĐK)</label>
                       <input type="date" formControlName="topicRegEnd" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                 </div>
              </div>

              <!-- Phase 2 -->
              <div class="space-y-4">
                 <p class="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 2. Lập & Duyệt đề cương
                 </p>
                 <div class="grid grid-cols-1 gap-3">
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Bắt đầu nộp đề cương</label>
                       <input type="date" formControlName="outlineStart" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Duyệt xong (kết thúc)</label>
                       <input type="date" formControlName="outlineEnd" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                 </div>
              </div>

              <!-- Phase 3 -->
              <div class="space-y-4">
                 <p class="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span> 3. Thực hiện đồ án
                 </p>
                 <div class="grid grid-cols-1 gap-3">
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Ngày bắt đầu CODE / Viết báo cáo</label>
                       <input type="date" formControlName="implementationStart" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Nộp báo cáo cuối kỳ (đóng)</label>
                       <input type="date" formControlName="implementationEnd" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                 </div>
              </div>

              <!-- Phase 4 -->
              <div class="space-y-4">
                 <p class="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-600"></span> 4. Xét duyệt Bảo vệ
                 </p>
                 <div class="grid grid-cols-1 gap-3">
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Bắt đầu nhận đơn bảo vệ</label>
                       <input type="date" formControlName="defenseRegStart" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Kết thúc duyệt</label>
                       <input type="date" formControlName="defenseRegEnd" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                 </div>
              </div>

              <!-- Phase 5 -->
              <div class="space-y-4 sm:col-span-2">
                 <p class="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2 border-t border-gray-50 pt-4">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span> 5. Lịch Hội đồng bảo vệ (Tùy chọn)
                 </p>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Bảo vệ từ ngày</label>
                       <input type="date" formControlName="defenseStart" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                    <div>
                       <label class="text-[11px] font-bold text-gray-400">Đến ngày</label>
                       <input type="date" formControlName="defenseEnd" class="w-full border-gray-300 rounded-lg text-sm px-3 py-2 border">
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Error Alert -->
        @if (serverError()) {
           <div class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in shake duration-300">
             <mat-icon class="text-red-500">error_outline</mat-icon>
             <p class="text-xs font-bold text-red-700 font-mono">{{ serverError() }}</p>
           </div>
        }

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pb-20">
           <button type="button" (click)="goBack()"
             class="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
             Đóng lại
           </button>
           <button type="submit" [disabled]="submitting()"
             class="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50">
             {{ submitting() ? 'Đang lưu đợt...' : 'Lưu đợt đồ án' }}
           </button>
        </div>
      </form>
    </div>
  `
})
export class BatchCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private batchService = inject(BatchService);

  academicYears = signal<AcademicYear[]>([]);
  submitting = signal(false);
  serverError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    academicYearId: ['', Validators.required],
    semester: [null, Validators.required],
    topicRegStart: ['', Validators.required],
    topicRegEnd: ['', Validators.required],
    outlineStart: ['', Validators.required],
    outlineEnd: ['', Validators.required],
    implementationStart: ['', Validators.required],
    implementationEnd: ['', Validators.required],
    defenseRegStart: ['', Validators.required],
    defenseRegEnd: ['', Validators.required],
    defenseStart: [''],
    defenseEnd: [''],
  });

  ngOnInit(): void {
    this.batchService.getAcademicYears().subscribe({
      next: data => this.academicYears.set(data),
      error: () => this.serverError.set('ERROR_LOAD_ACADEMIC_YEARS')
    });
    window.scrollTo(0, 0);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.serverError.set('Vui lòng hoàn thành mọi trường bắt buộc (đánh dấu *)');
      return;
    }

    const v = this.form.value;
    const msg = this.validateDates(v);
    if (msg) {
      this.serverError.set(msg);
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    this.batchService.createBatch(v).subscribe({
      next: () => {
        this.router.navigate(['/pdt/batches']);
      },
      error: err => {
        this.submitting.set(false);
        this.serverError.set(err?.error?.message || 'Có lỗi khi lưu dữ liệu lên server.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pdt/batches']);
  }

  private validateDates(v: any): string | null {
    // Simple logic mirrors backend business rules
    if (v.topicRegStart >= v.topicRegEnd) return 'Ngày bắt đầu ĐK đề tài không hợp lệ.';
    if (v.topicRegEnd >= v.outlineStart) return 'Giai đoạn ĐK đề tài phải xong trước khi bắt đầu Đề cương.';
    if (v.outlineStart >= v.outlineEnd) return 'Ngày bắt đầu nộp đề cương không hợp lệ.';
    if (v.outlineEnd >= v.implementationStart) return 'Giai đoạn Đề cương phải xong trước khi bắt đầu Thực hiện.';
    if (v.implementationStart >= v.implementationEnd) return 'Ngày bắt đầu thực hiện không hợp lệ.';
    if (v.implementationEnd >= v.defenseRegStart) return 'Giai đoạn Thực hiện phải xong trước khi ĐK Bảo vệ.';
    if (v.defenseRegStart >= v.defenseRegEnd) return 'Ngày bắt đầu ĐK bảo vệ không hợp lệ.';

    if (v.defenseStart && v.defenseEnd && v.defenseStart >= v.defenseEnd) return 'Ngày bảo vệ không hợp lệ.';
    if (v.defenseStart && v.defenseRegEnd >= v.defenseStart) return 'Hạn ĐK bảo vệ phải đóng trước ngày diễn ra hội đồng.';

    return null;
  }
}
