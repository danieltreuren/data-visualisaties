import { Component, HostListener, inject } from '@angular/core';
import { PaletteService } from './palette.service';

@Component({
  selector: 'app-palette-switcher',
  standalone: true,
  template: `
    <div class="wrap" (click)="$event.stopPropagation()">

      @if (open) {
        <div class="popover">
          @for (p of svc.palettes; track $index) {
            <button class="pop-opt" [class.active]="svc.index() === $index" (click)="choose($index)">
              <span class="pop-check">@if (svc.index() === $index) { ✓ }</span>
              <span class="pop-dots">
                @for (c of p.colors.slice(0, 5); track c) {
                  <span class="pdot" [style.background]="c"></span>
                }
              </span>
              <span class="pop-name">{{ p.name }}</span>
            </button>
          }
        </div>
      }

      <button class="pill" [class.open]="open" (click)="toggle()">
        <span class="pill-dots">
          @for (c of active.colors.slice(0, 4); track c) {
            <span class="pdot" [style.background]="c"></span>
          }
        </span>
        <span class="pill-label">{{ active.name }}</span>
        <svg class="chevron" [class.up]="open" viewBox="0 0 10 6" width="10" height="6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

    </div>
  `,
  styles: [`
    :host { position: fixed; bottom: 24px; left: 24px; z-index: 91; }

    .wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }

    .pill {
      display: flex; align-items: center; gap: 7px;
      background: #fff; border: 1px solid #D0DCE4; border-radius: 50px;
      padding: 8px 14px 8px 10px; cursor: pointer; font-family: inherit;
      box-shadow: 0 4px 16px rgba(0,0,0,.1);
      transition: box-shadow .15s, border-color .15s;
    }
    .pill:hover { box-shadow: 0 6px 20px rgba(0,0,0,.14); border-color: #B9C7D0; }
    .pill.open  { border-color: #009BE5; }

    .pill-dots { display: flex; gap: 3px; }
    .pill-label { font-size: 13px; font-weight: 500; color: #475055; white-space: nowrap; }
    .chevron { color: #9FB1BD; flex-shrink: 0; transition: transform .2s; }
    .chevron.up { transform: rotate(180deg); }

    .pdot { width: 9px; height: 9px; border-radius: 50%; display: block; }

    .popover {
      background: #fff; border: 1px solid #E1E9EF; border-radius: 12px;
      padding: 6px; box-shadow: 0 8px 28px rgba(0,0,0,.14); min-width: 200px;
    }
    .pop-opt {
      display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
      padding: 8px 10px; border-radius: 8px; border: none; background: transparent;
      cursor: pointer; font-family: inherit; transition: background .12s;
    }
    .pop-opt:hover  { background: #F5F8FA; }
    .pop-opt.active { background: #EAF8FF; }
    .pop-check { width: 14px; font-size: 11px; color: #009BE5; flex-shrink: 0; text-align: center; }
    .pop-dots  { display: flex; gap: 3px; flex-shrink: 0; }
    .pop-name  { font-size: 13px; font-weight: 500; color: #1A2B3C; }
    .pop-opt.active .pop-name { color: #009BE5; }
  `]
})
export class PaletteSwitcherComponent {
  svc = inject(PaletteService);
  open = false;

  get active() { return this.svc.palettes[this.svc.index()]; }

  toggle(): void { this.open = !this.open; }

  choose(i: number): void { this.svc.setIndex(i); this.open = false; }

  @HostListener('document:click')
  onOutside(): void { this.open = false; }
}
