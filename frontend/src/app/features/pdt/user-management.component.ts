import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService, UserCreateRequest, UserRole, PageResponse, UserResponse } from '../../core/user.service';
import { ImportService, ImportResult } from '../../core/import.service';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

type ImportType = 'STUDENT' | 'LECTURER';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="app-section-header flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="app-title">Quản lý Người dùng</h2>
          <p class="app-subtitle">Quản lý tài khoản, import dữ liệu và phân quyền hệ thống.</p>
        </div>
        <button (click)="openModal()" class="app-btn-primary">
          <mat-icon class="mr-1.5 !text-base">person_add</mat-icon> Thêm thủ công
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="app-tabs">
        <button (click)="activeTab.set('list')" [class.active]="activeTab() === 'list'" class="app-tab-btn">
          <mat-icon class="mr-1.5 !text-base">list</mat-icon> Danh sách người dùng
        </button>
        <button (click)="activeTab.set('import')" [class.active]="activeTab() === 'import'" class="app-tab-btn">
          <mat-icon class="mr-1.5 !text-base">cloud_upload</mat-icon> Import dữ liệu
        </button>
      </div>

      <!-- TAB: LIST -->
      @if (activeTab() === 'list') {
        <div class="space-y-4 animate-in fade-in duration-300">
          <!-- Filters & Search -->
          <div class="app-card p-4 space-y-4 bg-gray-50/20 shadow-none border-gray-100">
            <div class="relative w-full">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-base text-gray-400">search</mat-icon>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm theo tên, email, mã định danh..." class="app-input pl-9" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select [(ngModel)]="roleFilter" (change)="refresh()" class="app-select">
                <option value="">Tất cả vai trò</option>
                <option value="STUDENT">Sinh viên</option>
                <option value="LECTURER">Giảng viên</option>
                <option value="DEPT_HEAD">Trưởng ngành</option>
                <option value="TRAINING_DEPT">Phòng Đào tạo</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>

              <select [(ngModel)]="facultyFilter" (change)="onFacultyChange()" class="app-select">
                <option value="">Tất cả Khoa</option>
                @for (f of faculties(); track f.id) {
                  <option [value]="f.id">{{ f.name }}</option>
                }
              </select>

              <select [(ngModel)]="majorFilter" (change)="refresh()" class="app-select">
                <option value="">Tất cả Ngành</option>
                @for (m of filteredMajors(); track m.id) {
                  <option [value]="m.id">{{ m.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- User Table -->
          <div class="app-card">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50/50 border-b border-gray-100 italic">
                  <tr>
                    <th (click)="toggleSort('username')" class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors">
                      Mã định danh
                    </th>
                    <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                    <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trực thuộc</th>
                    <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-xs">
                  @for (user of users(); track user.id) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="p-3 font-mono font-bold text-gray-700">{{ user.username }}</td>
                      <td class="p-3">
                        <div class="font-bold text-gray-900">{{ user.lastName }} {{ user.firstName }}</div>
                        <div class="text-[10px] text-gray-400 font-medium">{{ user.email }}</div>
                      </td>
                      <td class="p-3">
                        @if (hasRole(user, 'STUDENT')) {
                          <div class="font-bold text-indigo-700">{{ user.majorName || 'Chưa cập nhật' }}</div>
                          <div class="text-[10px] text-gray-400">{{ user.facultyName }}</div>
                        } @else if (hasRole(user, 'LECTURER') || hasRole(user, 'DEPT_HEAD')) {
                          <div class="font-bold text-indigo-700">{{ user.facultyName || 'Chưa cập nhật' }}</div>
                          @if (hasRole(user, 'DEPT_HEAD')) {
                            <div class="text-[10px] text-indigo-500 font-bold">Trưởng ngành: {{ user.managedMajorName || 'Trống' }}</div>
                          }
                        } @else {
                          <span class="text-gray-300 italic">N/A</span>
                        }
                      </td>
                      <td class="p-3">
                        <div class="flex flex-wrap gap-1">
                          @for (role of (user.roles || []); track role) {
                            <span [class]="getRoleBadgeClass(role)" class="app-badge">
                              {{ getRoleLabel(role) }}
                            </span>
                          }
                        </div>
                      </td>
                      <td class="p-3">
                        <span class="app-badge border-green-100 bg-green-50 text-green-700 whitespace-nowrap">
                          <span class="w-1 h-1 rounded-full bg-green-500 mr-1.5 shadow-sm"></span>
                          {{ user.status }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    @if (loading()) {
                      <tr><td colspan="5" class="p-10 text-center text-xs">
                        <div class="flex justify-center"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
                      </td></tr>
                    } @else {
                      <tr><td colspan="5" class="p-10 text-center text-[11px] text-gray-400 italic">KHÔNG TÌM THẤY DỮ LIỆU</td></tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="p-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <div>Hiển thị <b>{{ page() * size() + 1 }}</b> - <b>{{ Math.min((page() + 1) * size(), totalElements()) }}</b> (Tổng <b>{{ totalElements() }}</b>)</div>
                <div class="flex gap-1">
                  <button (click)="changePage(page() - 1)" [disabled]="page() === 0" class="app-btn-secondary !px-2 !py-1 disabled:opacity-30">Trước</button>
                  <button (click)="changePage(page() + 1)" [disabled]="page() === totalPages() - 1" class="app-btn-secondary !px-2 !py-1 disabled:opacity-30">Sau</button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB: IMPORT -->
      @if (activeTab() === 'import') {
        <div class="animate-in fade-in duration-300 max-w-2xl mx-auto space-y-4 pt-4 font-mono italic">
          <div class="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-700 leading-relaxed">
            Sử dụng chức năng này để thêm đồng thời nhiều người dùng từ file CSV. Hãy tải file mẫu để đảm bảo dữ liệu đúng định dạng.
          </div>

          <!-- Type Selection -->
          <div class="flex gap-2">
            <button (click)="setImportType('STUDENT')" 
              [class]="importType() === 'STUDENT' ? 'app-btn-primary' : 'app-btn-secondary'" class="flex-grow">
              <mat-icon class="mr-1.5 !text-base">school</mat-icon> Import Sinh viên
            </button>
            <button (click)="setImportType('LECTURER')" 
              [class]="importType() === 'LECTURER' ? 'app-btn-primary' : 'app-btn-secondary'" class="flex-grow">
              <mat-icon class="mr-1.5 !text-base">person</mat-icon> Import Giảng viên
            </button>
          </div>

          <!-- Upload Area -->
          <div class="bg-white p-10 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center transition-all hover:bg-gray-50/30 group cursor-pointer"
               (dragover)="$event.preventDefault()" (drop)="onDropImport($event)" (click)="fileInput.click()">
              <div class="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <mat-icon class="text-indigo-600 !text-2xl">cloud_upload</mat-icon>
              </div>
              <h4 class="text-sm font-bold text-gray-900 mb-1">Chọn hoặc Kéo thả file .csv</h4>
              <p class="text-xs text-gray-500">Định dạng hỗ trợ duy nhất: CSV Unicode (UTF-8)</p>
              <input #fileInput type="file" class="hidden" (change)="onFileSelectedImport($event)" accept=".csv"/>

              @if (selectedImportFile()) {
                <div class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                  <mat-icon class="!text-lg">insert_drive_file</mat-icon>
                  <span class="truncate max-w-[200px]">{{ selectedImportFile()?.name }}</span>
                  <button (click)="$event.stopPropagation(); selectedImportFile.set(null)" class="hover:text-amber-300 ml-1">
                    <mat-icon class="!text-lg">close</mat-icon>
                  </button>
                </div>
              }
          </div>

          <div class="flex items-center justify-between pt-2">
            <a [href]="importType() === 'STUDENT' ? '/assets/samples/pdt_import_students.csv' : '/assets/samples/pdt_import_lecturers.csv'" 
               download class="text-xs font-bold text-indigo-600 hover:underline flex items-center">
               <mat-icon class="mr-1 !text-base">download</mat-icon> Tải file mẫu CSV
            </a>
            <button (click)="uploadImport()" [disabled]="!selectedImportFile() || uploadingImport()"
              class="app-btn-primary !px-6 disabled:opacity-50">
              {{ uploadingImport() ? 'Đang thực hiện...' : 'Bắt đầu Import' }}
            </button>
          </div>

          <!-- Import Results -->
          @if (importResult(); as res) {
            <div class="app-card overflow-hidden animate-in slide-in-from-top-4 duration-500">
              <div class="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 class="text-xs font-bold text-gray-700">Kết quả: {{ lastImportAt | date:'HH:mm:ss' }}</h3>
                <div class="flex gap-3 text-[10px] font-black italic">
                  <span class="text-green-600">✓ {{ res.successCount }}</span>
                  <span class="text-red-500">✗ {{ res.failureCount }}</span>
                </div>
              </div>
              @if (res.errors.length > 0) {
                <div class="max-h-60 overflow-y-auto text-[10px] p-2 text-red-600/80 italic font-medium leading-tight divide-y divide-gray-50">
                  @for (err of res.errors; track err.rowNumber) {
                    <div class="py-1.5 flex gap-2">
                      <span class="w-8 shrink-0">Row {{ err.rowNumber }}</span>
                      <span><b class="text-gray-600 mr-1">{{ err.identifier }}:</b> {{ err.message }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal Manual Add -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] border border-gray-100 animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center italic">
            <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
              <mat-icon class="text-indigo-600">person_add</mat-icon>
              Thêm người dùng thủ công
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600"><mat-icon>close</mat-icon></button>
          </div>
          
          <form [formGroup]="form" (ngSubmit)="save()" class="p-6 overflow-y-auto space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1 italic">Tên đăng nhập *</label>
                <input type="text" formControlName="username" class="app-input" placeholder="Mã NV / Mã SV">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1 italic">Vai trò *</label>
                <select formControlName="role" class="app-select">
                  <option value="STUDENT">Sinh viên</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="DEPT_HEAD">Trưởng ngành</option>
                  <option value="TRAINING_DEPT">Phòng Đào tạo</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1 italic">Họ *</label>
                <input type="text" formControlName="lastName" class="app-input" placeholder="Nguyễn Văn">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1 italic">Tên *</label>
                <input type="text" formControlName="firstName" class="app-input" placeholder="A">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-gray-500 mb-1 italic">Email *</label>
                <input type="email" formControlName="email" class="app-input" placeholder="email@phenikaa-uni.edu.vn">
              </div>
              
              @if (form.get('role')?.value === 'STUDENT') {
                <div class="md:col-span-2 border-t border-gray-50 pt-3">
                  <label class="block text-xs font-bold text-indigo-500 mb-2 italic">Dành cho Sinh viên</label>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ngành học *</label>
                      <select formControlName="majorCode" class="app-select">
                        <option value="">Chọn ngành...</option>
                        @for (m of majors(); track m.code) {
                          <option [value]="m.code">{{ m.name }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Khóa</label>
                      <input type="text" formControlName="cohort" class="app-input" placeholder="K17">
                    </div>
                  </div>
                </div>
              }

              @if (['LECTURER', 'DEPT_HEAD'].includes(form.get('role')?.value)) {
                <div class="md:col-span-2 border-t border-gray-50 pt-3">
                  <label class="block text-xs font-bold text-indigo-500 mb-2 italic">Dành cho Giảng viên</label>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Khoa *</label>
                      <select formControlName="facultyCode" class="app-select">
                        <option value="">Chọn khoa...</option>
                        @for (f of faculties(); track f.code) {
                          <option [value]="f.code">{{ f.name }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Hạn mức SV/đợt</label>
                      <input type="number" formControlName="maxStudentsPerBatch" class="app-input">
                    </div>
                    @if (form.get('role')?.value === 'DEPT_HEAD') {
                      <div class="md:col-span-2">
                        <label class="block text-[10px] uppercase font-bold text-indigo-600 mb-1">Ngành quản lý *</label>
                        <select formControlName="managedMajorCode" class="app-select">
                          <option value="">Chọn ngành quản lý...</option>
                          @for (m of getMajorsByFaculty(form.get('facultyCode')?.value); track m.code) {
                            <option [value]="m.code">{{ m.name }}</option>
                          }
                        </select>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            @if (errorMessage()) {
              <div class="p-3 bg-red-50 text-red-600 rounded text-xs italic font-medium border border-red-100">
                {{ errorMessage() }}
              </div>
            }

            <div class="flex justify-end gap-2 pt-4 border-t border-gray-50 italic">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded">Hủy</button>
              <button type="submit" [disabled]="submitting()" class="app-btn-primary !px-6">
                {{ submitting() ? 'Đang lưu...' : 'Lưu thông tin' }}
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
  private importService = inject(ImportService);
  private fb = inject(FormBuilder);
  Math = Math;

  // Signalled data
  activeTab = signal<'list' | 'import'>('list');
  users = signal<UserResponse[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  page = signal(0);
  size = signal(50);
  loading = signal(false);
  sortBy = signal('username');
  sortDir = signal<'asc' | 'desc'>('asc');

  // Filters
  searchQuery = '';
  roleFilter = '';
  facultyFilter = '';
  majorFilter = '';
  private searchSubject = new Subject<string>();

  // Import related signals
  importType = signal<ImportType>('STUDENT');
  selectedImportFile = signal<File | null>(null);
  uploadingImport = signal(false);
  importResult = signal<ImportResult | null>(null);
  lastImportAt: Date | null = null;

  // Modal & Form (Manual Add)
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
    majorCode: [''],
    cohort: [''],
    facultyCode: [''],
    managedMajorCode: [''],
    maxStudentsPerBatch: [5]
  });

  ngOnInit(): void {
    this.refresh();
    this.loadMetadata();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page.set(0);
      this.refresh();
    });
  }

  refresh(): void {
    this.loading.set(true);
    this.userService.getAll({
      page: this.page(),
      size: this.size(),
      search: this.searchQuery,
      role: this.roleFilter,
      facultyId: this.facultyFilter,
      majorCode: this.majorFilter,
      sort: `${this.sortBy()},${this.sortDir()}`
    }).subscribe({
      next: (res: PageResponse<UserResponse>) => {
        this.users.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleSort(column: string) {
    if (this.sortBy() === column) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDir.set('asc');
    }
    this.refresh();
  }

  onFacultyChange() {
    this.majorFilter = '';
    this.refresh();
  }

  filteredMajors() {
    if (!this.facultyFilter) return this.majors();
    return this.majors().filter(m => m.facultyId === this.facultyFilter);
  }

  getMajorsByFaculty(facultyCode: string) {
    if (!facultyCode) return this.majors();
    // In metadata, faculties have 'code'. 
    const faculty = this.faculties().find(f => f.code === facultyCode);
    if (!faculty) return [];
    return this.majors().filter(m => m.facultyId === faculty.id);
  }

  loadMetadata() {
    this.userService.getFaculties().subscribe(data => this.faculties.set(data));
    this.userService.getMajors().subscribe(data => this.majors.set(data));
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  changePage(p: number) {
    this.page.set(p);
    this.refresh();
  }

  // --- MANUAL ADD ---
  openModal(): void {
    this.form.reset({ role: 'STUDENT', academicDegree: 'Thạc sĩ', maxStudentsPerBatch: 5 });
    this.errorMessage.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.errorMessage.set('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    this.submitting.set(true);
    const data = {
      ...this.form.value,
      roles: [this.form.get('role')?.value]
    };
    delete (data as any).role;

    this.userService.create(data as any).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.refresh();
      },
      error: err => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Có lỗi xảy ra.');
      }
    });
  }

  // --- IMPORT LOGIC ---
  setImportType(type: ImportType) {
    this.importType.set(type);
    this.importResult.set(null);
    this.selectedImportFile.set(null);
  }

  onFileSelectedImport(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedImportFile.set(file);
  }

  onDropImport(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.name.endsWith('.csv')) {
      this.selectedImportFile.set(file);
    }
  }

  uploadImport() {
    const file = this.selectedImportFile();
    if (!file) return;

    this.uploadingImport.set(true);
    this.importResult.set(null);

    const obs = this.importType() === 'STUDENT'
      ? this.importService.importStudents(file)
      : this.importService.importLecturers(file);

    obs.subscribe({
      next: (res) => {
        this.importResult.set(res);
        this.uploadingImport.set(false);
        this.selectedImportFile.set(null);
        this.lastImportAt = new Date();
        this.refresh(); // Refresh list if some were imported
      },
      error: (err) => {
        alert(err?.error?.message || 'Có lỗi xảy ra khi upload file.');
        this.uploadingImport.set(false);
      }
    });
  }

  // --- HELPERS ---
  getRoleLabel(role: string): string {
    const labels: any = {
      'ADMIN': 'Quản trị viên',
      'TRAINING_DEPT': 'Phòng Đào tạo',
      'DEPT_HEAD': 'Trưởng ngành',
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

  hasRole(user: UserResponse, role: string): boolean {
    return Array.isArray(user.roles) && user.roles.includes(role as UserRole);
  }
}
