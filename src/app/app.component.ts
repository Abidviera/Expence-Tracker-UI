import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  showSidebar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.setSidebarVisibility(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setSidebarVisibility(event.urlAfterRedirects);
      }
    });
  }

  private setSidebarVisibility(url: string) {
    const cleanUrl = url.split('?')[0];
    const hiddenRoutes = ['/login', '/register', '/','/email-verification'];
    this.showSidebar = !hiddenRoutes.includes(cleanUrl);
  }
}
