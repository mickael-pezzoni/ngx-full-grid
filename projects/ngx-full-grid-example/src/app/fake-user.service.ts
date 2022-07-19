import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FakeUsersResult } from './fake-user.model';

export interface PaginationParams {
  page: number;
  results: number;
}

@Injectable({
  providedIn: 'root',
})
export class FakeUserService {
  private readonly URL = 'https://randomuser.me/api/';
  constructor(private readonly httpClient: HttpClient) {}

  get$(paginationParams: PaginationParams): Observable<FakeUsersResult> {
    return this.httpClient.get<FakeUsersResult>(this.URL, {
      params: this.paginationParamsToHttpParams(paginationParams),
    });
  }

  private paginationParamsToHttpParams(
    paginationParams: PaginationParams
  ): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(paginationParams).forEach(([key, value]) => {
      httpParams = httpParams.append(key, value);
    });

    return httpParams;
  }
}
