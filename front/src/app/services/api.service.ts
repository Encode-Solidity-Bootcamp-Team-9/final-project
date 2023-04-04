import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'http://localhost:3000';
  constructor(private http: HttpClient) {
    if (isDevMode()) {
      this.BASE_URL = 'http://localhost:3000';
    } else {
      this.BASE_URL = 'https://team9-voting.herokuapp.com';
    }
  }

  public get<T>(url: string): Promise<T> {
    const observable = this.http.get<T>(`${this.BASE_URL}/${url}`);
    return lastValueFrom(observable);
  }

  public post<T>(url: string, payload: any) {
    const observable = this.http.post<T>(`${this.BASE_URL}/${url}`, payload);
    return lastValueFrom(observable);
  }
}
