import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private matDialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let errMsg = 'An unknown error occurred';
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error.message) {
          errMsg = error.error.message;
        }
        this.matDialog.open(ErrorComponent, {
          data: {
            message: errMsg
          }
        });
        return throwError(error);
      })
    );
  }
}
