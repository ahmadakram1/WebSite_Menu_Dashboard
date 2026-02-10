import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from './core/i18n/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.init();
    this.sub = this.languageService.language$.subscribe((language) => {
      if (typeof document !== 'undefined') {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
