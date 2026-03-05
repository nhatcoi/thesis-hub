import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ThesisService, ThesisResponse } from '../../core/thesis.service';
import { BatchService, Batch } from '../../core/batch.service';
import { AuthService } from '../../core/auth.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-head-students',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Danh sách Sinh viên Đồ án</h2>
        <div class="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
           <mat-icon class="text-indigo-600">domain</mat-icon>
           <span class="text-sm font-medium text-indigo-900">Đang xem: {{ currentScopeName() }}</span>
        </div>
      </div>
      
      <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div class="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-3">
            <!-- Filter by Scope -->
            <select 
              [(ngModel)]="selectedScope" 
              (change)="onFilterChange()"
              class="block min-w-[150px] pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm">
              <option value="MAJOR">Theo Ngành ({{ auth.currentUser()?.majorName }})</option>
              <option value="FACULTY">Theo Khoa ({{ auth.currentUser()?.facultyName }})</option>
              <option value="UNIVERSITY">Toàn Đại học</option>
            </select>

            <!-- Filter by Batch -->
            <select 
              [(ngModel)]="selectedBatchId" 
              (change)="onFilterChange()"
              class="block min-w-[150px] pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm">
              <option value="">Tất cả đợt</option>
              @for (batch of batches(); track batch.id) {
                <option [value]="batch.id">{{ batch.name }}</option>
              }
            </select>

            <!-- Filter by Status -->
            <select 
              [(ngModel)]="selectedStatus" 
              (change)="onFilterChange()"
              class="block min-w-[150px] pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm">
              <option value="">Trạng thái</option>
              <option value="ELIGIBLE_FOR_THESIS">Đủ điều kiện</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PASSED">Đạt</option>
              <option value="FAILED">Không đạt</option>
            </select>
          </div>

          <div class="relative rounded-md shadow-sm min-w-[250px]">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="text-gray-400 text-sm">search</mat-icon>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchQueryChange($event)"
              class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md" 
              placeholder="Tìm kiếm SV (Tên, MSSV)...">
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th (click)="toggleSort('student.studentCode')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                   <div class="flex items-center gap-1">
                      Mã định danh
                      <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'student.studentCode'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                   </div>
                </th>
                <th (click)="toggleSort('student.user.lastName')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                   <div class="flex items-center gap-1">
                      Họ
                      <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'student.user.lastName'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                   </div>
                </th>
                <th (click)="toggleSort('student.user.firstName')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                   <div class="flex items-center gap-1">
                      Tên
                      <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'student.user.firstName'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                   </div>
                </th>
                <th (click)="toggleSort('status')" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                   <div class="flex items-center gap-1">
                      Trạng thái
                      <mat-icon class="!text-[14px] !w-auto !h-auto text-gray-400" *ngIf="sortBy() === 'status'">{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                   </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Đề tài / GVHD</th>
                <th scope="col" class="relative px-6 py-3 text-center"><span class="sr-only">Thao tác</span></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              } @else if (theses().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-400 font-medium font-mono text-sm">
                    NO_DATA_FOUND
                  </td>
                </tr>
              } @else {
                @for (thesis of theses(); track thesis.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold font-mono">
                      {{ thesis.studentCode }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ thesis.studentLastName }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-7 w-7 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 mr-2">
                           <span class="text-indigo-600 text-[10px] font-bold">{{ thesis.studentFirstName.substring(0, 1).toUpperCase() }}</span>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ thesis.studentFirstName }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getStatusClass(thesis.status)" class="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded-full border">
                        {{ thesis.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900 line-clamp-1 max-w-[300px]" [title]="thesis.topicName">
                        {{ thesis.topicName }}
                      </div>
                      <div class="mt-0.5 flex items-center gap-1">
                        <mat-icon class="!text-[12px] !w-auto !h-auto text-indigo-400">person</mat-icon>
                        <span class="text-[11px] text-gray-500 font-medium">GVHD: {{ thesis.advisorName }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button class="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm bg-white border border-indigo-50" title="Xem chi tiết">
                        <mat-icon class="text-lg">visibility</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
             Hiển thị <b>{{ theses().length }}</b> kết quả 
             @if (totalElements() > 0) {
                tổng số <b>{{ totalElements() }}</b>
             }
          </div>
          <div class="flex space-x-2">
             <button (click)="changePage(-1)" [disabled]="page() === 0" class="px-3 py-1 border rounded-md bg-white text-sm disabled:opacity-50">Trước</button>
             <button (click)="changePage(1)" [disabled]="(page() + 1) * 50 >= totalElements()" class="px-3 py-1 border rounded-md bg-white text-sm disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentsComponent implements OnInit {
  private thesisService = inject(ThesisService);
  private batchService = inject(BatchService);
  auth = inject(AuthService);

  theses = signal<ThesisResponse[]>([]);
  batches = signal<Batch[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  page = signal(0);
  sortBy = signal('student.studentCode');
  sortDir = signal<'asc' | 'desc'>('asc');

  selectedScope = 'MAJOR';
  selectedBatchId = '';
  selectedStatus = '';
  searchQuery = '';

  private searchSubject = new Subject<string>();

  currentScopeName() {
    switch (this.selectedScope) {
      case 'MAJOR': return `Ngành ${this.auth.currentUser()?.majorName}`;
      case 'FACULTY': return `Khoa ${this.auth.currentUser()?.facultyName}`;
      default: return 'Toàn Đại học';
    }
  }

  ngOnInit(): void {
    this.loadBatches();
    this.loadTheses();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page.set(0);
      this.loadTheses();
    });
  }

  loadBatches() {
    this.batchService.listBatches({ size: 100 }).subscribe(res => {
      this.batches.set(res.content);
    });
  }

  loadTheses() {
    this.loading.set(true);
    let majorId: string | undefined = undefined;
    let facultyId: string | undefined = undefined;

    if (this.selectedScope === 'MAJOR') {
      majorId = this.auth.currentUser()?.majorId;
    } else if (this.selectedScope === 'FACULTY') {
      facultyId = this.auth.currentUser()?.facultyId;
    }

    this.thesisService.getTheses({
      batchId: this.selectedBatchId,
      majorId: majorId,
      facultyId: facultyId,
      status: this.selectedStatus,
      search: this.searchQuery,
      page: this.page(),
      size: 50,
      sort: `${this.sortBy()},${this.sortDir()}`
    }).subscribe({
      next: (res) => {
        this.theses.set(res.content);
        this.totalElements.set(res.totalElements);
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
    this.loadTheses();
  }

  onFilterChange() {
    this.page.set(0);
    this.loadTheses();
  }

  onSearchQueryChange(query: string) {
    this.searchSubject.next(query);
  }

  changePage(delta: number) {
    this.page.update(p => p + delta);
    this.loadTheses();
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'ELIGIBLE_FOR_THESIS': return 'bg-green-50 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED': case 'PASSED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FAILED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }
}
