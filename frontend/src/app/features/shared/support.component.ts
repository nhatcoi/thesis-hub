import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <!-- Header -->
      <div class="app-section-header">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            @if (icon() === 'hub') {
              <img src="/logo.svg" alt="ThesisHub Logo" class="w-9 h-9">
            } @else {
              <mat-icon class="text-indigo-600">{{ icon() }}</mat-icon>
            }
          </div>
          <div>
            <h2 class="app-title !mb-0">{{ title() }}</h2>
            <p class="app-subtitle">{{ subtitle() }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Internal) -->
      <div class="flex gap-2 border-b border-gray-100 pb-px overflow-x-auto scrollbar-hide">
        @for (tab of tabs; track tab.id) {
          <a [routerLink]="['/support', tab.id]"
            class="px-4 py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap"
            [class]="activeTab() === tab.id 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'">
            {{ tab.label }}
          </a>
        }
      </div>

      <!-- Content Area -->
      <div class="app-card !p-8">
        @if (activeTab() === 'about') {
          <div class="prose prose-sm prose-indigo max-w-none space-y-6">
            <h3 class="text-xl font-black text-gray-900 leading-tight">Về ThesisHub PKA</h3>
            <p class="text-gray-600 leading-relaxed font-medium">
              Chào mừng bạn đến với **ThesisHub PKA** – Nền tảng quản lý đồ án tốt nghiệp thông minh của Đại học Phenikaa. 
              Chúng tôi được xây dựng với sứ mệnh số hóa toàn bộ quy trình từ đề xuất đề tài, duyệt đề cương cho đến khi bảo vệ đồ án cuối cùng.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 class="text-indigo-700 font-black uppercase text-[10px] tracking-widest mb-2">Tầm nhìn</h4>
                <p class="text-[11px] text-gray-600">Trở thành hệ thống cốt lõi hỗ trợ đắc lực cho sinh viên và giảng viên, nâng cao chất lượng nghiên cứu khoa học tại trường.</p>
              </div>
              <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h4 class="text-emerald-700 font-black uppercase text-[10px] tracking-widest mb-2">Công nghệ</h4>
                <p class="text-[11px] text-gray-600">Sử dụng stack công nghệ hiện đại (Spring Boot & Angular) để đảm bảo tính ổn định, bảo mật và trải nghiệm mượt mà.</p>
              </div>
            </div>
            <h4 class="text-base font-black text-gray-900">Liên hệ chúng tôi</h4>
            <div class="space-y-3 font-medium">
              <div class="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
                <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm"><mat-icon class="!text-sm">location_on</mat-icon></div>
                <div class="min-w-0">
                  <p class="text-[11px] font-black uppercase text-gray-400">Địa chỉ</p>
                  <p class="text-xs text-gray-700">Yên Nghĩa, Hà Đông, Hà Nội</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
                <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm"><mat-icon class="!text-sm">email</mat-icon></div>
                <div class="min-w-0">
                  <p class="text-[11px] font-black uppercase text-gray-400">Email Hỗ trợ</p>
                  <p class="text-xs text-gray-700">support.thesishub&#64;phenikaa-uni.edu.vn</p>
                </div>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'privacy') {
          <div class="prose prose-sm prose-indigo max-w-none space-y-6">
            <h3 class="text-xl font-black text-gray-900">Chính sách Bảo mật</h3>
            <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest">Cập nhật lần cuối: 09/03/2026</p>
            <div class="space-y-6 text-gray-600">
              <section>
                <h4 class="text-xs font-black uppercase text-gray-900 tracking-wider">1. Thu thập thông tin</h4>
                <p class="text-xs">Chúng tôi thu thập các thông tin cá nhân cần thiết bao gồm: Họ tên, mã sinh viên, email trường cấp, và dữ liệu liên quan đến quá trình thực hiện đồ án để phục vụ mục đích học thuật.</p>
              </section>
              <section>
                <h4 class="text-xs font-black uppercase text-gray-900 tracking-wider">2. Sử dụng dữ liệu</h4>
                <p class="text-xs">Dữ liệu của bạn được sử dụng để xác thực tài khoản, ghi nhận tiến độ, lưu trữ hồ sơ bảo vệ và gửi các thông báo quan trọng thông qua hệ thống thông báo realtime.</p>
              </section>
              <section>
                <h4 class="text-xs font-black uppercase text-gray-900 tracking-wider">3. Bảo mật file</h4>
                <p class="text-xs">Tất cả file tài liệu (đề cương, báo cáo, code) được lưu trữ trên server an toàn và chỉ giảng viên hướng dẫn hoặc bộ phận quản lý có thẩm quyền mới có quyền truy cập.</p>
              </section>
            </div>
            <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 items-center">
              <mat-icon class="text-amber-500">verified_user</mat-icon>
              <p class="text-xs text-amber-700 font-bold italic">Bằng cách sử dụng ThesisHub, bạn đồng ý với các quy định bảo mật này.</p>
            </div>
          </div>
        }

        @if (activeTab() === 'terms') {
          <div class="prose prose-sm prose-indigo max-w-none space-y-6">
            <h3 class="text-xl font-black text-gray-900">Điều khoản Dịch vụ</h3>
            <div class="space-y-5">
              <div class="p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                <h4 class="text-sm font-black text-gray-800 mb-2">Quyền và Trách nhiệm của Sinh viên</h4>
                <ul class="text-xs text-gray-600 space-y-2 list-disc pl-4">
                  <li>Phải cung cấp thông tin chính xác và trung thực.</li>
                  <li>Phải tuân thủ các mốc thời gian (deadline) đã được công bố cho mỗi đợt đồ án.</li>
                  <li>Tuyệt đối không sử dụng công cụ để tấn công hoặc phá hoại hệ thống.</li>
                </ul>
              </div>
              <div class="p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                <h4 class="text-sm font-black text-gray-800 mb-2">Quyền và Trách nhiệm của Giảng viên</h4>
                <ul class="text-xs text-gray-600 space-y-2 list-disc pl-4">
                  <li>Xử lý các yêu cầu của sinh viên đúng hạn.</li>
                  <li>Bảo mật thông tin trao đổi và kết quả đánh giá cho đến khi công bố chính thức.</li>
                </ul>
              </div>
              <p class="text-[10px] text-gray-400 italic">Mọi vi phạm các điều khoản trên có thể dẫn đến việc đình chỉ tài khoản tạm thời hoặc vĩnh viễn.</p>
            </div>
          </div>
        }

        @if (activeTab() === 'faq') {
          <div class="space-y-4">
            <h3 class="text-xl font-black text-gray-900 mb-6">Câu hỏi thường gặp</h3>
            @for (q of faqs; track q.q) {
              <div class="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div class="px-5 py-3 bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all border-b border-gray-50">
                  <span class="text-xs font-black text-gray-900">{{ q.q }}</span>
                  <mat-icon class="!text-gray-300">help_outline</mat-icon>
                </div>
                <div class="px-5 py-4 bg-gray-50/30">
                  <p class="text-xs text-gray-500 leading-relaxed">{{ q.a }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class SupportComponent implements OnInit {
  private route = inject(ActivatedRoute);

  activeTab = signal('about');
  title = signal('Về chúng tôi');
  subtitle = signal('Tìm hiểu thêm về nền tảng và con người ThesisHub');
  icon = signal('hub');

  tabs = [
    { id: 'about', label: 'Về chúng tôi', title: 'Về chúng tôi', sub: 'Tìm hiểu thêm về nền tảng và con người ThesisHub', icon: 'hub' },
    { id: 'privacy', label: 'Bảo mật', title: 'Chính sách bảo mật', sub: 'Cách chúng tôi bảo vệ dữ liệu của bạn', icon: 'security' },
    { id: 'terms', label: 'Điều khoản', title: 'Điều khoản dịch vụ', sub: 'Quy định sử dụng hệ thống ThesisHub', icon: 'description' },
    { id: 'faq', label: 'Hỏi đáp (FAQ)', title: 'Câu hỏi thường gặp', sub: 'Giải đáp thắc mắc của bạn', icon: 'help' }
  ];

  faqs = [
    { q: 'Tôi quên mã sinh viên / mật khẩu thì phải làm sao?', a: 'Dự án sử dụng hệ thống xác thực tập trung (SSO) của trường. Vui lòng liên hệ Phòng máy hoặc Bộ phận IT để khôi phục mật khẩu.' },
    { q: 'Tại sao tôi không thể đăng ký đề tài?', a: 'Có thể bạn chưa đủ điều kiện làm đồ án (nợ môn, thiếu tín chỉ) hoặc đợt đồ án hiện tại chưa đến thời gian mở cổng đăng ký.' },
    { q: 'Tôi có thể đổi đề tài sau khi đã được duyệt không?', a: 'Việc đổi đề tài sau khi duyệt đề cương cần có ý kiến đồng ý bằng văn bản của Giảng viên hướng dẫn và Trưởng bộ môn.' },
    { q: 'Kích thước file tối đa có thể nộp là bao nhiêu?', a: 'Hệ thống hỗ trợ file lên đến 50MB. Đối với source code quá lớn, bạn nên upload lên Drive/Github và đính kèm link trong file báo cáo.' }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['type'] || 'about';
      this.activeTab.set(id);
      const tab = this.tabs.find(t => t.id === id);
      if (tab) {
        this.title.set(tab.title);
        this.subtitle.set(tab.sub);
        this.icon.set(tab.icon);
      }
    });
  }
}
