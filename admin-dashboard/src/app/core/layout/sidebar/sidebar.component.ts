import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '../../i18n/language.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    TranslatePipe,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<void>();

  onNavigate(): void {
    this.navigate.emit();
  }
}
