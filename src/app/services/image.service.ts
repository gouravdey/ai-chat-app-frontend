import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = environment.apiUrl + '/generate-image';

  constructor(private http: HttpClient) { }

  generateImage(prompt: string): Observable<{ image: string }> {
    return this.http.post<{ image: string }>(this.apiUrl, { prompt });
  }
}
