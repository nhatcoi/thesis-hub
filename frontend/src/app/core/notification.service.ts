import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client, IMessage } from '@stomp/stompjs';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class NotificationService implements OnDestroy {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    private baseUrl = `${environment.apiUrl}/notifications`;

    private stompClient: Client | null = null;
    private connected = false;

    unreadCount = signal(0);
    notifications = signal<NotificationResponse[]>([]);

    /** Load initial unread count from REST API */
    loadUnreadCount(): void {
        this.http.get<{ data: number }>(`${this.baseUrl}/unread-count`).subscribe({
            next: res => {
                this.unreadCount.set(res.data);
            },
            error: () => {}
        });
    }

    /** Connect to WebSocket using native WebSocket (no SockJS needed) */
    connectWebSocket(): void {
        if (this.connected || this.stompClient) return;

        const userId = this.auth.currentUser()?.id;
        if (!userId) {
            console.warn('[WS] No userId available, skipping WebSocket connect');
            return;
        }

        // Build WebSocket URL: http://localhost:8080/api → ws://localhost:8080/ws
        const wsUrl = environment.apiUrl.replace('/api', '/ws').replace('http://', 'ws://').replace('https://', 'wss://');
        console.log('[WS] Connecting to:', wsUrl, 'for user:', userId);

        this.stompClient = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });

        this.stompClient.onConnect = () => {
            this.connected = true;
            console.log('[WS] ✅ Connected to WebSocket');

            // Subscribe to personal notification topic
            const destination = `/topic/notifications/${userId}`;
            console.log('[WS] Subscribing to:', destination);

            this.stompClient!.subscribe(destination, (message: IMessage) => {
                console.log('[WS] 🔔 Received notification:', message.body);
                this.handleIncomingNotification(message);
            });
        };

        this.stompClient.onDisconnect = () => {
            this.connected = false;
            console.log('[WS] Disconnected from WebSocket');
        };

        this.stompClient.onStompError = (frame) => {
            console.error('[WS] STOMP Error:', frame.headers['message']);
        };

        this.stompClient.onWebSocketError = (event) => {
            console.error('[WS] WebSocket Error:', event);
        };

        this.stompClient.activate();
    }

    /** Handle incoming real-time notification */
    private handleIncomingNotification(message: IMessage): void {
        try {
            const notification: NotificationResponse = JSON.parse(message.body);

            // Update unread count
            this.unreadCount.update(c => c + 1);

            // Add to beginning of notifications list
            this.notifications.update(list => [notification, ...list]);

            // Show toast popup
            this.snackBar.open(
                `🔔 ${notification.title}`,
                'Xem',
                {
                    duration: 6000,
                    horizontalPosition: 'end',
                    verticalPosition: 'bottom',
                    panelClass: ['notification-toast']
                }
            );
        } catch (e) {
            console.error('[WS] Failed to parse notification:', e);
        }
    }

    /** Disconnect WebSocket */
    disconnectWebSocket(): void {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
            this.connected = false;
        }
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

    ngOnDestroy(): void {
        this.disconnectWebSocket();
    }
}
