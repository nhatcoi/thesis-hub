import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type ThesisStatus = 'ELIGIBLE_FOR_THESIS' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED' | string;

export interface ThesisResponse {
    id: string;
    studentId: string;
    studentName: string;
    studentFirstName: string;
    studentLastName: string;
    studentCode: string;
    topicId: string;
    topicName: string;
    batchId: string;
    batchName: string;
    advisorId: string;
    advisorName: string;
    status: ThesisStatus;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({ providedIn: 'root' })
export class ThesisService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/theses`;

    getTheses(params: {
        batchId?: string;
        majorId?: string;
        facultyId?: string;
        status?: string;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
    }): Observable<PageResponse<ThesisResponse>> {
        let httpParams = new HttpParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                httpParams = httpParams.set(key, value.toString());
            }
        });

        return this.http.get<{ data: PageResponse<ThesisResponse> }>(this.baseUrl, { params: httpParams })
            .pipe(map(r => r.data));
    }
}
