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
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Quản lý Người dùng</h2>
          <p class="mt-1 text-sm text-gray-500">Quản lý tài khoản người dùng, import dữ liệu và phân quyền hệ thống.</p>
        </div>
        <div class="flex space-x-3">
          <button (click)="openModal()"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
            <mat-icon class="mr-2 !text-[20px]">person_add</mat-icon>
            Thêm thủ công
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button (click)="activeTab.set('list')"
            [class]="activeTab() === 'list' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center">
            <mat-icon class="mr-2 !text-[20px]">list</mat-icon>
            Danh sách người dùng
          </button>
          <button (click)="activeTab.set('import')"
            [class]="activeTab() === 'import' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center">
            <mat-icon class="mr-2 !text-[20px]">cloud_upload</mat-icon>
            Import dữ liệu hệ thống
          </button>
        </nav>
      </div>

      <!-- TAB: LIST -->
      @if (activeTab() === 'list') {
        <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <!-- Filters & Search -->
          <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <div class="flex flex-col md:flex-row gap-4 items-center">
              <div class="relative flex-1 w-full">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pt-1">
                  <mat-icon class="text-gray-400">search</mat-icon>
                </span>
                <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
                  placeholder="Tìm theo tên, email, tên đăng nhập..."
                  class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border transition-all">
              </div>
            </div>

            <div class="flex flex-wrap gap-4 items-center border-t border-gray-100 pt-4">
               <div class="w-full md:w-48">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 block ml-1">Lọc theo Vai trò</label>
                  <select [(ngModel)]="roleFilter" (change)="refresh()"
                    class="block w-full px-3 py-2 border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border transition-all">
                    <option value="">Tất cả vai trò</option>
                    <option value="STUDENT">Sinh viên</option>
                    <option value="LECTURER">Giảng viên</option>
                    <option value="DEPT_HEAD">Trưởng bộ môn</option>
                    <option value="TRAINING_DEPT">Phòng Đào tạo</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
               </div>
               <div class="w-full md:w-64">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 block ml-1">Lọc theo Khoa</label>
                  <select [(ngModel)]="facultyFilter" (change)="onFacultyChange()"
                    class="block w-full px-3 py-2 border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border transition-all">
                    <option [value]="''">Tất cả Khoa</option>
                    @for (f of faculties(); track f.id) {
                      <option [value]="f.id">{{ f.name }}</option>
                    }
                  </select>
               </div>
               <div class="w-full md:w-64">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 block ml-1">Lọc theo Ngành</label>
                  <select [(ngModel)]="majorFilter" (change)="refresh()"
                    class="block w-full px-3 py-2 border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border transition-all">
                    <option [value]="''">Tất cả Ngành</option>
                    @for (m of filteredMajors(); track m.id) {
                      <option [value]="m.id">{{ m.name }}</option>
                    }
                  </select>
               </div>
            </div>
          </div>

          <!-- User Table -->
          <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th (click)="toggleSort('username')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                       <div class="flex items-center gap-1">
                          Mã định danh
                          <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'username'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                       </div>
                    </th>
                    <th (click)="toggleSort('lastName')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                       <div class="flex items-center gap-1">
                          Họ
                          <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'lastName'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                       </div>
                    </th>
                    <th (click)="toggleSort('firstName')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                       <div class="flex items-center gap-1">
                          Tên
                          <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'firstName'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                       </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngành / Khoa trực thuộc</th>
                    <th (click)="toggleSort('email')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                       <div class="flex items-center gap-1">
                          Email
                          <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'email'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                       </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (user of users(); track user.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold font-mono">
                        {{ user.username }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {{ user.lastName }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {{ user.firstName }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        @if (hasRole(user, 'STUDENT')) {
                          <div class="flex flex-col">
                            <span class="font-medium text-indigo-700 underline decoration-indigo-200 underline-offset-4">{{ user.majorName || 'Chưa cập nhật ngành' }}</span>
                            <span class="text-[10px] text-gray-400 uppercase tracking-tighter" *ngIf="user.facultyName">{{ user.facultyName }}</span>
                          </div>
                        } @else if (hasRole(user, 'LECTURER') || hasRole(user, 'DEPT_HEAD')) {
                           <div class="flex items-center gap-1.5">
                              <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-300">account_balance</mat-icon>
                              <span>{{ user.facultyName || 'Chưa cập nhật khoa' }}</span>
                           </div>
                        } @else {
                          <span class="text-gray-300">-</span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-wrap gap-1">
                          @for (role of (user.roles || []); track role) {
                            <span [class]="getRoleBadgeClass(role)" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {{ getRoleLabel(role) }}
                            </span>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                          {{ user.status }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    @if (loading()) {
                      <tr>
                        <td colspan="5" class="px-6 py-10 text-center">
                          <div class="flex justify-center items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                        </td>
                      </tr>
                    } @else {
                      <tr>
                        <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500 font-medium font-mono">
                           NO_DATA_FOUND
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div class="text-sm text-gray-700">
                  Hiển thị {{ page() * size() + 1 }} - {{ Math.min((page() + 1) * size(), totalElements()) }} 
                  trong tổng số {{ totalElements() }} kết quả
                </div>
                <div class="flex space-x-2">
                  <button (click)="changePage(page() - 1)" [disabled]="page() === 0"
                    class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 transition-all">
                    Trước
                  </button>
                  @for (p of [].constructor(totalPages()); track $index) {
                    @if ($index >= page() - 2 && $index <= page() + 2) {
                      <button (click)="changePage($index)"
                        [class]="page() === $index ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                        class="px-3 py-1.5 border rounded-lg text-sm font-medium transition-all">
                        {{ $index + 1 }}
                      </button>
                    }
                  }
                  <button (click)="changePage(page() + 1)" [disabled]="page() === totalPages() - 1"
                    class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 transition-all">
                    Sau
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB: IMPORT -->
      @if (activeTab() === 'import') {
        <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl mx-auto">
          <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start">
            <mat-icon class="text-indigo-600 mr-3 mt-0.5">info</mat-icon>
            <div class="text-sm text-indigo-700">
              Sử dụng chức năng này để thêm đồng thời nhiều người dùng từ file CSV. Vui lòng tải file mẫu để đảm bảo dữ liệu đúng định dạng.
            </div>
          </div>

          <!-- Type Selection -->
          <div class="flex space-x-3">
            <button (click)="setImportType('STUDENT')" 
              [class]="importType() === 'STUDENT' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'"
              class="flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
              <mat-icon class="mr-2 !text-[20px]">school</mat-icon>
              Import Sinh viên
            </button>
            <button (click)="setImportType('LECTURER')" 
              [class]="importType() === 'LECTURER' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'"
              class="flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
              <mat-icon class="mr-2 !text-[20px]">person</mat-icon>
              Import Giảng viên
            </button>
          </div>

          <!-- Upload Area -->
          <div class="bg-white p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center transition-all hover:border-indigo-300 group"
               (dragover)="$event.preventDefault()" (drop)="onDropImport($event)">
              <div class="bg-indigo-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <mat-icon class="text-indigo-600 !text-[32px] w-auto h-auto">cloud_upload</mat-icon>
              </div>
              <h4 class="text-lg font-bold text-gray-900 mb-1">Tải file danh sách lên</h4>
              <p class="text-sm text-gray-500 mb-6">Kéo thả file .csv vào đây hoặc <span class="text-indigo-600 font-bold cursor-pointer" (click)="fileInput.click()">duyệt file</span></p>
              <input #fileInput type="file" class="hidden" (change)="onFileSelectedImport($event)" accept=".csv"/>

              @if (selectedImportFile()) {
                <div class="w-full max-w-md bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between animate-in zoom-in-95">
                  <div class="flex items-center truncate">
                    <mat-icon class="text-indigo-500 mr-2">insert_drive_file</mat-icon>
                    <span class="text-sm font-bold text-gray-700 truncate">{{ selectedImportFile()?.name }}</span>
                  </div>
                  <button (click)="selectedImportFile.set(null)" class="text-gray-400 hover:text-red-500">
                    <mat-icon class="!text-[20px]">cancel</mat-icon>
                  </button>
                </div>
              }
          </div>

          <div class="flex items-center justify-between">
            <a [href]="importType() === 'STUDENT' ? '/assets/samples/pdt_import_students.csv' : '/assets/samples/pdt_import_lecturers.csv'" 
               download class="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700">
               <mat-icon class="mr-1.5 !text-[20px]">download</mat-icon>
               Tải file mẫu (CSV)
            </a>
            <button (click)="uploadImport()" [disabled]="!selectedImportFile() || uploadingImport()"
              class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50">
              {{ uploadingImport() ? 'Đang xử lý...' : 'Bắt đầu Import' }}
            </button>
          </div>

          <!-- Import Results -->
          @if (importResult(); as res) {
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-top-4 duration-500">
              <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 class="font-bold text-gray-900">Chi tiết kết quả Import</h3>
                <span class="text-xs text-gray-500 font-mono">FINISH_AT: {{ lastImportAt | date:'HH:mm:ss dd/MM' }}</span>
              </div>
              <div class="p-6">
                 <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="p-4 bg-green-50 border border-green-100 rounded-xl">
                       <p class="text-xs font-bold text-green-600 uppercase mb-1">Thành công</p>
                       <p class="text-3xl font-black text-green-700">{{ res.successCount }}</p>
                    </div>
                    <div class="p-4 bg-red-50 border border-red-100 rounded-xl">
                       <p class="text-xs font-bold text-red-600 uppercase mb-1">Thất bại</p>
                       <p class="text-3xl font-black text-red-700">{{ res.failureCount }}</p>
                    </div>
                 </div>

                 @if (res.errors.length > 0) {
                    <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-xl">
                       <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-gray-50 sticky top-0">
                             <tr>
                                <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Dòng</th>
                                <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Lỗi</th>
                             </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200 bg-white">
                             @for (err of res.errors; track err.rowNumber) {
                                <tr class="text-xs">
                                   <td class="px-4 py-2 font-mono text-gray-400">{{ err.rowNumber }}</td>
                                   <td class="px-4 py-2 text-red-600 font-medium">
                                      <span class="font-bold text-gray-700 mr-2">{{ err.identifier }}:</span>
                                      {{ err.message }}
                                   </td>
                                </tr>
                             }
                          </tbody>
                       </table>
                    </div>
                 }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal Manual Add (Keep as before but clean) -->
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
          
          <form [formGroup]="form" (ngSubmit)="save()" class="p-8 max-h-[80vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-6 mb-6">
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
                <select formControlName="role"
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
                <input type="email" formControlName="email" placeholder="email@phenikaa-uni.edu.vn"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
              </div>

              <div class="col-span-1">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Số điện thoại</label>
                <input type="text" formControlName="phone" placeholder="0xxx"
                  class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
              </div>

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
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Số SV tối đa/đợt</label>
                  <input type="number" formControlName="maxStudentsPerBatch"
                    class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border">
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
                class="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                Hủy bỏ
              </button>
              <button type="submit" [disabled]="submitting()"
                class="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200">
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
      majorId: this.majorFilter,
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

  hasRole(user: UserResponse, role: string): boolean {
    return Array.isArray(user.roles) && user.roles.includes(role as UserRole);
  }
}
