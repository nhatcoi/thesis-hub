import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ThesisService, ThesisResponse, ThesisStatus } from '../../core/thesis.service';

@Component({
  selector: 'app-lecturer-progress',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Sinh viên đang hướng dẫn</h2>
          <p class="text-sm text-gray-500 mt-1">Theo dõi tiến độ thực hiện đồ án của các sinh viên bạn phụ trách.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (theses().length === 0) {
        <div class="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
          <div class="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-indigo-600">assignment_ind</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Chưa có sinh viên nào</h3>
          <p class="text-gray-500 mt-2 max-w-xs mx-auto">Danh sách sinh viên bạn hướng dẫn sẽ xuất hiện sau khi các yêu cầu đăng ký được duyệt.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (thesis of theses(); track thesis.id) {
            <div class="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group">
              <div class="flex flex-col md:flex-row justify-between gap-6">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {{ thesis.studentName.substring(0, 1) }}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {{ thesis.studentName }}
                    </h3>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{{ thesis.studentCode }}</span>
                      <span class="text-xs font-medium text-gray-500">{{ thesis.majorName }}</span>
                    </div>
                    <div class="mt-4 flex items-center gap-2">
                       <span [class]="getStatusClass(thesis.status)" 
                        class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {{ getStatusLabel(thesis.status) }}
                      </span>
                      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-lg">
                        {{ thesis.batchName }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex-grow max-w-xl">
                  <div class="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 h-full">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-2">Đề tài đang thực hiện</p>
                    <p class="text-sm font-bold text-gray-900 leading-snug">{{ thesis.topicName }}</p>
                  </div>
                </div>

                <div class="flex flex-col justify-center items-end gap-2 shrink-0">
                  <button class="w-full md:w-auto px-4 py-2 bg-white border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 text-gray-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center">
                    <mat-icon class="mr-1.5 !text-lg">visibility</mat-icon> Xem chi tiết
                  </button>
                  <button class="w-full md:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center">
                    <mat-icon class="mr-1.5 !text-lg">chat_bubble_outline</mat-icon> Nhận xét
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ProgressComponent implements OnInit {
  private thesisService = inject(ThesisService);

  theses = signal<ThesisResponse[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadTheses();
  }

  loadTheses(): void {
    this.loading.set(true);
    this.thesisService.getAdvisingTheses().subscribe({
      next: (data) => {
        this.theses.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ELIGIBLE_FOR_THESIS': return 'Mới giao';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'OUTLINE_SUBMITTED': return 'Đã nộp đề cương';
      case 'OUTLINE_APPROVED': return 'Đã duyệt đề cương';
      case 'READY_FOR_DEFENSE': return 'Sẵn sàng bảo vệ';
      case 'GRADED': return 'Đã chấm điểm';
      case 'COMPLETED': return 'Hoàn thành';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'OUTLINE_SUBMITTED': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'OUTLINE_APPROVED': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'READY_FOR_DEFENSE': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'COMPLETED': return 'bg-gray-50 text-gray-500 border border-gray-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  }
}
