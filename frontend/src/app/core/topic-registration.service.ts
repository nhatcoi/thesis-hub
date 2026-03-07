import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TopicRegistration {
    id: string;
    topicId: string;
    topicTitle: string;
    topicDescription?: string;
    topicRequirements?: string;
    advisorName?: string;
    studentId: string;
    studentName: string;
    studentCode: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    topicSource: 'LECTURER' | 'STUDENT';
    rejectReason?: string;
    createdAt: string;
}

export interface StudentTopicProposal {
    title: string;
    description?: string;
    requirements?: string;
    batchId: string;
    preferredLecturerId?: string;
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

    getMajorRegistrations(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/major`);
    }

    approveRegistration(id: string, req: { status: string; rejectReason?: string; advisorId?: string }): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/${id}/approve`, req);
    }

    registerTopic(topicId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl, { topicId });
    }

    proposeTopic(proposal: StudentTopicProposal): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/propose`, proposal);
    }

    getMyStudentRegistrations(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/my`);
    }
}

