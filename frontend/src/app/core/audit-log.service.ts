import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditLogResponse {
    id: string;
    userId: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string | null;
    message: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/audit-logs`;

    getMyHistory(): Observable<{ data: AuditLogResponse[] }> {
        return this.http.get<{ data: AuditLogResponse[] }>(`${this.baseUrl}/me`);
    }

    getGlobalHistory(): Observable<{ data: AuditLogResponse[] }> {
        return this.http.get<{ data: AuditLogResponse[] }>(`${this.baseUrl}/global`);
    }
}
