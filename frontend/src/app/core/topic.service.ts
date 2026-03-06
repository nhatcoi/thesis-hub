import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Topic {
    id: string;
    title: string;
    description: string;
    requirements: string;
    maxStudents: number;
    currentStudents: number;
    source: string;
    status: string;
    majorCode: string;
    majorName?: string;
    batchId: string;
    batchName: string;
    proposedById: string;
    proposedByName: string;
    rejectReason?: string;
    createdAt: string;
}

export interface TopicRequest {
    title: string;
    description: string;
    requirements: string;
    maxStudents: number;
    batchId: string;
    majorCode?: string;
}

@Injectable({ providedIn: 'root' })
export class TopicService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/topics`;

    getMyTopics(params: {
        page?: number;
        size?: number;
        search?: string;
        status?: string;
        batchId?: string;
        majorCode?: string;
    } = {}): Observable<{ data: { content: Topic[], totalElements: number } }> {
        let httpParams = new HttpParams();
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.status) httpParams = httpParams.set('status', params.status);
        if (params.batchId) httpParams = httpParams.set('batchId', params.batchId);
        if (params.majorCode) httpParams = httpParams.set('majorCode', params.majorCode);

        return this.http.get<any>(`${this.baseUrl}/me`, { params: httpParams });
    }

    createTopic(topic: TopicRequest): Observable<{ data: Topic }> {
        return this.http.post<any>(this.baseUrl, topic);
    }

    updateTopic(id: string, topic: TopicRequest): Observable<{ data: Topic }> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, topic);
    }

    deleteTopic(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    closeTopic(id: string): Observable<{ data: Topic }> {
        return this.http.patch<any>(`${this.baseUrl}/${id}/close`, {});
    }

    reopenTopic(id: string): Observable<{ data: Topic }> {
        return this.http.patch<any>(`${this.baseUrl}/${id}/reopen`, {});
    }
}
