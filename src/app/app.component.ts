import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a class="nav-brand" routerLink="/">
          <span class="nav-logo"></span>
          Data Visualisaties
        </a>
        <span class="nav-tag">Design Principles & Kennisbibliotheek</span>
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`
    .nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff;
      border-bottom: 1px solid #E1E9EF;
      height: 56px;
      display: flex;
      align-items: center;
    }
    .nav-inner {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      font-weight: 700;
      font-size: 1rem;
      color: #1A2B3C;
      letter-spacing: -0.01em;
    }
    .nav-logo {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: linear-gradient(135deg, #009BE5, #0691D3);
      display: block;
    }
    .nav-tag {
      font-size: 0.78rem;
      color: #9FB1BD;
      padding-left: 1rem;
      border-left: 1px solid #E1E9EF;
    }
  `]
})
export class AppComponent {}
