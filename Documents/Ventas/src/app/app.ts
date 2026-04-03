import { ChangeDetectionStrategy, Component, inject, signal, HostListener, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { FinanceService } from './finance.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  financeService = inject(FinanceService);
  today = new Date();
  isSidebarCollapsed = signal(false);
  isMobile = signal(false);

  ngOnInit() {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  @HostListener('window:resize')
  checkScreenSize() {
    if (!this.isBrowser) return;
    
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile) {
      this.isSidebarCollapsed.set(true);
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }
  navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/products', icon: 'restaurant', label: 'Productos' },
    { path: '/sales', icon: 'shopping_cart', label: 'Ventas' },
    { path: '/investments', icon: 'account_balance', label: 'Inversiones' },
    { path: '/expenses', icon: 'money_off', label: 'Gastos' },
    { path: '/settings', icon: 'settings', label: 'Configuración' },
  ];
}
