import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    roles: UserRole[];

    // Student specific
    majorCode?: string;
    cohort?: string;

    // Lecturer specific
    facultyCode?: string;
    maxStudentsPerBatch?: number;
}

export interface UserResponse {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles: UserRole[];
    status: string;
    facultyName?: string;
    majorName?: string;
    facultyId?: string;
    majorId?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
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

    getAll(params: {
        page?: number;
        size?: number;
        search?: string;
        role?: string;
        facultyId?: string;
        majorId?: string;
        sort?: string;
    }): Observable<PageResponse<any>> {
        let httpParams = new HttpParams();
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.role) httpParams = httpParams.set('role', params.role);
        if (params.facultyId) httpParams = httpParams.set('facultyId', params.facultyId);
        if (params.majorId) httpParams = httpParams.set('majorId', params.majorId);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);

        return this.http.get<ApiResponse<PageResponse<any>>>(this.baseUrl, { params: httpParams })
            .pipe(map(r => r.data));
    }

    // Helper for faculty/major selection
    getFaculties(): Observable<any[]> {
        return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/faculties`).pipe(map(r => r.data));
    }

    getMajors(): Observable<any[]> {
        return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/majors`).pipe(map(r => r.data));
    }
}
