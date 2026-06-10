import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PaletteSwitcherComponent } from './shared/palette-switcher.component';
import { CommentFabService } from './shared/comment-fab.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PaletteSwitcherComponent],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a class="nav-brand" routerLink="/">
          <span class="nav-logo"></span>
          Data Visualisaties
        </a>
        <span class="nav-tag">Design Principles & Kennisbibliotheek</span>
        <a class="nav-editor-link" routerLink="/palet-editor" routerLinkActive="active">Palet editor</a>
      </div>
    </nav>
    <div class="content">
      <router-outlet />
    </div>

    <div class="pills-row">
      <app-palette-switcher></app-palette-switcher>
      <button class="comment-fab" [class.active]="fab.isAdding()" (click)="fab.toggle()">
        @if (fab.isAdding()) {
          <svg viewBox="0 0 384 512" width="13" height="13" fill="currentColor">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z"/>
          </svg>
          Annuleren
        } @else {
          <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
            <path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9z"/>
          </svg>
          Reactie plaatsen
          @if (fab.pinCount() > 0) {
            <span class="fab-count">{{ fab.pinCount() }}</span>
          }
        }
      </button>
    </div>
  `,
  styles: [`
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #fff; border-bottom: 1px solid #E1E9EF; height: 56px; display: flex; align-items: center; }
    .nav-inner { max-width: 1200px; width: 100%; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; gap: 1rem; }
    .nav-brand { display: flex; align-items: center; gap: .6rem; text-decoration: none; font-weight: 700; font-size: 1rem; color: #1A2B3C; letter-spacing: -.01em; }
    .nav-logo { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #009BE5, #0691D3); display: block; }
    .nav-tag { font-size: .78rem; color: #9FB1BD; padding-left: 1rem; border-left: 1px solid #E1E9EF; }
    .nav-editor-link { margin-left: auto; font-size: .82rem; font-weight: 500; color: #566A78; text-decoration: none; padding: 5px 10px; border-radius: 7px; border: 1px solid transparent; transition: all .15s; white-space: nowrap; }
    .nav-editor-link:hover, .nav-editor-link.active { color: #009BE5; border-color: #E1E9EF; background: #F9FBFD; }
    .content { padding-top: 56px; }

    .pills-row { position: fixed; bottom: 24px; right: 24px; z-index: 91; display: flex; align-items: center; gap: 8px; }

    .comment-fab { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #D0DCE4; border-radius: 50px; padding: 10px 18px; font-size: 13px; font-weight: 500; color: #475055; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.1); transition: box-shadow .15s, border-color .15s, background .15s, color .15s; font-family: inherit; white-space: nowrap; }
    .comment-fab:hover { box-shadow: 0 6px 20px rgba(0,0,0,.15); border-color: #B9C7D0; }
    .comment-fab.active { background: #FFF5F5; border-color: #FFBCCC; color: #E10036; }
    .fab-count { background: #009BE5; color: #fff; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
  `]
})
export class AppComponent {
  fab = inject(CommentFabService);
}
