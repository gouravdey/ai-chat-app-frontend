import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {

  constructor(private sanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sanitizeText(text: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, text) || '';
  }
}
