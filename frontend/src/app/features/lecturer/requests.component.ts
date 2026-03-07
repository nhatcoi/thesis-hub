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
    <div class="space-y-4">
      <div class="app-section-header">
        <h2 class="app-title">Yêu cầu đăng ký đề tài</h2>
        <p class="app-subtitle">Xem và duyệt các yêu cầu đăng ký vào đề tài của bạn.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (registrations().length === 0) {
        <div class="p-10 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
          <h3 class="text-sm font-bold text-gray-900">Chưa có yêu cầu nào</h3>
          <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Các yêu cầu đăng ký từ sinh viên sẽ xuất hiện tại đây.</p>
        </div>
      } @else {
        <div class="app-list-container">
          @for (reg of registrations(); track reg.id) {
            <div class="app-list-item">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                    {{ reg.studentName.substring(0, 1) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-sm font-bold text-gray-900">{{ reg.studentName }}</h3>
                      @if (reg.topicSource === 'LECTURER') {
                        <span class="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded tracking-tighter uppercase italic">Đăng ký (FCFS)</span>
                      } @else {
                        <span class="text-[9px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded tracking-tighter uppercase italic">Yêu cầu từ SV</span>
                      }
                    </div>
                    <div class="flex items-center gap-2 text-[11px] text-gray-500">
                      <span class="font-medium text-indigo-600">{{ reg.studentCode }}</span>
                      <span>•</span>
                      <span>{{ reg.createdAt | date:'HH:mm dd/MM/yyyy' }}</span>
                    </div>
                    <div class="mt-1 text-xs text-gray-600 italic">
                      Đề tài: {{ reg.topicTitle }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  @if (reg.status === 'PENDING') {
                    <button (click)="processRegistration(reg.id, 'APPROVED')" class="app-btn-primary">
                      <mat-icon class="mr-1.5 !text-base">check_circle</mat-icon> Duyệt
                    </button>
                    <button (click)="processRegistration(reg.id, 'REJECTED')" class="app-btn-secondary">
                      <mat-icon class="mr-1.5 !text-base">cancel</mat-icon> Từ chối
                    </button>
                  } @else {
                    <span [class]="getStatusClass(reg.status)" class="app-badge">
                      {{ reg.status === 'APPROVED' ? 'Đã duyệt' : (reg.status === 'REJECTED' ? 'Đã từ chối' : reg.status) }}
                    </span>
                  }
                </div>
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
      const reason = prompt('Nhập lý do từ chối (không bắt buộc):');
      if (reason === null) return; // Cancelled
      rejectReason = reason || undefined;
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
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
      : 'border-rose-100 bg-rose-50 text-rose-700';
  }
}

