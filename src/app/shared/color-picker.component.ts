import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, inject } from '@angular/core';

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d % 6) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
      .toString(16).padStart(2, '0');
  };
  return '#' + f(5) + f(3) + f(1);
}

@Component({
  selector: 'app-color-picker',
  standalone: true,
  template: `
    <div class="cp">
      <div class="sv"
        [style.background-color]="'hsl(' + h + ',100%,50%)'"
        (mousedown)="svDown($event)"
        (touchstart)="svTouchDown($event)">
        <div class="sv-white"></div>
        <div class="sv-black"></div>
        <div class="sv-dot" [style.left.%]="s * 100" [style.top.%]="(1 - v) * 100"></div>
      </div>

      <div class="controls">
        <div class="preview" [style.background]="hex"></div>
        <div class="hue-wrap" (mousedown)="hueDown($event)" (touchstart)="hueTouchDown($event)">
          <div class="hue-track"></div>
          <div class="hue-thumb" [style.left.%]="h / 360 * 100"
            [style.background]="'hsl(' + h + ',100%,50%)'"></div>
        </div>
      </div>

      <div class="hex-row">
        <div class="hex-wrap">
          <span class="hex-lbl">HEX</span>
          <input class="hex-inp" type="text" [value]="hexDisplay" maxlength="7"
            spellcheck="false"
            (focus)="onHexFocus($event)"
            (input)="onHexInput($event)"
            (blur)="onHexBlur($event)">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cp { width: 224px; user-select: none; }
    .sv { position: relative; width: 100%; height: 148px; border-radius: 8px 8px 0 0; overflow: hidden; cursor: crosshair; flex-shrink: 0; }
    .sv-white { position: absolute; inset: 0; background: linear-gradient(to right, #fff, transparent); }
    .sv-black { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, #000); }
    .sv-dot { position: absolute; width: 13px; height: 13px; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.55); transform: translate(-50%, -50%); pointer-events: none; }
    .controls { display: flex; align-items: center; gap: 10px; padding: 10px 10px 8px; }
    .preview { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; border: 2px solid #E1E9EF; }
    .hue-wrap { flex: 1; position: relative; height: 13px; cursor: pointer; }
    .hue-track { position: absolute; inset: 0; border-radius: 7px; background: linear-gradient(to right, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%)); }
    .hue-thumb { position: absolute; top: 50%; width: 17px; height: 17px; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4); transform: translate(-50%, -50%); pointer-events: none; }
    .hex-row { padding: 0 10px 10px; }
    .hex-wrap { display: flex; align-items: center; border: 1.5px solid #D0DCE4; border-radius: 7px; overflow: hidden; background: #fff; transition: border-color .15s; }
    .hex-wrap:focus-within { border-color: #009BE5; }
    .hex-lbl { font-size: 9px; font-weight: 700; letter-spacing: .05em; color: #9FB1BD; background: #F5F8FA; padding: 0 7px; border-right: 1px solid #E1E9EF; align-self: stretch; display: flex; align-items: center; flex-shrink: 0; }
    .hex-inp { flex: 1; font-family: 'Courier New', monospace; font-size: 13px; border: none; padding: 8px 10px; color: #1A2B3C; outline: none; background: #fff; min-width: 0; }
  `]
})
export class ColorPickerComponent implements OnChanges {
  @Input() color = '#009BE5';
  @Output() colorChange = new EventEmitter<string>();

  h = 200; s = 1; v = 0.9;
  hex = '#009BE5';
  hexDisplay = '#009BE5';

  private cdRef = inject(ChangeDetectorRef);

  ngOnChanges(): void {
    if (/^#[0-9A-Fa-f]{6}$/.test(this.color)) {
      const hsv = hexToHsv(this.color);
      this.h = hsv.h; this.s = hsv.s; this.v = hsv.v;
      this.hex = this.color.toLowerCase();
      this.hexDisplay = this.hex;
    }
  }

  svDown(event: MouseEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const update = (e: MouseEvent) => {
      this.s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
      this.emit();
    };
    update(event);
    const move = (e: MouseEvent) => update(e);
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  svTouchDown(event: TouchEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const update = (t: Touch) => {
      this.s = Math.max(0, Math.min(1, (t.clientX - rect.left) / rect.width));
      this.v = Math.max(0, Math.min(1, 1 - (t.clientY - rect.top) / rect.height));
      this.emit();
    };
    update(event.touches[0]);
    const move = (e: TouchEvent) => update(e.touches[0]);
    const end = () => { document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end); };
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end);
  }

  hueDown(event: MouseEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const update = (e: MouseEvent) => {
      this.h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
      this.emit();
    };
    update(event);
    const move = (e: MouseEvent) => update(e);
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  hueTouchDown(event: TouchEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const update = (t: Touch) => {
      this.h = Math.max(0, Math.min(360, ((t.clientX - rect.left) / rect.width) * 360));
      this.emit();
    };
    update(event.touches[0]);
    const move = (e: TouchEvent) => update(e.touches[0]);
    const end = () => { document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end); };
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end);
  }

  onHexFocus(event: FocusEvent): void {
    setTimeout(() => (event.target as HTMLInputElement).select(), 0);
  }

  onHexInput(event: Event): void {
    let val = (event.target as HTMLInputElement).value;
    this.hexDisplay = val;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const hsv = hexToHsv(val);
      this.h = hsv.h; this.s = hsv.s; this.v = hsv.v;
      this.hex = val.toLowerCase();
      this.colorChange.emit(this.hex);
      this.cdRef.detectChanges();
    }
  }

  onHexBlur(event: FocusEvent): void {
    (event.target as HTMLInputElement).value = this.hex;
    this.hexDisplay = this.hex;
    this.cdRef.detectChanges();
  }

  private emit(): void {
    this.hex = hsvToHex(this.h, this.s, this.v);
    this.hexDisplay = this.hex;
    this.colorChange.emit(this.hex);
    this.cdRef.detectChanges();
  }
}
