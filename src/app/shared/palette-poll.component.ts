import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { PALETTES } from './palette.service';

const supabase = createClient(
  'https://bbzamujpfkbvfkgazgwn.supabase.co',
  'sb_publishable_nFa6sDaQA-O4Ldz8neb0Fw_nzzUY-FS'
);

const VOTED_KEY = 'palette-poll-voted';

interface CustomPalette { id: string; name: string; colors: string[]; }

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
        <!-- Vaste paletten -->
        @for (p of palettes; track $index) {
          <button class="option"
            [class.selected]="selectedKey === key($index)"
            [class.is-voted]="votedKey === key($index)"
            [class.after-vote]="votedKey !== null"
            (click)="select(key($index))"
            [disabled]="votedKey !== null">
            <div class="option-top">
              <span class="radio" [class.checked]="votedKey === null ? selectedKey === key($index) : votedKey === key($index)">
                @if (votedKey === key($index)) { <span class="check">✓</span> }
              </span>
              <span class="dots">
                @for (c of p.colors; track c) { <span class="dot" [style.background]="c"></span> }
              </span>
              <span class="name">{{ p.name }}</span>
              @if (votedKey !== null) { <span class="pct">{{ pct(key($index)) }}%</span> }
            </div>
            @if (votedKey !== null) {
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="pct(key($index))" [class.bar-voted]="votedKey === key($index)"></div>
              </div>
            }
          </button>
        }

        <!-- Custom paletten ingediend door gebruikers -->
        @for (cp of customPalettes; track cp.id) {
          <button class="option"
            [class.selected]="selectedKey === cp.id"
            [class.is-voted]="votedKey === cp.id"
            [class.after-vote]="votedKey !== null"
            (click)="select(cp.id)"
            [disabled]="votedKey !== null">
            <div class="option-top">
              <span class="radio" [class.checked]="votedKey === null ? selectedKey === cp.id : votedKey === cp.id">
                @if (votedKey === cp.id) { <span class="check">✓</span> }
              </span>
              <span class="dots">
                @for (c of cp.colors.slice(0, 7); track c) { <span class="dot" [style.background]="c"></span> }
              </span>
              <span class="name">{{ cp.name }}</span>
              <span class="custom-badge">eigen</span>
              @if (votedKey !== null) { <span class="pct">{{ pct(cp.id) }}%</span> }
            </div>
            @if (votedKey !== null) {
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="pct(cp.id)" [class.bar-voted]="votedKey === cp.id"></div>
              </div>
            }
          </button>
        }

        <!-- Eigen palet toevoegen (alleen zichtbaar vóór stemmen) -->
        @if (votedKey === null) {
          @if (!showCustomForm) {
            <button class="option option-add" (click)="openCustomForm()">
              <div class="option-top">
                <span class="add-plus">+</span>
                <span class="name add-name">Mijn eigen kleurenpalet toevoegen</span>
              </div>
            </button>
          } @else {
            <div class="custom-form">
              <div class="custom-form-header">
                <span class="custom-form-title">Jouw kleurenpalet</span>
                <button class="close-btn" (click)="closeCustomForm()">✕</button>
              </div>

              <!-- Live kleurpreview -->
              <div class="custom-preview">
                @for (c of previewColors; track $index) {
                  <span class="cdot" [style.background]="c"></span>
                }
              </div>

              <input class="custom-input" type="text" placeholder="Naam van je palet *"
                [value]="customName" (input)="onNameInput($event)">

              <input class="custom-input" type="text"
                placeholder="#2C7BB6, #E07B00, #7B61E0, ..."
                [value]="customColorsRaw" (input)="onColorsInput($event)">

              <p class="custom-hint">
                @if (customColors.length > 0 && customColors.length < 7) {
                  {{ customColors.length }}/7 kleuren herkend
                } @else if (customColors.length === 7) {
                  ✓ 7 kleuren herkend
                } @else {
                  Tip: kopieer hex-waarden vanuit de Palet Editor
                }
              </p>

              <button class="vote-btn submit-btn"
                [disabled]="!canSubmit" (click)="submitCustomAndVote()">
                {{ savingCustom ? 'Bezig…' : 'Toevoegen &amp; stemmen' }}
              </button>
            </div>
          }
        }
      </div>

      <div class="poll-footer">
        @if (votedKey === null) {
          <button class="vote-btn"
            [disabled]="!selectedKey || selectedKey === '__custom__' || loading"
            (click)="castVote()">
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
    .poll-card { background: #fff; border: 1px solid #E1E9EF; border-radius: 14px; padding: 1.5rem; max-width: 520px; margin: 2rem 0 0; }
    .poll-header { display: flex; align-items: flex-start; gap: .85rem; margin-bottom: 1.25rem; }
    .poll-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: .1rem; }
    .poll-header h3 { font-size: .95rem; font-weight: 600; color: #1A2B3C; margin: 0 0 .2rem; }
    .poll-header p  { font-size: .82rem; color: #566A78; margin: 0; }

    .options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.1rem; }

    .option {
      width: 100%; text-align: left; background: #F9FBFD;
      border: 1.5px solid #E1E9EF; border-radius: 10px; padding: 10px 12px;
      cursor: pointer; font-family: inherit; transition: border-color .15s, background .15s;
    }
    .option:hover:not([disabled]):not(.after-vote) { border-color: #009BE5; background: #EAF8FF; }
    .option.selected   { border-color: #009BE5; background: #EAF8FF; }
    .option.is-voted   { border-color: #009BE5; background: #EAF8FF; }
    .option.after-vote { cursor: default; }
    .option[disabled]  { opacity: 1; }
    .option-add { border-style: dashed; }
    .option-add:hover { border-style: dashed; }

    .option-top { display: flex; align-items: center; gap: 8px; }
    .radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #D0DCE4; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color .15s, background .15s; }
    .radio.checked { border-color: #009BE5; background: #009BE5; }
    .check { font-size: 9px; color: #fff; font-weight: 700; }

    .dots { display: flex; gap: 3px; flex-shrink: 0; }
    .dot  { width: 10px; height: 10px; border-radius: 50%; }

    .name { font-size: .85rem; font-weight: 500; color: #1A2B3C; flex: 1; }
    .pct  { font-size: .82rem; font-weight: 600; color: #009BE5; flex-shrink: 0; min-width: 36px; text-align: right; }

    .custom-badge { font-size: 9px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #009BE5; background: #EAF8FF; border: 1px solid #B4E7FF; border-radius: 4px; padding: 1px 5px; flex-shrink: 0; }

    .add-plus { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #D0DCE4; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #9FB1BD; line-height: 1; }
    .add-name { color: #566A78; font-weight: 400; }

    .bar-track { height: 4px; background: #EEF2F5; border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .bar-fill  { height: 100%; background: #B4E7FF; border-radius: 2px; transition: width .5s ease; }
    .bar-fill.bar-voted { background: #009BE5; }

    /* Custom form */
    .custom-form { background: #F9FBFD; border: 1.5px dashed #B4E7FF; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .custom-form-header { display: flex; align-items: center; justify-content: space-between; }
    .custom-form-title { font-size: .85rem; font-weight: 600; color: #1A2B3C; }
    .close-btn { background: none; border: none; cursor: pointer; color: #9FB1BD; font-size: 13px; padding: 2px 4px; border-radius: 4px; transition: color .15s; }
    .close-btn:hover { color: #566A78; }
    .custom-preview { display: flex; gap: 4px; flex-wrap: wrap; }
    .cdot { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0,0,0,.08); flex-shrink: 0; }
    .custom-input { width: 100%; border: 1px solid #D0DCE4; border-radius: 7px; padding: 7px 10px; font-size: .82rem; font-family: inherit; color: #1A2B3C; outline: none; background: #fff; box-sizing: border-box; transition: border-color .15s; }
    .custom-input:focus { border-color: #009BE5; }
    .custom-hint { font-size: .75rem; color: #9FB1BD; margin: 0; }
    .submit-btn { align-self: flex-start; }

    .poll-footer { display: flex; align-items: center; gap: 1rem; }
    .vote-btn { padding: 8px 22px; border-radius: 8px; border: none; background: #009BE5; color: #fff; font-size: .88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; }
    .vote-btn:hover:not([disabled]) { background: #0691D3; }
    .vote-btn[disabled] { background: #B4E7FF; cursor: default; }
    .thank-you { font-size: .88rem; font-weight: 600; color: #009BE5; }
    .vote-count { font-size: .82rem; color: #9FB1BD; }
  `]
})
export class PalettePollComponent implements OnInit, OnDestroy {
  palettes = PALETTES;
  customPalettes: CustomPalette[] = [];

  votes: Record<string, number> = {};
  total = 0;
  selectedKey: string | null = null;
  votedKey: string | null = null;
  loading = false;

  showCustomForm = false;
  customName = '';
  customColorsRaw = '';
  customColors: string[] = [];
  savingCustom = false;

  private cdRef = inject(ChangeDetectorRef);
  private channel: any;
  private customChannel: any;

  ngOnInit(): void {
    const stored = localStorage.getItem(VOTED_KEY);
    if (stored !== null) this.votedKey = stored;
    this.loadVotes();
    this.loadCustomPalettes();
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    if (this.channel) supabase.removeChannel(this.channel);
    if (this.customChannel) supabase.removeChannel(this.customChannel);
  }

  key(i: number): string { return String(i); }

  pct(k: string): number {
    return this.total === 0 ? 0 : Math.round((this.votes[k] ?? 0) / this.total * 100);
  }

  get previewColors(): string[] {
    const placeholder = Array(7).fill('#E1E9EF');
    return [...this.customColors.slice(0, 7), ...placeholder].slice(0, 7);
  }

  get canSubmit(): boolean {
    return this.customName.trim().length >= 2 && this.customColors.length === 7 && !this.savingCustom;
  }

  select(k: string): void {
    if (this.votedKey !== null) return;
    this.selectedKey = k;
    this.showCustomForm = false;
  }

  openCustomForm(): void {
    if (this.votedKey !== null) return;
    this.showCustomForm = true;
    this.selectedKey = '__custom__';
  }

  closeCustomForm(): void {
    this.showCustomForm = false;
    if (this.selectedKey === '__custom__') this.selectedKey = null;
  }

  onNameInput(event: Event): void {
    this.customName = (event.target as HTMLInputElement).value;
    this.cdRef.detectChanges();
  }

  onColorsInput(event: Event): void {
    this.customColorsRaw = (event.target as HTMLInputElement).value;
    this.customColors = (this.customColorsRaw.match(/#[0-9A-Fa-f]{6}/gi) ?? [])
      .map(c => c.toLowerCase()).slice(0, 7);
    this.cdRef.detectChanges();
  }

  async submitCustomAndVote(): Promise<void> {
    if (!this.canSubmit) return;
    this.savingCustom = true;
    this.cdRef.detectChanges();

    const { data, error: palErr } = await supabase
      .from('custom_palettes')
      .insert({ name: this.customName.trim(), colors: this.customColors.join(',') })
      .select()
      .single();

    if (palErr || !data) { this.savingCustom = false; this.cdRef.detectChanges(); return; }

    const { error: voteErr } = await supabase
      .from('palette_votes')
      .insert({ palette_index: null, custom_palette_id: data.id });

    if (!voteErr) {
      this.votedKey = data.id;
      localStorage.setItem(VOTED_KEY, data.id);
      this.showCustomForm = false;
      await Promise.all([this.loadVotes(), this.loadCustomPalettes()]);
    }
    this.savingCustom = false;
    this.cdRef.detectChanges();
  }

  async castVote(): Promise<void> {
    if (!this.selectedKey || this.selectedKey === '__custom__' || this.votedKey !== null || this.loading) return;
    this.loading = true;
    this.cdRef.detectChanges();

    const isBuiltin = ['0','1','2'].includes(this.selectedKey);
    const payload = isBuiltin
      ? { palette_index: Number(this.selectedKey), custom_palette_id: null }
      : { palette_index: null, custom_palette_id: this.selectedKey };

    const { error } = await supabase.from('palette_votes').insert(payload as any);
    if (!error) {
      this.votedKey = this.selectedKey;
      localStorage.setItem(VOTED_KEY, this.selectedKey);
      await this.loadVotes();
    }
    this.loading = false;
    this.cdRef.detectChanges();
  }

  private async loadVotes(): Promise<void> {
    const { data } = await supabase.from('palette_votes').select('palette_index, custom_palette_id');
    if (data) {
      const counts: Record<string, number> = {};
      for (const row of data) {
        const k = row.custom_palette_id ?? String(row.palette_index);
        counts[k] = (counts[k] ?? 0) + 1;
      }
      this.votes = counts;
      this.total = Object.values(counts).reduce((a, b) => a + b, 0);
      this.cdRef.detectChanges();
    }
  }

  private async loadCustomPalettes(): Promise<void> {
    const { data } = await supabase.from('custom_palettes').select('*').order('created_at');
    if (data) {
      this.customPalettes = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        colors: (row.colors as string).split(',').map((c: string) => c.trim()),
      }));
      this.cdRef.detectChanges();
    }
  }

  private subscribeRealtime(): void {
    this.channel = supabase
      .channel('palette-poll')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'palette_votes' },
        () => this.loadVotes())
      .subscribe();

    this.customChannel = supabase
      .channel('custom-palettes-poll')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_palettes' },
        () => this.loadCustomPalettes())
      .subscribe();
  }
}
