import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Lecturer {
    id: string;
    lecturerCode: string;
    firstName: string;
    lastName: string;
    email: string;
    facultyName?: string;
}

@Injectable({ providedIn: 'root' })
export class LecturerService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/lecturers`;

    getLecturers(params?: { search?: string, facultyId?: string }): Observable<Lecturer[]> {
        let httpParams = new HttpParams();
        if (params?.search) httpParams = httpParams.set('search', params.search);
        if (params?.facultyId) httpParams = httpParams.set('facultyId', params.facultyId);

        return this.http.get<{ data: Lecturer[] }>(this.baseUrl, { params: httpParams })
            .pipe(map(res => res.data));
    }
}
