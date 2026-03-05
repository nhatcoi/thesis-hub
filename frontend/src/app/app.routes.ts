import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth.service';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

const authGuard = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ready$;
  return auth.isLoggedIn() ? true : router.parseUrl('/login');
};

const loginGuard = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ready$;
  const user = auth.currentUser();
  if (user && user.roles.length <= 1) {
    return router.parseUrl('/dashboard');
  }
  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pdt/batches', loadComponent: () => import('./features/pdt/batches.component').then(m => m.BatchesComponent) },
      { path: 'pdt/import', loadComponent: () => import('./features/pdt/import.component').then(m => m.ImportComponent) },
      { path: 'head/students', loadComponent: () => import('./features/head/students.component').then(m => m.StudentsComponent) },
      { path: 'head/topics', loadComponent: () => import('./features/head/topics.component').then(m => m.TopicsComponent) },
      { path: 'lecturer/topics', loadComponent: () => import('./features/lecturer/topics.component').then(m => m.TopicsComponent) },
      { path: 'lecturer/requests', loadComponent: () => import('./features/lecturer/requests.component').then(m => m.RequestsComponent) },
      { path: 'lecturer/outlines', loadComponent: () => import('./features/lecturer/outlines.component').then(m => m.OutlinesComponent) },
      { path: 'lecturer/progress', loadComponent: () => import('./features/lecturer/progress.component').then(m => m.ProgressComponent) },
      { path: 'lecturer/defenses', loadComponent: () => import('./features/lecturer/defenses.component').then(m => m.DefensesComponent) },
      { path: 'student/topics', loadComponent: () => import('./features/student/topics.component').then(m => m.TopicsComponent) },
      { path: 'student/outline', loadComponent: () => import('./features/student/outline.component').then(m => m.OutlineComponent) },
      { path: 'student/progress', loadComponent: () => import('./features/student/progress.component').then(m => m.ProgressComponent) },
      { path: 'student/defense', loadComponent: () => import('./features/student/defense.component').then(m => m.DefenseComponent) },
      { path: 'student/notifications', loadComponent: () => import('./features/student/notifications.component').then(m => m.NotificationsComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
