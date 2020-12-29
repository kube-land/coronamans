import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as config from '../../auth_config.json';

import {Employee} from './api.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  ping$(): Observable<any> {
    return this.http.get(`${config.apiUri}/employees`);
  }

  getEmployee$(id: string): Observable<any> {
    return this.http.get(`${config.apiUri}/employee/${id}`);
  }

  getEmployees$(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${config.apiUri}/employees`);
  }

  logEmployee$(id: string): Observable<any> {
    return this.http.post(`${config.apiUri}/log/${id}`, {}, {observe: 'response'});
  }

  createEmployee$(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${config.apiUri}/employee`, employee, {}); 
  }

  report$(from: Date, to: Date, type: string): Observable<any | String> {
    let params = new HttpParams();
    params = params.append('start', new Date(from.getTime() - (from.getTimezoneOffset() * 60000)).toISOString());
    params = params.append('end', new Date(to.getTime() - (to.getTimezoneOffset() * 60000)).toISOString());
    return this.http.get<Employee>(`${config.apiUri}/${type}`, {params: params});
  }
}
