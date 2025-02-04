import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ThemeService } from '../../services/theme.service';
import { MessageComponent } from "../message/message.component";
import { FormsModule } from '@angular/forms';
import { Message } from '../../models/message/message.model';
import { CommonModule } from '@angular/common';
import { SanitizationService } from '../../services/sanitization.service';
import { ImageService } from '../../services/image.service';

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
  isImageMode = false;

  constructor(
    public chatService: ChatService,
    public themeService: ThemeService,
    private imageService: ImageService
  ) {}

  sendMessage() {
    if (this.isSending || !this.newMessage.trim()) return;

    if (this.isImageMode) {
      this.generateImage(this.newMessage);
    } else {
      this.sendChatMessage(this.newMessage);
    }
    
    this.newMessage = '';
  }

  private sendChatMessage(content: string) {
    this.isSending = true;
    this.error = '';
    
    const userMessage: Message = { 
      role: 'user', 
      content: content,
      timestamp: Date.now()
    };    
    
    const currentMessages = this.chatService.getCurrentChatMessages();
    const messages = [...currentMessages, userMessage];
    this.chatService.chatMessagesSubject.next(messages);
    this.chatService.sendMessage(messages).subscribe({
      next: (response) => {
        // Ensure assistant response has timestamp
        const updatedMessages = response.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? msg.timestamp : Date.now()
        }));
        
        this.chatService.chatMessagesSubject.next(updatedMessages);
        this.scrollToBottom();
        this.isSending = false;
      },
      error: () => {
        this.error = 'Failed to send message. Try again.';
        this.isSending = false;
      }
    });
  }

  private generateImage(prompt: string) {
    this.isSending = true;
    this.error = '';

    const imageMessage: Message = {
      role: 'image',
      content: prompt,
      timestamp: Date.now(),
      isProcessing: true
    };

    this.chatService.addImageMessage(imageMessage);

    this.imageService.generateImage(prompt).subscribe({
      next: (response) => {
        const updatedImage = {
          ...imageMessage,
          imageUrl: `data:image/png;base64,${response.image}`,
          isProcessing: false
        };
        
        this.chatService.updateImageMessage(imageMessage, updatedImage);
        this.scrollToBottom();
        this.isSending = false;
      },
      error: () => {
        const errorMessage = {
          ...imageMessage,
          content: 'Failed to generate image',
          isProcessing: false
        };
        
        this.chatService.updateImageMessage(imageMessage, errorMessage);
        this.error = 'Failed to generate image. Please try again.';
        this.isSending = false;
      }
    });
  }

  toggleImageMode() {
    this.isImageMode = !this.isImageMode;
  }

  clearChat() {
    this.chatService.clearChat();
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        this.chatContainer.nativeElement.scrollTop = 
          this.chatContainer.nativeElement.scrollHeight;
      } catch(err) {
        console.error('Scroll error:', err);
      }
    }, 100);
  }

  regenerateResponse() {
    const messages = this.chatService.getCurrentChatMessages();
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      this.error = '';
      this.newMessage = lastUserMessage.content;
      const updatedMessages = messages.slice(0, -1);
      this.chatService.chatMessagesSubject.next(updatedMessages);
      this.sendMessage();
    }
  }

  onTextareaKeydown(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      this.sendMessage();
    }
  }
}