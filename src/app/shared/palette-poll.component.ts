import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { PALETTES } from './palette.service';

const supabase = createClient(
  'https://bbzamujpfkbvfkgazgwn.supabase.co',
  'sb_publishable_nFa6sDaQA-O4Ldz8neb0Fw_nzzUY-FS'
);

const VOTED_KEY = 'palette-poll-voted';

@Component({
  selector: 'app-palette-poll',
  standalone: true,
  template: `
    <div class="poll-card">
      <div class="poll-header">
        <span class="poll-icon">🗳</span>
        <div>
          <h3>Welk kleurenpalet heeft jouw voorkeur?</h3>
          <p>Stem eenmalig en zie wat je collega's kiezen.</p>
        </div>
      </div>

      <div class="options">
        @for (p of palettes; track $index) {
          <button
            class="option"
            [class.selected]="selected === $index"
            [class.is-voted]="voted === $index"
            [class.after-vote]="voted !== null"
            (click)="select($index)"
            [disabled]="voted !== null">
            <div class="option-top">
              <span class="radio" [class.checked]="voted === null ? selected === $index : voted === $index">
                @if (voted === $index) { <span class="check">✓</span> }
              </span>
              <span class="dots">
                @for (c of p.colors; track c) {
                  <span class="dot" [style.background]="c"></span>
                }
              </span>
              <span class="name">{{ p.name }}</span>
              @if (voted !== null) {
                <span class="pct">{{ pct($index) }}%</span>
              }
            </div>
            @if (voted !== null) {
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="pct($index)" [class.bar-voted]="voted === $index"></div>
              </div>
            }
          </button>
        }
      </div>

      <div class="poll-footer">
        @if (voted === null) {
          <button class="vote-btn" [disabled]="selected === null || loading" (click)="castVote()">
            {{ loading ? 'Moment…' : 'Stem' }}
          </button>
          @if (total > 0) {
            <span class="vote-count">{{ total }} {{ total === 1 ? 'stem' : 'stemmen' }}</span>
          }
        } @else {
          <span class="thank-you">✓ Bedankt voor je stem!</span>
          <span class="vote-count">{{ total }} {{ total === 1 ? 'stem' : 'stemmen' }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .poll-card {
      background: #fff;
      border: 1px solid #E1E9EF;
      border-radius: 14px;
      padding: 1.5rem;
      max-width: 520px;
      margin: 1.5rem 0 0;
    }
    .poll-header {
      display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 1.25rem;
    }
    .poll-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 0.1rem; }
    .poll-header h3 { font-size: 0.95rem; font-weight: 600; color: #1A2B3C; margin: 0 0 0.2rem; }
    .poll-header p  { font-size: 0.82rem; color: #566A78; margin: 0; }

    .options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.1rem; }

    .option {
      width: 100%; text-align: left; background: #F9FBFD;
      border: 1.5px solid #E1E9EF; border-radius: 10px;
      padding: 10px 12px; cursor: pointer; font-family: inherit;
      transition: border-color .15s, background .15s;
    }
    .option:hover:not([disabled]):not(.after-vote) { border-color: #009BE5; background: #EAF8FF; }
    .option.selected   { border-color: #009BE5; background: #EAF8FF; }
    .option.is-voted   { border-color: #009BE5; background: #EAF8FF; }
    .option.after-vote { cursor: default; }
    .option[disabled]  { opacity: 1; }

    .option-top { display: flex; align-items: center; gap: 8px; }

    .radio {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid #D0DCE4; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: border-color .15s, background .15s;
    }
    .radio.checked { border-color: #009BE5; background: #009BE5; }
    .check { font-size: 9px; color: #fff; font-weight: 700; line-height: 1; }

    .dots { display: flex; gap: 3px; flex-shrink: 0; }
    .dot  { width: 10px; height: 10px; border-radius: 50%; }

    .name { font-size: 0.85rem; font-weight: 500; color: #1A2B3C; flex: 1; }
    .pct  { font-size: 0.82rem; font-weight: 600; color: #009BE5; flex-shrink: 0; min-width: 36px; text-align: right; }

    .bar-track {
      height: 4px; background: #EEF2F5; border-radius: 2px;
      margin-top: 8px; overflow: hidden;
    }
    .bar-fill {
      height: 100%; background: #B4E7FF; border-radius: 2px;
      transition: width .5s ease;
    }
    .bar-fill.bar-voted { background: #009BE5; }

    .poll-footer { display: flex; align-items: center; gap: 1rem; }

    .vote-btn {
      padding: 8px 22px; border-radius: 8px; border: none;
      background: #009BE5; color: #fff; font-size: 0.88rem;
      font-weight: 600; cursor: pointer; font-family: inherit;
      transition: background .15s;
    }
    .vote-btn:hover:not([disabled]) { background: #0691D3; }
    .vote-btn[disabled] { background: #B4E7FF; cursor: default; }

    .thank-you { font-size: 0.88rem; font-weight: 600; color: #009BE5; }
    .vote-count { font-size: 0.82rem; color: #9FB1BD; }
  `]
})
export class PalettePollComponent implements OnInit, OnDestroy {
  palettes = PALETTES;
  votes = [0, 0, 0];
  total = 0;
  selected: number | null = null;
  voted: number | null = null;
  loading = false;

  private cdRef = inject(ChangeDetectorRef);
  private channel: any;

  ngOnInit(): void {
    const stored = localStorage.getItem(VOTED_KEY);
    if (stored !== null) this.voted = +stored;
    this.loadVotes();
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    if (this.channel) supabase.removeChannel(this.channel);
  }

  select(i: number): void {
    if (this.voted !== null) return;
    this.selected = i;
  }

  async castVote(): Promise<void> {
    if (this.selected === null || this.voted !== null || this.loading) return;
    this.loading = true;
    this.cdRef.detectChanges();
    const { error } = await supabase.from('palette_votes').insert({ palette_index: this.selected });
    if (!error) {
      this.voted = this.selected;
      localStorage.setItem(VOTED_KEY, String(this.selected));
      await this.loadVotes();
    }
    this.loading = false;
    this.cdRef.detectChanges();
  }

  pct(i: number): number {
    return this.total === 0 ? 0 : Math.round(this.votes[i] / this.total * 100);
  }

  private async loadVotes(): Promise<void> {
    const { data } = await supabase.from('palette_votes').select('palette_index');
    if (data) {
      this.votes = [0, 0, 0];
      for (const row of data) {
        if (row.palette_index >= 0 && row.palette_index <= 2) this.votes[row.palette_index]++;
      }
      this.total = this.votes.reduce((a, b) => a + b, 0);
      this.cdRef.detectChanges();
    }
  }

  private subscribeRealtime(): void {
    this.channel = supabase
      .channel('palette-poll')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'palette_votes' }, () => this.loadVotes())
      .subscribe();
  }
}
