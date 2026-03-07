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
    <div class="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
      <!-- Header -->
      <div class="app-section-header flex items-center gap-3">
        <button (click)="goBack()" class="app-btn-secondary !p-1.5 !rounded-full">
          <mat-icon class="!text-lg">arrow_back</mat-icon>
        </button>
        <div>
          <h2 class="app-title">Thiết lập Đợt Đồ án</h2>
          <p class="app-subtitle italic font-mono uppercase tracking-tighter">Khai báo danh danh và lộ trình thời gian chính thức.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 italic">
        <!-- 1: General Info -->
        <div class="app-card p-5 space-y-4">
           <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-2">Thông tin định danh</h3>
           
           <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">Tên đợt đồ án *</label>
              <input type="text" formControlName="name" placeholder="VD: Đồ án Tốt nghiệp HK2 2024-2025" class="app-input" />
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label class="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">Niên khóa / Năm học *</label>
                 <select formControlName="academicYearId" class="app-select">
                    <option value="">-- Chọn niên khóa --</option>
                    @for (ay of academicYears(); track ay.id) {
                      <option [value]="ay.id">{{ ay.name }}</option>
                    }
                 </select>
              </div>
              <div>
                 <label class="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">Học kỳ *</label>
                 <select formControlName="semester" class="app-select">
                    <option [ngValue]="null">-- Chọn học kỳ --</option>
                    <option [ngValue]="1">Học kỳ 1</option>
                    <option [ngValue]="2">Học kỳ 2</option>
                    <option [ngValue]="3">Học kỳ hè</option>
                 </select>
              </div>
           </div>
        </div>

        <!-- 2: Timeline -->
        <div class="app-card p-5 space-y-6">
           <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-2">Lộ trình thực hiện (Deadlines)</h3>
           
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <!-- Phase 1 -->
              <div class="space-y-3">
                 <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></span> 1. Đăng ký Đề tài
                 </p>
                 <div class="grid grid-cols-2 gap-2">
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Bắt đầu</label>
                       <input type="datetime-local" formControlName="topicRegStart" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Kết thúc</label>
                       <input type="datetime-local" formControlName="topicRegEnd" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                 </div>
              </div>

              <!-- Phase 2 -->
              <div class="space-y-3">
                 <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></span> 2. Duyệt Đề cương
                 </p>
                 <div class="grid grid-cols-2 gap-2">
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Bắt đầu</label>
                       <input type="datetime-local" formControlName="outlineStart" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Kết thúc</label>
                       <input type="datetime-local" formControlName="outlineEnd" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                 </div>
              </div>

              <!-- Phase 3 -->
              <div class="space-y-3">
                 <p class="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2 border-t border-gray-50 pt-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm"></span> 3. Thực hiện Đồ án
                 </p>
                 <div class="grid grid-cols-2 gap-2">
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Bắt đầu</label>
                       <input type="datetime-local" formControlName="implementationStart" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Kết thúc</label>
                       <input type="datetime-local" formControlName="implementationEnd" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                 </div>
              </div>

              <!-- Phase 4 -->
              <div class="space-y-3">
                 <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 border-t border-gray-50 pt-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm"></span> 4. Xét duyệt Bảo vệ
                 </p>
                 <div class="grid grid-cols-2 gap-2">
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Bắt đầu</label>
                       <input type="datetime-local" formControlName="defenseRegStart" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Kết thúc</label>
                       <input type="datetime-local" formControlName="defenseRegEnd" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                 </div>
              </div>

              <!-- Phase 5 -->
              <div class="space-y-3 sm:col-span-2 border-t border-gray-50 pt-4 bg-gray-50/30 p-3 rounded-lg">
                 <p class="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm"></span> 5. Lịch Hội đồng Bảo vệ (Dự kiến)
                 </p>
                 <div class="grid grid-cols-2 gap-3">
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Từ ngày</label>
                       <input type="datetime-local" formControlName="defenseStart" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                    <div>
                       <label class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Đến ngày</label>
                       <input type="datetime-local" formControlName="defenseEnd" class="app-input !py-1.5 !text-[11px] font-mono" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Error Alert -->
        @if (serverError()) {
           <div class="p-3 bg-red-50 text-red-600 rounded text-xs italic font-bold border border-red-100 animate-in shake duration-300">
             <mat-icon class="!text-lg align-middle mr-1">error_outline</mat-icon> {{ serverError() }}
           </div>
        }

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pb-10">
           <button type="button" (click)="goBack()" class="px-5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded">Đóng</button>
           <button type="submit" [disabled]="submitting()" class="app-btn-primary !px-8">
             {{ submitting() ? 'Đang xử lý...' : 'Lưu đợt đồ án' }}
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

      const v = { ...this.form.value };
      
      // Convert browser local time (YYYY-MM-DDTHH:mm) to ISO with offset
      const formatDateToISO = (val: string) => { // ts (ID: c8c672b1-6a01-4433-899e-71bd1f0340b1)
         if (!val) return val;
         // input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
         // We convert it to a full ISO string (with timezone offset)
         return new Date(val).toISOString();
      };

      const fieldsToFormat = [
         'topicRegStart', 'topicRegEnd', 
         'outlineStart', 'outlineEnd', 
         'implementationStart', 'implementationEnd', 
         'defenseRegStart', 'defenseRegEnd', 
         'defenseStart', 'defenseEnd'
      ];
      
      fieldsToFormat.forEach(f => {
         if (v[f]) v[f] = formatDateToISO(v[f]);
      });

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
      const getT = (val: string | null | undefined) => val ? new Date(val).getTime() : 0;

      if (getT(v.topicRegStart) >= getT(v.topicRegEnd)) return 'Thời gian bắt đầu ĐK đề tài không hợp lệ.';
      if (getT(v.topicRegEnd) >= getT(v.outlineStart)) return 'Giai đoạn ĐK đề tài phải xong trước khi bắt đầu Đề cương.';
      if (getT(v.outlineStart) >= getT(v.outlineEnd)) return 'Thời gian bắt đầu nộp đề cương không hợp lệ.';
      if (getT(v.outlineEnd) >= getT(v.implementationStart)) return 'Giai đoạn Đề cương phải xong trước khi bắt đầu Thực hiện.';
      if (getT(v.implementationStart) >= getT(v.implementationEnd)) return 'Thời gian bắt đầu thực hiện không hợp lệ.';
      if (getT(v.implementationEnd) >= getT(v.defenseRegStart)) return 'Giai đoạn Thực hiện phải xong trước khi ĐK Bảo vệ.';
      if (getT(v.defenseRegStart) >= getT(v.defenseRegEnd)) return 'Thời gian bắt đầu ĐK bảo vệ không hợp lệ.';

      if (v.defenseStart && v.defenseEnd && getT(v.defenseStart) >= getT(v.defenseEnd)) return 'Thời gian bảo vệ không hợp lệ.';
      if (v.defenseStart && getT(v.defenseRegEnd) >= getT(v.defenseStart)) return 'Hạn ĐK bảo vệ phải đóng trước ngày diễn ra hội đồng.';

      return null;
   }
}
