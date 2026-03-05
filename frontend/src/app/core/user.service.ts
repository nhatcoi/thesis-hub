import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type UserRole = 'ADMIN' | 'TRAINING_DEPT' | 'DEPT_HEAD' | 'LECTURER' | 'STUDENT';

export interface UserCreateRequest {
    username: string;
    externalId?: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;

    // Student specific
    majorCode?: string;
    cohort?: string;
    gpa?: number;
    accumulatedCredits?: number;

    // Lecturer specific
    facultyCode?: string;
    academicRank?: string;
    academicDegree?: string;
    researchAreas?: string;
    maxStudentsPerBatch?: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/users`;

    create(req: UserCreateRequest): Observable<any> {
        return this.http.post<ApiResponse<any>>(this.baseUrl, req);
    }

    getAll(): Observable<any[]> {
        return this.http.get<ApiResponse<any[]>>(this.baseUrl).pipe(map(r => r.data));
    }

    // Helper for faculty/major selection
    getFaculties(): Observable<any[]> {
        return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/faculties`).pipe(map(r => r.data));
    }

    getMajors(): Observable<any[]> {
        return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/majors`).pipe(map(r => r.data));
    }
}
