import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Message } from '../models/message/message.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl + '/chat';
  messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadMessages();
  }

  sendMessage(): Observable<Message[]> {
    const messages = this.messagesSubject.value;
    console.log(messages);
    
    
    return this.http.post<Message[]>(this.apiUrl, messages).pipe(
      tap(response => {
        this.messagesSubject.next(response);
        this.saveMessages();
      }),
      catchError(error => {
        console.error('Chat error:', error);
        return of([]);
      })
    );
  }

  clearChat() {
    this.messagesSubject.next([]);
    localStorage.removeItem('chatMessages');
  }

  private saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(this.messagesSubject.value));
  }

  private loadMessages() {
    const messages = localStorage.getItem('chatMessages');
    if (messages) {
      this.messagesSubject.next(JSON.parse(messages));
    }
  }

  getCurrentMessages(): Message[] {
    return this.messagesSubject.value;
  }
}
