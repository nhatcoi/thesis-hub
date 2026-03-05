import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService, DashboardStats } from '../../core/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="space-y-6">
      @if (loading()) {
        <div class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else {
        <!-- Active Batch Info -->
        <div class="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-medium text-gray-900">Tổng quan hệ thống</h2>
              <p class="text-sm text-gray-500 mt-1">Chào mừng <span class="font-bold text-indigo-600">{{ auth.currentUser()?.name }}</span> quay trở lại.</p>
            </div>
            <div class="text-right hidden sm:block">
              <p class="text-xs text-gray-400">Thời gian hiện tại</p>
              <p class="text-sm font-medium text-gray-900">{{ today | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        @if (auth.currentUser()?.activeRole === 'TRAINING_DEPT' || auth.currentUser()?.activeRole === 'ADMIN' || auth.currentUser()?.activeRole === 'DEPT_HEAD') {
          <!-- Stats Grid for PDT/ADMIN -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Total Students -->
            <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                    <mat-icon class="text-blue-600">school</mat-icon>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Tổng sinh viên</dt>
                      <dd class="text-2xl font-bold text-gray-900">{{ stats()?.totalStudents || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-blue-50 px-5 py-2">
                <div class="text-xs font-medium text-blue-700 flex justify-between">
                  <span>Đủ điều kiện: {{ stats()?.eligibleStudents || 0 }}</span>
                  <span>Chưa đủ: {{ stats()?.ineligibleStudents || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Total Lecturers -->
            <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 p-3 bg-green-50 rounded-lg">
                    <mat-icon class="text-green-600">assignment_ind</mat-icon>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Giảng viên</dt>
                      <dd class="text-2xl font-bold text-gray-900">{{ stats()?.totalLecturers || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-green-50 px-5 py-2">
                <span class="text-xs font-medium text-green-700">Đang hoạt động trong hệ thống</span>
              </div>
            </div>

            <!-- Total Batches -->
            <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 p-3 bg-purple-50 rounded-lg">
                    <mat-icon class="text-purple-600">calendar_today</mat-icon>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Số đợt đồ án</dt>
                      <dd class="text-2xl font-bold text-gray-900">{{ stats()?.totalBatches || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-purple-50 px-5 py-2">
                <span class="text-xs font-medium text-purple-700">Đang chạy: {{ stats()?.batchesByStatus?.['ACTIVE'] || 0 }}</span>
              </div>
            </div>

            <!-- Total Topics -->
            <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 p-3 bg-yellow-50 rounded-lg">
                    <mat-icon class="text-yellow-600">inventory_2</mat-icon>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Đề tài đồ án</dt>
                      <dd class="text-2xl font-bold text-gray-900">{{ stats()?.totalTopics || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-yellow-50 px-5 py-2">
                <div class="text-xs font-medium text-yellow-700 flex justify-between">
                  <span>Đã duyệt: {{ stats()?.topicsByStatus?.['APPROVED'] || 0 }}</span>
                  <span>Chờ: {{ stats()?.topicsByStatus?.['PENDING'] || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Info Charts/Lists could go here -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Chi tiết Đề tài theo Trạng thái</h3>
              <div class="space-y-4">
                <div *ngFor="let entry of getObjectEntries(stats()?.topicsByStatus)" class="flex items-center gap-4">
                  <span class="text-xs font-bold w-24 text-gray-500">{{ entry[0] }}</span>
                  <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-full rounded-full" [style.width.%]="(entry[1] / (stats()?.totalTopics || 1)) * 100"></div>
                  </div>
                  <span class="text-sm font-semibold">{{ entry[1] }}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Hoạt động Điều kiện Sinh viên</h3>
              <div class="flex items-center justify-around h-32">
                 <div class="text-center">
                    <p class="text-3xl font-extrabold text-indigo-600">{{ stats()?.eligibleStudents || 0 }}</p>
                    <p class="text-xs text-gray-500 mt-1 uppercase font-bold">Đủ điều kiện</p>
                 </div>
                 <div class="h-16 w-px bg-gray-200"></div>
                 <div class="text-center">
                    <p class="text-3xl font-extrabold text-orange-500">{{ stats()?.ineligibleStudents || 0 }}</p>
                    <p class="text-xs text-gray-500 mt-1 uppercase font-bold">Chưa đủ ĐK</p>
                 </div>
              </div>
              <p class="text-[11px] text-gray-400 mt-4 text-center italic">
                * Dữ liệu được cập nhật dựa trên GPA và số tín chỉ tích lũy của sinh viên.
              </p>
            </div>
          </div>
        }
        
        <!-- Other roles sections can remain as placeholders or follow similar patterns -->
        @if (auth.currentUser()?.activeRole === 'STUDENT') {
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
            <mat-icon class="text-indigo-400 !text-[48px] mb-2">dashboard_customize</mat-icon>
            <h3 class="text-lg font-bold text-indigo-900">Tính năng đang phát triển</h3>
            <p class="text-indigo-600">Giao diện Dashboard dành riêng cho Sinh viên đang được tối ưu hóa.</p>
          </div>
        }
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  today = new Date();

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getObjectEntries(obj: any): [string, number][] {
    if (!obj) return [];
    return Object.entries(obj) as [string, number][];
  }
}
