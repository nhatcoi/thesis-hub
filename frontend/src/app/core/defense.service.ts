import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DefenseRegistrationResponse {
    id: string;
    thesisId: string;
    reportName: string;
    reportSize: number;
    reportUrl?: string;
    sourceCodeName: string;
    sourceCodeSize: number;
    sourceCodeUrl?: string;
    slideName: string;
    slideSize: number;
    slideUrl?: string;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    note?: string;
    reviewerComment?: string;
    reviewerName?: string;
    reviewedAt?: string;
    submittedAt: string;
    studentName?: string;
    studentCode?: string;
    topicTitle?: string;
}

@Injectable({ providedIn: 'root' })
export class DefenseService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/defense`;

    getFileUrl(publicUrl?: string): string {
        return publicUrl || '#';
    }

    registerDefense(report: File, sourceCode: File, slide: File, note?: string): Observable<DefenseRegistrationResponse> {
        const formData = new FormData();
        formData.append('report', report);
        formData.append('sourceCode', sourceCode);
        formData.append('slide', slide);
        if (note) formData.append('note', note);
        return this.http.post<{ data: DefenseRegistrationResponse }>(`${this.baseUrl}/register`, formData)
            .pipe(map(r => r.data));
    }

    getMyRegistration(): Observable<DefenseRegistrationResponse | null> {
        return this.http.get<{ data: DefenseRegistrationResponse | null }>(`${this.baseUrl}/me`)
            .pipe(map(r => r.data));
    }

    getMyHistory(): Observable<DefenseRegistrationResponse[]> {
        return this.http.get<{ data: DefenseRegistrationResponse[] }>(`${this.baseUrl}/me/history`)
            .pipe(map(r => r.data));
    }

    getAdvisingDefenses(): Observable<DefenseRegistrationResponse[]> {
        return this.http.get<{ data: DefenseRegistrationResponse[] }>(`${this.baseUrl}/advising`)
            .pipe(map(r => r.data));
    }

    reviewDefense(id: string, status: string, comment: string): Observable<DefenseRegistrationResponse> {
        return this.http.patch<{ data: DefenseRegistrationResponse }>(`${this.baseUrl}/${id}/review`, { status, comment })
            .pipe(map(r => r.data));
    }
}

