import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class BaseService {
  url = 'http://localhost:8000/api/v1/pdf/';
  constructor(
    private httpClient: HttpClient
  ) { }

  post( data: any) {
    return this.httpClient.post(this.url, data, {  responseType: 'blob',
      observe: 'response' });
  }
}
