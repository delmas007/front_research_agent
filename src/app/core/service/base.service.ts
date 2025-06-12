import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class BaseService {
  url = '/api/generate-pdf';
  constructor(
    private httpClient: HttpClient
  ) { }

  post( data: any) {
    console.log(data)
    return this.httpClient.post(this.url, data, {  responseType: 'blob',
      observe: 'response' });
  }
}
