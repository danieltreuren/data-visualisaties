import { Component, Input, OnInit, OnDestroy, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  'https://bbzamujpfkbvfkgazgwn.supabase.co',
  'sb_publishable_nFa6sDaQA-O4Ldz8neb0Fw_nzzUY-FS'
);

interface Pin {
  id: string;
  page_id: string;
  x_pct: number;
  y_pct: number;
  name: string;
  text: string;
}

@Component({
  selector: 'app-comment-overlay',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="pin-layer"
         [class.adding]="isAdding"
         (click)="onLayerClick($event)">

      @for (c of pins; track c.id) {
        <div class="pin"
             [class.flip-left]="c.x_pct > 75"
             [style.left.%]="c.x_pct"
             [style.top.%]="c.y_pct"
             (mousedown)="startDrag($event, c)"
             (click)="$event.stopPropagation()">
          <span class="pin-dot" [style.background]="pinColor(c.name)">{{ c.name.charAt(0).toUpperCase() }}</span>
          <div class="pin-card">
            <div class="pin-card-header">
              <span class="pin-card-name">{{ c.name }}</span>
              <button class="pin-delete" (click)="deletePin(c.id, $event)" title="Verwijder">
                <svg viewBox="0 0 448 512" width="11" height="11">
                  <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
                </svg>
              </button>
            </div>
            @if (c.text) {
              <p class="pin-card-text">{{ c.text }}</p>
            }
          </div>
        </div>
      }

      @if (pendingPin) {
        <div class="pin-form-wrap"
             [class.flip-left]="pendingPin.x_pct > 70"
             [class.flip-down]="pendingPin.y_pct < 20"
             [style.left.%]="pendingPin.x_pct"
             [style.top.%]="pendingPin.y_pct"
             (click)="$event.stopPropagation()">
          <div class="pin-form">
            <div class="pin-form-title">Nieuwe reactie</div>
            <input class="pin-input"
                   [(ngModel)]="newName"
                   placeholder="Jouw naam *"
                   autofocus />
            <textarea class="pin-textarea"
                      [(ngModel)]="newText"
                      placeholder="Opmerking (optioneel)"
                      rows="3"></textarea>
            <div class="pin-form-actions">
              <button class="pin-btn-cancel" (click)="cancelPin()">Annuleren</button>
              <button class="pin-btn-confirm"
                      [disabled]="!newName.trim() || saving"
                      (click)="confirmPin()">
                {{ saving ? 'Bezig...' : 'Plaatsen' }}
              </button>
            </div>
          </div>
        </div>
      }

    </div>

    <button class="comment-fab" [class.active]="isAdding" (click)="toggleAddMode()">
      @if (isAdding) {
        <svg viewBox="0 0 384 512" width="13" height="13" fill="currentColor">
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z"/>
        </svg>
        Annuleren
      } @else {
        <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
          <path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9z"/>
        </svg>
        Reactie plaatsen
        @if (pins.length) {
          <span class="fab-count">{{ pins.length }}</span>
        }
      }
    </button>
  `,
  styles: [`
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 50;
      display: block;
    }

    .pin-layer {
      width: 100%;
      height: 100%;
      position: relative;
      pointer-events: none;
    }

    .pin-layer.adding {
      pointer-events: all;
      cursor: crosshair;
    }

    .pin {
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: all;
      cursor: grab;
      user-select: none;
      z-index: 60;
    }

    .pin:active { cursor: grabbing; }

    .pin-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      color: #fff;
      border: 2.5px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      transition: transform .15s;
      pointer-events: all;
    }

    .pin:hover .pin-dot { transform: scale(1.1); }

    .pin-card {
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: #fff;
      border: 1px solid #E1E9EF;
      border-radius: 10px;
      padding: 10px 12px;
      min-width: 180px;
      max-width: 260px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      opacity: 0;
      visibility: hidden;
      transition: opacity .15s, visibility .15s;
      white-space: normal;
      z-index: 70;
      cursor: default;
      pointer-events: all;
    }

    .pin:hover .pin-card { opacity: 1; visibility: visible; }

    .pin.flip-left .pin-card {
      left: auto;
      right: calc(100% + 10px);
    }

    .pin-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .pin-card-name {
      font-size: 12px;
      font-weight: 600;
      color: #1A2B3C;
    }

    .pin-card-text {
      font-size: 12px;
      color: #566A78;
      line-height: 1.5;
      margin: 0;
      white-space: pre-wrap;
    }

    .pin-delete {
      background: none;
      border: none;
      cursor: pointer;
      color: #9FB1BD;
      padding: 3px 5px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color .1s, background .1s;
    }

    .pin-delete svg { fill: currentColor; }
    .pin-delete:hover { color: #E10036; background: #FFF5F5; }

    .pin-form-wrap {
      position: absolute;
      transform: translate(-50%, calc(-100% - 12px));
      pointer-events: all;
      z-index: 80;
    }

    .pin-form-wrap.flip-left { transform: translate(-90%, calc(-100% - 12px)); }
    .pin-form-wrap.flip-down { transform: translate(-50%, 12px); }

    .pin-form {
      background: #fff;
      border: 1px solid #E1E9EF;
      border-radius: 12px;
      padding: 16px;
      min-width: 260px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.14);
    }

    .pin-form-title {
      font-size: 13px;
      font-weight: 600;
      color: #1A2B3C;
      margin-bottom: 10px;
    }

    .pin-input, .pin-textarea {
      width: 100%;
      border: 1px solid #D0DCE4;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 13px;
      font-family: inherit;
      color: #1A2B3C;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 8px;
      transition: border-color .15s;
      display: block;
    }

    .pin-input:focus, .pin-textarea:focus { border-color: #009BE5; }
    .pin-textarea { resize: vertical; margin-bottom: 10px; }

    .pin-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .pin-btn-cancel {
      background: none;
      border: 1px solid #D0DCE4;
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 12px;
      color: #475055;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s;
    }

    .pin-btn-cancel:hover { background: #F9F9F9; }

    .pin-btn-confirm {
      background: #009BE5;
      border: none;
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 12px;
      color: #fff;
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
      transition: background .15s;
    }

    .pin-btn-confirm:hover:not(:disabled) { background: #0691D3; }
    .pin-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

    .comment-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: 1px solid #D0DCE4;
      border-radius: 50px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 500;
      color: #475055;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      transition: box-shadow .15s, border-color .15s, background .15s, color .15s;
      pointer-events: all;
      font-family: inherit;
      z-index: 90;
    }

    .comment-fab:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.15); border-color: #B9C7D0; }
    .comment-fab.active { background: #FFF5F5; border-color: #FFBCCC; color: #E10036; }

    .fab-count {
      background: #009BE5;
      color: #fff;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
    }
  `]
})
export class CommentOverlayComponent implements OnInit, OnDestroy {
  @Input() pageId = '';

  pins: Pin[] = [];
  isAdding = false;
  pendingPin: { x_pct: number; y_pct: number } | null = null;
  newName = '';
  newText = '';
  saving = false;

  private channel: RealtimeChannel | null = null;
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadPins();
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    if (this.channel) supabase.removeChannel(this.channel);
  }

  private async loadPins(): Promise<void> {
    const { data } = await supabase
      .from('pins')
      .select('*')
      .eq('page_id', this.pageId)
      .order('created_at');
    this.pins = data ?? [];
    this.cdRef.detectChanges();
  }

  private subscribeRealtime(): void {
    this.channel = supabase
      .channel(`pins-${this.pageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pins',
        filter: `page_id=eq.${this.pageId}`
      }, () => this.loadPins())
      .subscribe();
  }

  pinColor(name: string): string {
    const colors = ['#2C7BB6', '#E07B00', '#7B61E0', '#00897B', '#D63D6E', '#566A78', '#F5A623'];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  toggleAddMode(): void {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      this.pendingPin = null;
      this.newName = '';
      this.newText = '';
    }
  }

  onLayerClick(event: MouseEvent): void {
    if (!this.isAdding || this.pendingPin) return;
    const layer = event.currentTarget as HTMLElement;
    const rect = layer.getBoundingClientRect();
    this.pendingPin = {
      x_pct: ((event.clientX - rect.left) / layer.offsetWidth) * 100,
      y_pct: ((event.clientY - rect.top) / layer.offsetHeight) * 100,
    };
    this.newName = '';
    this.newText = '';
  }

  cancelPin(): void {
    this.pendingPin = null;
    this.isAdding = false;
  }

  async confirmPin(): Promise<void> {
    if (!this.newName.trim() || !this.pendingPin || this.saving) return;
    this.saving = true;
    await supabase.from('pins').insert({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      page_id: this.pageId,
      x_pct: this.pendingPin.x_pct,
      y_pct: this.pendingPin.y_pct,
      name: this.newName.trim(),
      text: this.newText.trim(),
    });
    this.saving = false;
    this.pendingPin = null;
    this.isAdding = false;
    this.newName = '';
    this.newText = '';
  }

  deletePin(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.pins = this.pins.filter(p => p.id !== id);
    this.cdRef.detectChanges();
    supabase.from('pins').delete().eq('id', id);
  }

  startDrag(event: MouseEvent, pin: Pin): void {
    event.preventDefault();
    event.stopPropagation();

    const layer = (event.currentTarget as HTMLElement).parentElement!;
    const layerW = layer.offsetWidth;
    const layerH = layer.offsetHeight;
    const startX = event.clientX;
    const startY = event.clientY;
    const startXPct = pin.x_pct;
    const startYPct = pin.y_pct;
    let moved = false;

    const onMove = (e: MouseEvent) => {
      moved = true;
      pin.x_pct = Math.max(2, Math.min(98, startXPct + (e.clientX - startX) / layerW * 100));
      pin.y_pct = Math.max(1, Math.min(99, startYPct + (e.clientY - startY) / layerH * 100));
      this.cdRef.detectChanges();
    };

    const onUp = async () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (moved) {
        await supabase.from('pins').update({ x_pct: pin.x_pct, y_pct: pin.y_pct }).eq('id', pin.id);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.pendingPin) {
      this.pendingPin = null;
    } else if (this.isAdding) {
      this.isAdding = false;
    }
  }
}
