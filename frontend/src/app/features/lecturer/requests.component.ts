import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TopicRegistrationService, TopicRegistration } from '../../core/topic-registration.service';

@Component({
  selector: 'app-lecturer-requests',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Yêu cầu đăng ký đề tài</h2>
          <p class="text-sm text-gray-500 mt-1">Xem và duyệt các yêu cầu đăng ký vào đề tài của bạn.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (registrations().length === 0) {
        <div class="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
          <div class="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-indigo-600">person_add_disabled</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Chưa có yêu cầu nào</h3>
          <p class="text-gray-500 mt-2 max-w-xs mx-auto">Các yêu cầu đăng ký từ sinh viên sẽ xuất hiện tại đây.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (reg of registrations(); track reg.id) {
            <div class="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  {{ reg.studentName.substring(0, 1) }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">{{ reg.studentName }}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span class="bg-gray-100 px-2 py-0.5 rounded-lg">{{ reg.studentCode }}</span>
                    <span>•</span>
                    <span>Đăng ký lúc: {{ reg.createdAt | date:'HH:mm dd/MM/yyyy' }}</span>
                  </div>
                  <div class="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p class="text-sm text-gray-700 font-medium">
                      <span class="text-gray-400">Đề tài:</span> {{ reg.topicTitle }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                @if (reg.status === 'PENDING') {
                  <button (click)="processRegistration(reg.id, 'APPROVED')" 
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center">
                    <mat-icon class="mr-1.5 !text-lg">check_circle</mat-icon> Duyệt
                  </button>
                  <button (click)="processRegistration(reg.id, 'REJECTED')" 
                    class="px-4 py-2 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 text-sm font-bold rounded-xl transition-all flex items-center">
                    <mat-icon class="mr-1.5 !text-lg">cancel</mat-icon> Từ chối
                  </button>
                } @else {
                  <span [class]="getStatusClass(reg.status)" 
                    class="px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <mat-icon class="mr-1 !text-sm">{{ reg.status === 'APPROVED' ? 'check' : 'close' }}</mat-icon>
                    {{ reg.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối' }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class RequestsComponent implements OnInit {
  private registrationService = inject(TopicRegistrationService);
  private snackBar = inject(MatSnackBar);

  registrations = signal<TopicRegistration[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading.set(true);
    this.registrationService.getMyRegistrations().subscribe({
      next: (res) => {
        this.registrations.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  processRegistration(id: string, status: 'APPROVED' | 'REJECTED'): void {
    let rejectReason = undefined;
    if (status === 'REJECTED') {
      rejectReason = prompt('Nhập lý do từ chối (không bắt buộc):') || undefined;
    }

    this.registrationService.approveRegistration(id, { status, rejectReason }).subscribe({
      next: () => {
        this.loadRegistrations();
        this.snackBar.open(status === 'APPROVED' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end'
        });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Không thể thực hiện thao tác', 'Đóng', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
      : 'bg-rose-50 text-rose-600 border border-rose-100';
  }
}
