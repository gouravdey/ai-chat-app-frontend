import { Component, OnInit } from '@angular/core';
import { ChatWindowComponent } from "./components/chat-window/chat-window.component";
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [ChatWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    this.themeService.getCurrentTheme();
  }
  title = 'ai-chat-app';
}
