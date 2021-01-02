import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import * as config from '../../auth_config.json';
import {Employee, ReportItem} from './api.model';

import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  getEmployee$(id: string): Observable<any> {
    return this.http.get(`${config.apiUri}/employee/${id}`);
  }

  logEmployee$(id: string): Observable<any> {
    return this.http.post(`${config.apiUri}/log/${id}`, {}, {observe: 'response'});
  }

  createEmployee$(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${config.apiUri}/employee`, employee, {}); 
  }

  deleteEmployee$(id: string): Observable<any> {
    return this.http.delete(`${config.apiUri}/employee/${id}`);
  }

  getEmployees$(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${config.apiUri}/employees`);
  }

  report$(from: Date, to: Date, type: string) {

    this._reportLoading$.next(true)

    let params = new HttpParams();
    params = params.append('start', new Date(from.getTime() - (from.getTimezoneOffset() * 60000)).toISOString());
    params = params.append('end', new Date(to.getTime() - (to.getTimezoneOffset() * 60000)).toISOString());

    this.http.get<ReportItem[]>(`${config.apiUri}/${type}`, {params: params}).subscribe(
      res => {
        this._reportItems$.next(res)
        this._reportLoading$.next(false)
      },
      error => {
        this.toastr.error(error.error.message || error.message);
        this._reportLoading$.next(false)
      }
    );
  }

  report(from: Date, to: Date, type: string): Observable<ReportItem[]> {

    this._reportLoading$.next(true)

    let params = new HttpParams();
    params = params.append('start', new Date(from.getTime() - (from.getTimezoneOffset() * 60000)).toISOString());
    params = params.append('end', new Date(to.getTime() - (to.getTimezoneOffset() * 60000)).toISOString());

    return this.http.get<ReportItem[]>(`${config.apiUri}/${type}`, {params: params})
  }

  private _reportLoading$ = new BehaviorSubject<boolean>(false);
  private _reportItems$ = new BehaviorSubject<ReportItem[]>([]);
    
  // Table Messages
  messages = {
    emptyMessage: 'No data to display',
    totalMessage: 'total'
  }

  get reportLoading$() { return this._reportLoading$.asObservable(); }
  get reportItems$() { return this._reportItems$.asObservable(); }

}
