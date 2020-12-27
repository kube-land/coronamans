import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as config from '../../auth_config.json';

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

  logEmployee$(id: string): Observable<any> {
    return this.http.post(`${config.apiUri}/log/${id}`, {}, {observe: 'response'});
  }


}
