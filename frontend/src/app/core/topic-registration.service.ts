import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TopicRegistration {
    id: string;
    topicId: string;
    topicTitle: string;
    studentId: string;
    studentName: string;
    studentCode: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectReason?: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class TopicRegistrationService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/topic-registrations`;

    getMyRegistrations(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/me`);
    }

    approveRegistration(id: string, req: { status: string; rejectReason?: string }): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/${id}/approve`, req);
    }
}
