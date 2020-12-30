import { Injectable } from '@angular/core';
import {
 HttpEvent,
 HttpInterceptor,
 HttpHandler,
 HttpRequest,
 HttpResponse,
 HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService) { }

 intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   return next.handle(request)
     .pipe(
       retry(1),
       catchError((error: HttpErrorResponse) => {
         console.log(error)
         let errorMessage = error.error.message || error.message
         //if (error.error instanceof Object) {
           // client-side error
           //errorMessage = `Error: ${error.error.message}`;
         //} else {
           // server-side error
           //errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
         //}
         this.toastr.error(errorMessage);
         return throwError(errorMessage);
       })
     )
 }
}