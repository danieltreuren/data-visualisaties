import { Component, inject } from '@angular/core';
import { PaletteService } from './palette.service';

@Component({
  selector: 'app-palette-switcher',
  standalone: true,
  template: `
    <div class="switcher">
      <span class="label">Palet</span>
      @for (p of svc.palettes; track $index) {
        <button
          class="option"
          [class.active]="svc.index() === $index"
          (click)="svc.setIndex($index)"
          [title]="p.name">
          @for (c of p.colors.slice(0, 5); track c) {
            <span class="dot" [style.background]="c"></span>
          }
          <span class="name">{{ p.name }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .switcher { display: flex; align-items: center; gap: 5px; }
    .label { font-size: 11px; color: #9FB1BD; font-weight: 500; margin-right: 3px; white-space: nowrap; }
    .option {
      display: flex; align-items: center; gap: 3px;
      padding: 4px 8px 4px 6px; border-radius: 8px;
      border: 1.5px solid #E1E9EF; background: #F9FBFD;
      cursor: pointer; transition: border-color .15s, background .15s;
      font-family: inherit;
    }
    .option:hover { border-color: #009BE5; background: #EAF8FF; }
    .option.active { border-color: #009BE5; background: #EAF8FF; }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .name { font-size: 11px; font-weight: 500; color: #566A78; margin-left: 3px; white-space: nowrap; }
    .option.active .name { color: #009BE5; }
    @media (max-width: 700px) { .name { display: none; } .label { display: none; } }
  `]
})
export class PaletteSwitcherComponent {
  svc = inject(PaletteService);
}
