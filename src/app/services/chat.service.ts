import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, tap } from 'rxjs';
import { Message } from '../models/message/message.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SanitizationService } from './sanitization.service';

interface StoredMessage {
  type: 'chat' | 'image';
  message: Message;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl + '/chat';

  public chatMessagesSubject = new BehaviorSubject<Message[]>([]);
  private imageMessagesSubject = new BehaviorSubject<Message[]>([]);

  private combinedMessagesSubject = new BehaviorSubject<Message[]>([]);
  combinedMessages$ = this.combinedMessagesSubject.asObservable();
  
  chatMessages$ = this.chatMessagesSubject.asObservable();
  imageMessages$ = this.imageMessagesSubject.asObservable();
  allMessages$ = combineLatest([this.chatMessages$, this.imageMessages$]).pipe(
    map(([chat, images]) => [...chat, ...images])
  );

  constructor(private http: HttpClient) { 
    this.loadMessages();
    this.updateCombinedMessages();
  }

  sendMessage(messages: Message[]): Observable<Message[]> {
    return this.http.post<Message[]>(this.apiUrl, messages).pipe(
      tap(response => {
        this.chatMessagesSubject.next(response);
        this.saveMessages();
        this.updateCombinedMessages();
      }),
      catchError(error => {
        console.error('Chat error:', error);
        return of([]);
      })
    );
  }

  addImageMessage(message: Message) {
    const currentImages = this.imageMessagesSubject.value;
    this.imageMessagesSubject.next([...currentImages, message]);
    this.saveMessages();
    this.updateCombinedMessages();
  }

  updateImageMessage(oldMessage: Message, newMessage: Message) {
    const images = this.imageMessagesSubject.value;
    const index = images.indexOf(oldMessage);
    
    if (index > -1) {
      const updated = [...images];
      updated[index] = newMessage;
      this.imageMessagesSubject.next(updated);
      this.saveMessages();
    }
  }

  clearChat() {
    this.chatMessagesSubject.next([]);
    this.imageMessagesSubject.next([]);
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('imageMessages');
  }

  getCurrentChatMessages(): Message[] {
    return this.chatMessagesSubject.value;
  }

  getCurrentImageMessages(): Message[] {
    return this.imageMessagesSubject.value;
  }

  private saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(this.chatMessagesSubject.value));
    localStorage.setItem('imageMessages', JSON.stringify(this.imageMessagesSubject.value));
  }

  private loadMessages() {
    const chat = localStorage.getItem('chatMessages');
    const images = localStorage.getItem('imageMessages');
    
    if (chat) this.chatMessagesSubject.next(JSON.parse(chat));
    if (images) this.imageMessagesSubject.next(JSON.parse(images));
  }
  

  private updateCombinedMessages() {
    combineLatest([this.chatMessages$, this.imageMessages$]).pipe(
      map(([chatMessages, imageMessages]) => {
        // Convert all timestamps to numbers
        const convertTimestamp = (msg: Message) => 
          msg.timestamp || Date.now();
  
        return [
          ...chatMessages,
          ...imageMessages
        ].sort((a, b) => 
          convertTimestamp(a) - convertTimestamp(b)
        );
      })
    ).subscribe(messages => {
      this.combinedMessagesSubject.next(messages);
    });
  }
}