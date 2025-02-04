import { Component, Input } from '@angular/core';
import { Message } from '../../models/message/message.model';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-message',
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() message!: Message;

  constructor(private sanitizer: DomSanitizer) {}

  get safeContent(): SafeHtml {
    return this.message.safeContent || this.sanitizer.bypassSecurityTrustHtml(this.message.content);
  }
}
