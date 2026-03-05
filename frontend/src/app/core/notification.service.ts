import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NotificationResponse {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    referenceType?: string;
    referenceId?: string;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/notifications`;

    unreadCount = signal(0);
    notifications = signal<NotificationResponse[]>([]);

    loadUnreadCount(): void {
        this.http.get<{ data: number }>(`${this.baseUrl}/unread-count`).subscribe(res => {
            this.unreadCount.set(res.data);
        });
    }

    getNotifications(): Observable<{ data: NotificationResponse[] }> {
        return this.http.get<{ data: NotificationResponse[] }>(this.baseUrl).pipe(
            tap(res => {
                this.notifications.set(res.data);
                this.unreadCount.set(res.data.filter(n => !n.isRead).length);
            })
        );
    }

    markAsRead(id: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/read`, {}).pipe(
            tap(() => {
                this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
                this.unreadCount.update(c => Math.max(0, c - 1));
            })
        );
    }

    markAllAsRead(): Observable<any> {
        return this.http.post(`${this.baseUrl}/read-all`, {}).pipe(
            tap(() => {
                this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
                this.unreadCount.set(0);
            })
        );
    }
}
