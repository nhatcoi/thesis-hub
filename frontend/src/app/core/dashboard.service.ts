import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
    totalStudents: number;
    totalLecturers: number;
    totalTopics: number;
    totalBatches: number;
    totalAdvisingTheses: number;
    totalAssignedTopics: number;
    topicsByStatus: Record<string, number>;
    batchesByStatus: Record<string, number>;
    eligibleStudents: number;
    ineligibleStudents: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/dashboard`;

    getStats(): Observable<{ data: DashboardStats }> {
        return this.http.get<{ data: DashboardStats }>(`${this.baseUrl}/stats`);
    }
}
