import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ThemeService } from '../../services/theme.service';
import { MessageComponent } from "../message/message.component";
import { FormsModule } from '@angular/forms';
import { Message } from '../../models/message/message.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, MessageComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  newMessage = '';
  isSending = false;
  error = '';

  constructor(
    public chatService: ChatService,
    public themeService: ThemeService
  ) {}

  sendMessage() {
    if (this.isSending || !this.newMessage.trim()) return;

    this.isSending = true;
    this.error = '';
    
    const userMessage: Message = { 
      role: 'user', 
      content: this.newMessage,
      timestamp: new Date()
    };    
    
    const currentMessages = this.chatService.getCurrentMessages();
    const messages = [currentMessages, userMessage].flat();
    this.chatService.messagesSubject.next(messages);
    
    this.chatService.sendMessage().subscribe({
      next: (response) => {
        this.newMessage = '';
        this.scrollToBottom();
        this.isSending = false;
      },
      error: () => {
        this.error = 'Failed to send message. Try again.';
        this.isSending = false;
      }
    });
  }

  clearChat() {
    this.chatService.clearChat();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.nativeElement.scrollTop = 
        this.chatContainer.nativeElement.scrollHeight;
    }, 100);
  }

  regenerateResponse() {
    const messages = this.chatService.getCurrentMessages();
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      this.error = '';
      this.newMessage = lastUserMessage.content;
      const updatedMessages = messages.slice(0, -1);
      this.chatService.messagesSubject.next(updatedMessages);
      this.sendMessage();
    }
  }
}
