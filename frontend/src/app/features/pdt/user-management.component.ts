import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService, UserCreateRequest, UserRole } from '../../core/user.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule],
    template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Quản lý Người dùng</h2>
          <p class="mt-1 text-sm text-gray-500">Thêm mới và quản lý tài khoản người dùng trong hệ thống.</p>
        </div>
        <button (click)="openModal()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
          <mat-icon class="mr-2 !text-[20px]">person_add</mat-icon>
          Thêm người dùng thủ công
        </button>
      </div>

      <!-- User List (Simplified) -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và Tên</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (user of users(); track user.id) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.username }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getRoleBadgeClass(user.role)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ user.status }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500">
                  Chưa có người dùng nào được tạo.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Manual Add -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-gray-500/75 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-gray-100">
          <div class="px-8 py-5 bg-gradient-to-r from-indigo-600 to-violet-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white flex items-center">
              <mat-icon class="mr-2">person_add</mat-icon>
              Thêm người dùng thủ công
            </h3>
            <button (click)="closeModal()" class="text-white/80 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <form [formGroup]="form" (ngSubmit)="save()" class="p-8">
            <div class="grid grid-cols-2 gap-6 mb-6">
              <!-- Basic Info -->
              <div class="col-span-2">
                <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Thông tin cơ bản</h4>
              </div>
              
              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Tên đăng nhập <span class="text-red-500">*</span></label>
                <input type="text" formControlName="username" placeholder="Mã NV / Mã SV"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border transition-all">
              </div>

              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Vai trò <span class="text-red-500">*</span></label>
                <select formControlName="role" (change)="onRoleChange()"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border transition-all">
                  <option value="STUDENT">Sinh viên</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="DEPT_HEAD">Trưởng bộ môn</option>
                  <option value="TRAINING_DEPT">Phòng Đào tạo</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Họ <span class="text-red-500">*</span></label>
                <input type="text" formControlName="lastName" placeholder="VD: Nguyễn Văn"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
              </div>

              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Tên <span class="text-red-500">*</span></label>
                <input type="text" formControlName="firstName" placeholder="VD: A"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
              </div>

              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email <span class="text-red-500">*</span></label>
                <input type="email" formControlName="email" placeholder="example@phenikaa-uni.edu.vn"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
              </div>

              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Số điện thoại</label>
                <input type="text" formControlName="phone" placeholder="0xxx"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
              </div>

              <!-- Role Specific Fields -->
              @if (form.get('role')?.value === 'STUDENT') {
                <div class="col-span-2 mt-4">
                  <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Thông tin Sinh viên</h4>
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Ngành học <span class="text-red-500">*</span></label>
                  <select formControlName="majorCode"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                    <option value="">Chọn ngành...</option>
                    @for (m of majors(); track m.code) {
                      <option [value]="m.code">{{ m.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Khóa học</label>
                  <input type="text" formControlName="cohort" placeholder="VD: K17"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">GPA Hiện tại</label>
                  <input type="number" step="0.01" formControlName="gpa" placeholder="0.00"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Số tín chỉ tích lũy</label>
                  <input type="number" formControlName="accumulatedCredits" placeholder="0"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                </div>
              }

              @if (['LECTURER', 'DEPT_HEAD'].includes(form.get('role')?.value)) {
                <div class="col-span-2 mt-4">
                  <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Thông tin Giảng viên</h4>
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Khoa <span class="text-red-500">*</span></label>
                  <select formControlName="facultyCode"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                    <option value="">Chọn khoa...</option>
                    @for (f of faculties(); track f.code) {
                      <option [value]="f.code">{{ f.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Học hàm</label>
                  <select formControlName="academicRank"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                    <option value="">Không có</option>
                    <option value="Phó Giáo sư">Phó Giáo sư</option>
                    <option value="Giáo sư">Giáo sư</option>
                  </select>
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Học vị</label>
                  <select formControlName="academicDegree"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                  </select>
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Số SV tối đa/đợt</label>
                  <input type="number" formControlName="maxStudentsPerBatch"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Hướng nghiên cứu</label>
                  <textarea formControlName="researchAreas" rows="2" placeholder="Lĩnh vực nghiên cứu quan tâm..."
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"></textarea>
                </div>
              }
            </div>

            @if (errorMessage()) {
              <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center mb-6 animate-pulse">
                <mat-icon class="text-red-500 mr-3">error_outline</mat-icon>
                <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
              </div>
            }

            <div class="flex justify-end space-x-4 pt-4 border-t border-gray-100">
              <button type="button" (click)="closeModal()"
                class="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm">
                Hủy bỏ
              </button>
              <button type="submit" [disabled]="submitting()"
                class="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300">
                <mat-icon class="mr-2 !text-[18px]" *ngIf="!submitting()">check_circle</mat-icon>
                {{ submitting() ? 'Đang xử lý...' : 'Xác nhận Thêm' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class UserManagementComponent implements OnInit {
    private userService = inject(UserService);
    private fb = inject(FormBuilder);

    users = signal<any[]>([]);
    showModal = signal(false);
    submitting = signal(false);
    errorMessage = signal<string | null>(null);

    faculties = signal<any[]>([]);
    majors = signal<any[]>([]);

    form: FormGroup = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: [''],
        role: ['STUDENT', Validators.required],
        // Student specific
        majorCode: [''],
        cohort: [''],
        gpa: [null],
        accumulatedCredits: [null],
        // Lecturer specific
        facultyCode: [''],
        academicRank: [''],
        academicDegree: ['Thạc sĩ'],
        researchAreas: [''],
        maxStudentsPerBatch: [5]
    });

    ngOnInit(): void {
        this.refresh();
        this.loadMetadata();
    }

    refresh(): void {
        this.userService.getAll().subscribe(data => this.users.set(data));
    }

    loadMetadata() {
        this.userService.getFaculties().subscribe(data => this.faculties.set(data));
        this.userService.getMajors().subscribe(data => this.majors.set(data));
    }

    openModal(): void {
        this.form.reset({ role: 'STUDENT', academicDegree: 'Thạc sĩ', maxStudentsPerBatch: 5 });
        this.errorMessage.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
    }

    onRoleChange() {
        const role = this.form.get('role')?.value;
        // Clear validations or adjust if needed
    }

    save(): void {
        if (this.form.invalid) {
            this.errorMessage.set('Vui lòng điền đầy đủ các thông tin bắt buộc.');
            return;
        }
        this.submitting.set(true);
        this.errorMessage.set(null);

        const val = this.form.value;
        this.userService.create(val).subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.refresh();
                alert('Tạo người dùng thành công!');
            },
            error: err => {
                this.submitting.set(false);
                this.errorMessage.set(err?.error?.message || 'Có lỗi xảy ra khi tạo người dùng.');
            }
        });
    }

    getRoleLabel(role: string): string {
        const labels: any = {
            'ADMIN': 'Quản trị viên',
            'TRAINING_DEPT': 'Phòng Đào tạo',
            'DEPT_HEAD': 'Trưởng bộ môn',
            'LECTURER': 'Giảng viên',
            'STUDENT': 'Sinh viên'
        };
        return labels[role] || role;
    }

    getRoleBadgeClass(role: string): string {
        const classes: any = {
            'ADMIN': 'bg-red-100 text-red-800',
            'TRAINING_DEPT': 'bg-blue-100 text-blue-800',
            'DEPT_HEAD': 'bg-purple-100 text-purple-800',
            'LECTURER': 'bg-green-100 text-green-800',
            'STUDENT': 'bg-gray-100 text-gray-800'
        };
        return classes[role] || 'bg-gray-100 text-gray-800';
    }
}
