import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcademicYearService, AcademicYear } from '../../core/academic-year.service';

@Component({
  selector: 'app-academic-years',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Quản lý niên khóa</h2>
          <p class="mt-1 text-sm text-gray-500">Danh mục các niên khóa chính thức của hệ thống.</p>
        </div>
        <button (click)="openModal()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <mat-icon class="mr-2 !text-[20px]">add</mat-icon>
          Thêm niên khóa mới
        </button>
      </div>

      <!-- Search Field -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div class="relative max-w-sm">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pt-1">
            <mat-icon class="text-gray-400">search</mat-icon>
          </span>
          <input type="text" [(ngModel)]="searchQuery"
            placeholder="Tìm theo tên niên khóa..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none border">
        </div>
      </div>

      <!-- List Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên niên khóa</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 font-medium">
            @for (year of filteredYears(); track year.id) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{{ year.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{{ year.startDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{{ year.endDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <button (click)="openModal(year)" class="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50">
                      <mat-icon class="!text-[20px]">edit</mat-icon>
                    </button>
                    <button (click)="confirmDelete(year)" class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                      <mat-icon class="!text-[20px]">delete_outline</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-10 text-center text-sm text-gray-500">
                  Không tìm thấy dữ liệu nào phù hợp.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Simple Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900">
              {{ editingYear() ? 'Sửa thông tin niên khóa' : 'Khai báo niên khóa mới' }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 p-1">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <form [formGroup]="form" (ngSubmit)="save()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Tên niên khóa <span class="text-red-500">*</span></label>
              <input type="text" formControlName="name" placeholder="VD: 2024-2025"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Ngày bắt đầu</label>
                <input type="date" formControlName="startDate"
                   class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2.5 border">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Ngày kết thúc</label>
                <input type="date" formControlName="endDate"
                  class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2.5 border">
              </div>
            </div>

            @if (errorMessage()) {
              <div class="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p class="text-[11px] font-bold text-red-700 uppercase tracking-widest mb-0.5">Lỗi hệ thống</p>
                <p class="text-xs text-red-600">{{ errorMessage() }}</p>
              </div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" (click)="closeModal()"
                class="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
                Đóng
              </button>
              <button type="submit" [disabled]="submitting()"
                class="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50">
                {{ submitting() ? 'Đang lưu...' : 'Lưu dữ liệu' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Simple Delete Modal -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-8 text-center border border-gray-100">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="!text-[32px]">delete</mat-icon>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
          <p class="text-sm text-gray-500 mb-8 font-medium">Mọi dữ liệu thuộc về niên khóa <span class="text-gray-900 font-bold">"{{ deleteTarget()?.name }}"</span> sẽ bị ảnh hưởng. Bạn chắc chắn muốn xóa?</p>
          <div class="flex gap-3">
            <button (click)="deleteTarget.set(null)"
              class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              Hủy
            </button>
            <button (click)="onDelete()" [disabled]="submitting()"
              class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-50 transition-all">
              Xóa ngay
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AcademicYearsComponent implements OnInit {
  private service = inject(AcademicYearService);
  private fb = inject(FormBuilder);

  years = signal<AcademicYear[]>([]);
  showModal = signal(false);
  submitting = signal(false);
  editingYear = signal<AcademicYear | null>(null);
  deleteTarget = signal<AcademicYear | null>(null);
  errorMessage = signal<string | null>(null);
  searchQuery = '';

  filteredYears = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    return this.years().filter(y => y.name.toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.service.getAll().subscribe(data => this.years.set(data));
  }

  openModal(year?: AcademicYear): void {
    this.errorMessage.set(null);
    if (year) {
      this.editingYear.set(year);
      this.form.patchValue(year);
    } else {
      this.editingYear.set(null);
      this.form.reset();
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingYear.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.errorMessage.set(null);

    const val = this.form.value;
    const obs$ = this.editingYear()
      ? this.service.update(this.editingYear()!.id, val)
      : this.service.create(val);

    obs$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.refresh();
      },
      error: err => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Lỗi lưu dữ liệu.');
      }
    });
  }

  confirmDelete(year: AcademicYear): void {
    this.deleteTarget.set(year);
  }

  onDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.submitting.set(true);
    this.service.delete(target.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleteTarget.set(null);
        this.refresh();
      },
      error: err => {
        this.submitting.set(false);
        alert(err?.error?.message || 'Lỗi xóa niên khóa.');
        this.deleteTarget.set(null);
      }
    });
  }

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });
}
