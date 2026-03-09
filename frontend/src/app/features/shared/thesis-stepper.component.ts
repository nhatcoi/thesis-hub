import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ThesisService } from '../../core/thesis.service';
import { Router } from '@angular/router';

interface StatusStep {
  key: string;
  label: string;
  icon: string;
  description: string;
  route?: string;
}

@Component({
  selector: 'app-thesis-stepper',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    } @else if (!batchName()) {
      <div class="app-card p-8 text-center">
        <mat-icon class="!text-gray-300 !text-[32px]">school</mat-icon>
        <h3 class="text-sm font-bold text-gray-900 mt-2">Chưa tham gia đợt ĐATN</h3>
        <p class="text-xs text-gray-400 mt-1">Bạn cần được phân vào một đợt đồ án để bắt đầu.</p>
      </div>
    } @else {
      <div class="app-card !p-6 space-y-5">
        <!-- Batch heading -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-sm font-bold text-gray-900">{{ batchName() }}</h3>
            @if (topicTitle()) {
              <p class="text-xs text-gray-500 mt-0.5">Đề tài: <span class="font-bold text-indigo-600">{{ topicTitle() }}</span></p>
            }
            @if (advisorName()) {
              <p class="text-xs text-gray-400 mt-0.5">GVHD: {{ advisorName() }}</p>
            }
          </div>
          <div class="app-badge !text-[10px] !px-2.5 !py-1 !font-black"
            [class]="currentStepIndex() >= 6 ? '!bg-emerald-50 !text-emerald-600 !border-emerald-100' : '!bg-indigo-50 !text-indigo-600 !border-indigo-100'">
            {{ currentStepIndex() >= 6 ? '✓ Sẵn sàng bảo vệ' : getStatusLabel() }}
          </div>
        </div>

        <!-- Stepper -->
        <div class="relative">
          @for (step of steps; track step.key; let i = $index; let last = $last) {
            <div class="flex items-start gap-3 cursor-pointer group" (click)="navigateTo(step)">
              <!-- Connector line + dot -->
              <div class="flex flex-col items-center w-6 shrink-0">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                  [class]="getStepStyle(i)">
                  @if (isCompleted(i)) {
                    <mat-icon class="!text-[14px] !w-4 !h-4">check</mat-icon>
                  } @else if (isCurrent(i)) {
                    <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  } @else {
                    <span class="text-[9px]">{{ i + 1 }}</span>
                  }
                </div>
                @if (!last) {
                  <div class="w-0.5 h-8 transition-colors"
                    [class]="isCompleted(i) ? 'bg-emerald-300' : 'bg-gray-100'"></div>
                }
              </div>

              <!-- Content -->
              <div class="pb-6 flex-1 min-w-0 -mt-0.5">
                <div class="flex items-center gap-2">
                  <mat-icon class="!w-4 !h-4 !text-[14px] transition-colors"
                    [class]="isCompleted(i) ? 'text-emerald-500' : isCurrent(i) ? 'text-indigo-600' : 'text-gray-300'">
                    {{ step.icon }}
                  </mat-icon>
                  <p class="text-xs font-bold transition-colors"
                    [class]="isCompleted(i) ? 'text-emerald-700' : isCurrent(i) ? 'text-indigo-700' : 'text-gray-400'">
                    {{ step.label }}
                  </p>
                </div>
                <p class="text-[10px] ml-6 mt-0.5 transition-colors"
                  [class]="isCurrent(i) ? 'text-gray-600 font-medium' : 'text-gray-400'">
                  {{ step.description }}
                </p>
                @if (isCurrent(i) && step.route) {
                  <button class="ml-6 mt-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-1">
                    <mat-icon class="!text-[12px] !w-3 !h-3">arrow_forward</mat-icon>
                    Thực hiện
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ThesisStepperComponent implements OnInit {
  private thesisService = inject(ThesisService);
  private router = inject(Router);

  loading = signal(true);
  batchName = signal('');
  topicTitle = signal('');
  advisorName = signal('');
  thesisStatus = signal('');

  steps: StatusStep[] = [
    { key: 'TOPIC', label: 'Đăng ký đề tài', icon: 'assignment', description: 'Chọn đề tài hoặc đề xuất đề tài mới.', route: '/student/topics' },
    { key: 'TOPIC_APPROVED', label: 'Đề tài được duyệt', icon: 'verified', description: 'Đề tài đã được phê duyệt bởi GVHD.', route: '/student/topics' },
    { key: 'OUTLINE', label: 'Nộp đề cương', icon: 'description', description: 'Nộp đề cương đồ án để GVHD xem xét.', route: '/student/outline' },
    { key: 'OUTLINE_APPROVED', label: 'Đề cương được duyệt', icon: 'task_alt', description: 'GVHD đã duyệt đề cương. Bắt đầu thực hiện.', route: '/student/outline' },
    { key: 'IN_PROGRESS', label: 'Thực hiện đồ án', icon: 'engineering', description: 'Cập nhật tiến độ hàng tuần cho GVHD.', route: '/student/progress' },
    { key: 'DEFENSE_REQUESTED', label: 'Đăng ký bảo vệ', icon: 'upload_file', description: 'Nộp hồ sơ: báo cáo, code, slide.', route: '/student/defense' },
    { key: 'READY_FOR_DEFENSE', label: 'Sẵn sàng bảo vệ', icon: 'emoji_events', description: 'Đã hoàn tất Giai đoạn 1. Chờ lịch bảo vệ.' }
  ];

  // Map ThesisStatus → step index
  private statusToStep: Record<string, number> = {
    'ELIGIBLE_FOR_THESIS': -1,
    'TOPIC_PENDING_APPROVAL': 0,
    'TOPIC_APPROVED': 1,
    'TOPIC_ASSIGNED': 1,
    'TOPIC_REJECTED': 0,
    'OUTLINE_SUBMITTED': 2,
    'OUTLINE_APPROVED': 3,
    'OUTLINE_REJECTED': 2,
    'IN_PROGRESS': 4,
    'DEFENSE_REQUESTED': 5,
    'DEFENSE_APPROVED': 6,
    'DEFENSE_REJECTED': 5,
    'READY_FOR_DEFENSE': 6,
    'DEFENDING': 6,
    'GRADED': 6,
    'PASSED': 6,
    'FAILED': 6,
    'COMPLETED': 6
  };

  ngOnInit(): void {
    this.thesisService.getMyActiveBatch().subscribe({
      next: (batch) => {
        if (batch) {
          this.batchName.set(batch.batchName);
          this.thesisStatus.set(batch.thesisStatus || '');
          this.topicTitle.set(batch.topicTitle || '');
          this.advisorName.set(batch.advisorName || '');
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  currentStepIndex(): number {
    return this.statusToStep[this.thesisStatus()] ?? -1;
  }

  isCompleted(i: number): boolean {
    return i < this.currentStepIndex();
  }

  isCurrent(i: number): boolean {
    return i === this.currentStepIndex();
  }

  getStepStyle(i: number): string {
    if (this.isCompleted(i)) return 'bg-emerald-500 text-white ring-2 ring-emerald-200';
    if (this.isCurrent(i)) return 'bg-indigo-600 text-white ring-2 ring-indigo-200 shadow-lg shadow-indigo-100';
    return 'bg-gray-100 text-gray-400';
  }

  getStatusLabel(): string {
    const map: Record<string, string> = {
      'ELIGIBLE_FOR_THESIS': 'Đủ điều kiện',
      'TOPIC_PENDING_APPROVAL': 'Chờ duyệt đề tài',
      'TOPIC_APPROVED': 'Đề tài được duyệt',
      'TOPIC_ASSIGNED': 'Đề tài được duyệt',
      'TOPIC_REJECTED': 'Đề tài bị từ chối',
      'OUTLINE_SUBMITTED': 'Chờ duyệt đề cương',
      'OUTLINE_APPROVED': 'Đề cương được duyệt',
      'OUTLINE_REJECTED': 'Đề cương bị từ chối',
      'IN_PROGRESS': 'Đang thực hiện',
      'DEFENSE_REQUESTED': 'Chờ duyệt bảo vệ',
      'DEFENSE_REJECTED': 'Bảo vệ bị từ chối',
      'READY_FOR_DEFENSE': 'Sẵn sàng bảo vệ'
    };
    return map[this.thesisStatus()] || this.thesisStatus();
  }

  navigateTo(step: StatusStep): void {
    if (step.route && this.isCurrent(this.steps.indexOf(step))) {
      this.router.navigate([step.route]);
    }
  }
}
