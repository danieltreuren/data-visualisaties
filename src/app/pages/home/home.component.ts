import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommentOverlayComponent } from '../../shared/comment-overlay.component';
import { PaletteService } from '../../shared/palette.service';
import { PalettePollComponent } from '../../shared/palette-poll.component';

interface Swatch { name: string; hex: string; role?: string; light?: boolean; }
interface ChartCard { type: string; dutchName: string; englishName: string; description: string; svgPreview: string; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommentOverlayComponent, PalettePollComponent],
  template: `
    <div class="page">
      <app-comment-overlay pageId="home"></app-comment-overlay>

      <!-- ── Hero ── -->
      <section class="hero">
        <div class="container">
          <div class="hero-badge">UX &amp; Design · Brainstorm</div>
          <h1>Data Visualisaties</h1>
          <p class="hero-sub">
            Een interactieve kennisbibliotheek als startpunt voor het UX&amp;Design-team.
            Samen bouwen we aan een gedragen aanpak voor data visualisaties binnen Zorgdeclaraties —
            en op termijn het volledige design system.
          </p>
          <div class="hero-goals">
            <span class="goal-chip">📊 Bar chart &amp; Stacked bar chart</span>
            <span class="goal-chip">♿ Toegankelijkheid &amp; kleurcontrast</span>
            <span class="goal-chip">🎨 Kleurenpalet</span>
            <span class="goal-chip">📐 Leidende principes</span>
          </div>
        </div>
      </section>

      <!-- ── Context ── -->
      <section class="section bg-white">
        <div class="container">
          <div class="section-label">Aanleiding</div>
          <h2>Waarom een kennisbibliotheek?</h2>
          <div class="context-grid">
            <div class="context-block">
              <p>
                Data visualisaties zijn nog geen onderdeel van ons design system. Voor het Zorgdeclaraties-product
                staat een dashboard op de roadmap — met als eerste componenten een staafdiagram en gestapeld staafdiagram.
              </p>
              <p>
                In plaats van ad-hoc te beslissen, willen we <strong>bewust starten</strong>: met gedeelde principes,
                een toegankelijk kleurenpalet en documentatie die schaalbaar is richting het design system.
              </p>
            </div>
            <div class="context-steps">
              <div class="step">
                <span class="step-num">01</span>
                <div>
                  <strong>Brainstorm met het team</strong>
                  <p>Deze praatplaat als startpunt voor een gedragen aanpak</p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">02</span>
                <div>
                  <strong>Eerste ontwerp voor Zorgdeclaraties</strong>
                  <p>Bar chart &amp; stacked bar chart op basis van afgestemde principes</p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">03</span>
                <div>
                  <strong>Opschalen naar design system</strong>
                  <p>Kennisbibliotheek groeit mee met nieuwe visualisatietypen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Principes ── -->
      <section class="section bg-grey">
        <div class="container">
          <div class="section-label">Leidende Principes</div>
          <h2>Zes principes voor goede data visualisaties</h2>
          <p class="section-intro">
            Gebaseerd op het werk van Edward Tufte, Alberto Cairo en WCAG-richtlijnen,
            vertaald naar de context van zorg-dashboards.
          </p>
          <div class="principles-grid">
            @for (p of principles; track p.num) {
              <div class="principle-card">
                <div class="principle-header">
                  <span class="principle-num">{{ p.num }}</span>
                  <span class="principle-icon">{{ p.icon }}</span>
                </div>
                <h3>{{ p.title }}</h3>
                <p>{{ p.body }}</p>
                @if (p.rule) {
                  <div class="principle-rule">{{ p.rule }}</div>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── Kleurenpalet ── -->
      <section class="section bg-white">
        <div class="container">
          <div class="section-label">Kleurenpalet</div>
          <h2>Kleur als communicatiemiddel</h2>
          <p class="section-intro">
            Twee paletten: een <strong>categorisch palet</strong> voor het onderscheiden van data-series,
            en een <strong>semantisch palet</strong> voor status en betekenis.
            Gebruik de palet-schakelaar rechtsboven om te vergelijken — swatches en previews passen zich direct aan.
          </p>

          <h3 class="palette-title">Categorisch palet — {{ activePalette.name }}</h3>
          <p class="palette-note">{{ activePalette.description }}</p>
          <div class="swatches-row">
            @for (s of categoricalSwatches; track s.hex) {
              <div class="swatch" [style.background]="s.hex">
                <div class="swatch-body">
                  <span class="swatch-name">{{ s.name }}</span>
                  <span class="swatch-hex">{{ s.hex }}</span>
                  @if (s.role) { <span class="swatch-role">{{ s.role }}</span> }
                </div>
              </div>
            }
          </div>

          <div class="cb-note">
            <span class="cb-icon">♿</span>
            <span>
              <strong>WCAG &amp; kleurenblindheid:</strong> {{ activePalette.wcagNote }}
              Gebruik daarnaast altijd labels, patronen of vormen als tweede encoding.
            </span>
          </div>

          <app-palette-poll></app-palette-poll>

          <h3 class="palette-title" style="margin-top: 2.5rem;">Semantisch palet — status &amp; betekenis</h3>
          <p class="palette-note">
            Gebruik semantische kleuren consistent en uitsluitend voor de bijbehorende betekenis.
            Vermijd groen/rood als categorische kleuren — reserveer ze voor succes/fout-signalering.
          </p>
          <div class="swatches-semantic">
            @for (s of semanticSwatches; track s.hex) {
              <div class="swatch-semantic" [style.--c]="s.hex">
                <div class="swatch-semantic-bar" [style.background]="s.hex"></div>
                <div class="swatch-semantic-body">
                  <span class="swatch-semantic-name">{{ s.name }}</span>
                  <span class="swatch-semantic-hex">{{ s.hex }}</span>
                  @if (s.role) { <span class="swatch-semantic-role">{{ s.role }}</span> }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── Grafiektypen ── -->
      <section id="grafiektypen" class="section bg-grey">
        <div class="container">
          <div class="section-label">Grafiektypen</div>
          <h2>9 veelgebruikte visualisaties</h2>
          <p class="section-intro">
            Klik op een grafiektype voor een uitgebreide omschrijving: wanneer toepassen, restricties,
            varianten en een interactief voorbeeld. De eerste twee zijn al volledig uitgewerkt.
          </p>
          <div class="charts-grid">
            @for (chart of chartCards; track chart.type) {
              <a class="chart-card" [routerLink]="['/charts', chart.type]">
                <div class="chart-preview" [innerHTML]="trust(chart.svgPreview)"></div>
                <div class="chart-card-body">
                  <h3>{{ chart.dutchName }}</h3>
                  <p class="chart-english">{{ chart.englishName }}</p>
                  <p class="chart-desc">{{ chart.description }}</p>
                </div>
              </a>
            }
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="container">
          <p>Data Visualisaties Kennisbibliotheek · UX &amp; Design · Topicus Healthcare</p>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    .page { position: relative; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    .section { padding: 5rem 0; }
    .bg-white { background: #fff; }
    .bg-grey  { background: #F9FBFD; }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #063EAF 0%, #009BE5 100%);
      padding: 5rem 0 4.5rem;
      color: #fff;
    }
    .hero-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      padding: 0.3rem 0.9rem;
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-size: 3.25rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 1.25rem;
    }
    .hero-sub {
      font-size: 1.1rem;
      line-height: 1.75;
      color: rgba(255,255,255,0.88);
      max-width: 640px;
      margin: 0 0 2rem;
    }
    .hero-goals {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .goal-chip {
      font-size: 0.82rem;
      font-weight: 500;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 0.35rem 0.85rem;
    }

    /* ── Section labels & headings ── */
    .section-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #009BE5;
      margin-bottom: 0.5rem;
    }
    h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1A2B3C;
      letter-spacing: -0.025em;
      margin: 0 0 0.75rem;
    }
    .section-intro {
      font-size: 1rem;
      color: #566A78;
      line-height: 1.7;
      max-width: 720px;
      margin-bottom: 2.5rem;
    }

    /* ── Context ── */
    .context-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }
    .context-block p {
      font-size: 0.95rem;
      color: #3D5166;
      line-height: 1.75;
      margin-bottom: 1rem;
    }
    .context-block p:last-child { margin-bottom: 0; }
    .context-steps { display: flex; flex-direction: column; gap: 1.25rem; }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .step-num {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: #EAF8FF;
      color: #009BE5;
      font-size: 0.72rem;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .step strong { font-size: 0.9rem; color: #1A2B3C; display: block; margin-bottom: 0.2rem; }
    .step p { font-size: 0.85rem; color: #566A78; line-height: 1.5; margin: 0; }

    /* ── Principes ── */
    .principles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .principle-card {
      background: #fff;
      border: 1px solid #E1E9EF;
      border-radius: 12px;
      padding: 1.75rem;
    }
    .principle-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .principle-num {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #009BE5;
      background: #EAF8FF;
      border-radius: 4px;
      padding: 0.2rem 0.5rem;
    }
    .principle-icon { font-size: 1.4rem; }
    .principle-card h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #1A2B3C;
      margin: 0 0 0.5rem;
      line-height: 1.3;
    }
    .principle-card p {
      font-size: 0.85rem;
      color: #566A78;
      line-height: 1.6;
      margin: 0 0 0.75rem;
    }
    .principle-rule {
      font-size: 0.78rem;
      font-weight: 500;
      color: #0691D3;
      background: #EAF8FF;
      border-radius: 6px;
      padding: 0.4rem 0.7rem;
      border-left: 3px solid #009BE5;
    }

    /* ── Kleurenpalet ── */
    .palette-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1A2B3C;
      margin: 0 0 0.4rem;
    }
    .palette-note {
      font-size: 0.85rem;
      color: #566A78;
      line-height: 1.6;
      margin: 0 0 1.25rem;
      max-width: 680px;
    }
    .swatches-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .swatch {
      width: 130px;
      height: 90px;
      border-radius: 10px;
      display: flex;
      align-items: flex-end;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .swatch-body {
      width: 100%;
      padding: 0.5rem 0.6rem;
      background: rgba(0,0,0,0.25);
    }
    .swatch-name {
      display: block;
      font-size: 0.72rem;
      font-weight: 600;
      color: #fff;
      line-height: 1.2;
    }
    .swatch-hex {
      display: block;
      font-size: 0.65rem;
      color: rgba(255,255,255,0.85);
      font-family: 'Courier New', monospace;
    }
    .swatch-role {
      display: block;
      font-size: 0.6rem;
      color: rgba(255,255,255,0.7);
      margin-top: 0.1rem;
    }
    .cb-note {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #F0F9FF;
      border: 1px solid #B4E7FF;
      border-radius: 8px;
      padding: 0.9rem 1.1rem;
      font-size: 0.85rem;
      color: #3D5166;
      line-height: 1.55;
      max-width: 720px;
    }
    .cb-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.05rem; }
    .swatches-semantic {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .swatch-semantic {
      width: 150px;
      border: 1px solid #E1E9EF;
      border-radius: 10px;
      overflow: hidden;
      background: #fff;
    }
    .swatch-semantic-bar { height: 52px; }
    .swatch-semantic-body { padding: 0.6rem 0.75rem; }
    .swatch-semantic-name {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #1A2B3C;
    }
    .swatch-semantic-hex {
      display: block;
      font-size: 0.7rem;
      color: #566A78;
      font-family: 'Courier New', monospace;
    }
    .swatch-semantic-role {
      display: block;
      font-size: 0.7rem;
      color: #89A0AF;
      margin-top: 0.15rem;
    }

    /* ── Grafiektypen ── */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .chart-card {
      background: #fff;
      border: 1px solid #E1E9EF;
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .chart-card:hover {
      box-shadow: 0 8px 28px rgba(0,155,229,0.12);
      transform: translateY(-2px);
    }
    .chart-preview {
      background: #F0F8FF;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .chart-preview ::ng-deep svg { width: 100%; height: 100%; }
    .chart-card-body { padding: 1.25rem; flex: 1; }
    .chart-card-body h3 { font-size: 0.95rem; font-weight: 600; color: #1A2B3C; margin: 0 0 0.2rem; }
    .chart-english { font-size: 0.75rem; color: #9FB1BD; margin: 0 0 0.5rem; display: block; }
    .chart-desc { font-size: 0.83rem; color: #566A78; line-height: 1.5; margin: 0; }

    /* ── Footer ── */
    .footer {
      background: #1A2B3C;
      padding: 2rem 0;
    }
    .footer p {
      font-size: 0.8rem;
      color: #566A78;
      text-align: center;
    }

    @media (max-width: 960px) {
      .principles-grid { grid-template-columns: repeat(2, 1fr); }
      .context-grid { grid-template-columns: 1fr; gap: 2rem; }
      .charts-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .hero h1 { font-size: 2.2rem; }
      .principles-grid { grid-template-columns: 1fr; }
      .charts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HomeComponent {

  private paletteService = inject(PaletteService);

  constructor(private sanitizer: DomSanitizer) {}

  trust(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get activePalette() { return this.paletteService.activePalette(); }

  get categoricalSwatches(): Swatch[] {
    const p = this.paletteService.activePalette();
    return p.swatches.map((s, i) => ({ name: s.name, hex: p.colors[i], role: s.role }));
  }

  get chartCards(): ChartCard[] {
    const C = this.paletteService.colors();
    return [
      {
        type: 'staafdiagram', dutchName: 'Staafdiagram', englishName: 'Bar Chart',
        description: 'Vergelijk categorieën op basis van een numerieke waarde.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <rect x="5"  y="45" width="16" height="26" rx="2" fill="${C[0]}"/>
          <rect x="25" y="28" width="16" height="43" rx="2" fill="${C[0]}"/>
          <rect x="45" y="18" width="16" height="53" rx="2" fill="${C[0]}"/>
          <rect x="65" y="33" width="16" height="38" rx="2" fill="${C[0]}" opacity="0.3"/>
          <rect x="85" y="22" width="16" height="49" rx="2" fill="${C[0]}" opacity="0.3"/>
          <line x1="5" y1="71" x2="105" y2="71" stroke="#D0DCE4" stroke-width="1"/>
        </svg>`
      },
      {
        type: 'gestapeld-staafdiagram', dutchName: 'Gestapeld staafdiagram', englishName: 'Stacked Bar Chart',
        description: 'Toon samenstelling én totaal per categorie.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <rect x="8"  y="38" width="18" height="33" rx="2" fill="${C[0]}"/>
          <rect x="8"  y="22" width="18" height="16" rx="2" fill="${C[1]}"/>
          <rect x="8"  y="12" width="18" height="10" rx="2" fill="${C[2]}"/>
          <rect x="32" y="30" width="18" height="41" rx="2" fill="${C[0]}"/>
          <rect x="32" y="16" width="18" height="14" rx="2" fill="${C[1]}"/>
          <rect x="56" y="35" width="18" height="36" rx="2" fill="${C[0]}"/>
          <rect x="56" y="22" width="18" height="13" rx="2" fill="${C[1]}"/>
          <rect x="56" y="14" width="18" height="8"  rx="2" fill="${C[2]}"/>
          <rect x="80" y="40" width="18" height="31" rx="2" fill="${C[0]}"/>
          <rect x="80" y="28" width="18" height="12" rx="2" fill="${C[1]}"/>
          <line x1="5" y1="71" x2="105" y2="71" stroke="#D0DCE4" stroke-width="1"/>
        </svg>`
      },
      {
        type: 'lijndiagram', dutchName: 'Lijndiagram', englishName: 'Line Chart',
        description: 'Visualiseer trends en verloop over tijd.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <polyline points="8,55 28,35 48,42 68,20 88,28 105,15"
            fill="none" stroke="${C[0]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          <circle cx="8"   cy="55" r="3" fill="${C[0]}"/>
          <circle cx="28"  cy="35" r="3" fill="${C[0]}"/>
          <circle cx="48"  cy="42" r="3" fill="${C[0]}"/>
          <circle cx="68"  cy="20" r="3" fill="${C[0]}"/>
          <circle cx="88"  cy="28" r="3" fill="${C[0]}"/>
          <circle cx="105" cy="15" r="3" fill="${C[0]}"/>
          <line x1="5" y1="71" x2="108" y2="71" stroke="#D0DCE4" stroke-width="1"/>
        </svg>`
      },
      {
        type: 'cirkeldiagram', dutchName: 'Cirkeldiagram / Donut', englishName: 'Pie / Donut Chart',
        description: 'Laat verhoudingen zien binnen een geheel.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <circle cx="55" cy="37" r="28" fill="none" stroke="${C[0]}" stroke-width="12" stroke-dasharray="88 88"  stroke-dashoffset="0"/>
          <circle cx="55" cy="37" r="28" fill="none" stroke="${C[1]}" stroke-width="12" stroke-dasharray="44 132" stroke-dashoffset="-88"/>
          <circle cx="55" cy="37" r="28" fill="none" stroke="${C[2]}" stroke-width="12" stroke-dasharray="44 132" stroke-dashoffset="-132"/>
          <circle cx="55" cy="37" r="16" fill="#F0F8FF"/>
        </svg>`
      },
      {
        type: 'spreidingsdiagram', dutchName: 'Spreidingsdiagram', englishName: 'Scatter Plot',
        description: 'Ontdek correlaties tussen twee variabelen.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="58" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="28" cy="48" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="35" cy="55" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="45" cy="40" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="52" cy="45" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="60" cy="30" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="70" cy="35" r="3.5" fill="${C[0]}" opacity=".8"/>
          <circle cx="78" cy="22" r="3.5" fill="${C[1]}" opacity=".9"/>
          <circle cx="88" cy="25" r="3.5" fill="${C[1]}" opacity=".9"/>
          <circle cx="98" cy="15" r="3.5" fill="${C[1]}" opacity=".9"/>
          <line x1="8" y1="71" x2="108" y2="71" stroke="#D0DCE4" stroke-width="1"/>
          <line x1="8" y1="71" x2="8"   y2="8"  stroke="#D0DCE4" stroke-width="1"/>
        </svg>`
      },
      {
        type: 'vlakdiagram', dutchName: 'Vlakdiagram', englishName: 'Area Chart',
        description: 'Benadruk volume en cumulatieve trends over tijd.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <path d="M8,60 L25,42 L45,50 L65,28 L85,35 L105,18 L105,71 L8,71 Z"
            fill="${C[0]}" opacity="0.2"/>
          <polyline points="8,60 25,42 45,50 65,28 85,35 105,18"
            fill="none" stroke="${C[0]}" stroke-width="2" stroke-linejoin="round"/>
          <line x1="5" y1="71" x2="108" y2="71" stroke="#D0DCE4" stroke-width="1"/>
        </svg>`
      },
      {
        type: 'heatmap', dutchName: 'Heatmap', englishName: 'Heatmap',
        description: 'Toon intensiteit via kleurgradiënt in een matrix.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <rect x="8"  y="8"  width="18" height="14" rx="2" fill="#EAF8FF"/>
          <rect x="30" y="8"  width="18" height="14" rx="2" fill="#69CFFF"/>
          <rect x="52" y="8"  width="18" height="14" rx="2" fill="#2C7BB6"/>
          <rect x="74" y="8"  width="18" height="14" rx="2" fill="#0691D3"/>
          <rect x="96" y="8"  width="12" height="14" rx="2" fill="#063EAF"/>
          <rect x="8"  y="26" width="18" height="14" rx="2" fill="#69CFFF"/>
          <rect x="30" y="26" width="18" height="14" rx="2" fill="#2C7BB6"/>
          <rect x="52" y="26" width="18" height="14" rx="2" fill="#B4E7FF"/>
          <rect x="74" y="26" width="18" height="14" rx="2" fill="#0691D3"/>
          <rect x="96" y="26" width="12" height="14" rx="2" fill="#2C7BB6"/>
          <rect x="8"  y="44" width="18" height="14" rx="2" fill="#2C7BB6"/>
          <rect x="30" y="44" width="18" height="14" rx="2" fill="#EAF8FF"/>
          <rect x="52" y="44" width="18" height="14" rx="2" fill="#0691D3"/>
          <rect x="74" y="44" width="18" height="14" rx="2" fill="#B4E7FF"/>
          <rect x="96" y="44" width="12" height="14" rx="2" fill="#63CFFF"/>
          <rect x="8"  y="62" width="18" height="10" rx="2" fill="#B4E7FF"/>
          <rect x="30" y="62" width="18" height="10" rx="2" fill="#063EAF"/>
          <rect x="52" y="62" width="18" height="10" rx="2" fill="#2C7BB6"/>
          <rect x="74" y="62" width="18" height="10" rx="2" fill="#EAF8FF"/>
          <rect x="96" y="62" width="12" height="10" rx="2" fill="#0691D3"/>
        </svg>`
      },
      {
        type: 'treemap', dutchName: 'Treemap', englishName: 'Treemap',
        description: 'Visualiseer hiërarchische data als geneste rechthoeken.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <rect x="5"  y="5"  width="52" height="65" rx="3" fill="${C[0]}" opacity=".85"/>
          <rect x="61" y="5"  width="44" height="38" rx="3" fill="${C[1]}" opacity=".85"/>
          <rect x="61" y="47" width="22" height="23" rx="3" fill="${C[2]}" opacity=".85"/>
          <rect x="87" y="47" width="18" height="23" rx="3" fill="${C[3]}" opacity=".85"/>
        </svg>`
      },
      {
        type: 'kpi-meter', dutchName: 'KPI / Meter', englishName: 'Gauge',
        description: 'Toon een enkelvoudige waarde ten opzichte van een doel.',
        svgPreview: `<svg viewBox="0 0 110 75" xmlns="http://www.w3.org/2000/svg">
          <path d="M15,65 A40,40 0 0,1 95,65" fill="none" stroke="#D0DCE4" stroke-width="10" stroke-linecap="round"/>
          <path d="M15,65 A40,40 0 0,1 72,30" fill="none" stroke="${C[0]}" stroke-width="10" stroke-linecap="round"/>
          <line x1="55" y1="65" x2="72" y2="30" stroke="#1A2B3C" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="55" cy="65" r="5" fill="#1A2B3C"/>
          <text x="55" y="58" text-anchor="middle" font-size="10" font-weight="700" fill="${C[0]}">72%</text>
        </svg>`
      },
    ];
  }

  principles = [
    {
      num: '01', icon: '🎯',
      title: 'Begin bij de vraag',
      body: 'Elke grafiek is een antwoord op een specifieke vraag. Bepaal eerst wat de gebruiker moet begrijpen — kies dan pas het grafiektype.',
      rule: 'Geen data-first, maar vraag-first.'
    },
    {
      num: '02', icon: '🖊',
      title: 'Maximaliseer de data-inktverhouding',
      body: 'Elke pixel die geen data communiceert is ruis. Verwijder gridlijnen, achtergrondvlakken en decoratie die de boodschap niet versterken.',
      rule: 'Principe van Edward Tufte (1983).'
    },
    {
      num: '03', icon: '🎨',
      title: 'Kleur als encoding, niet decoratie',
      body: 'Gebruik kleur alleen als het een extra dimensie toevoegt. Beperk je tot het categorisch palet (max. 7 kleuren) en reserveer semantische kleuren voor status.',
      rule: 'Max. 5–7 kleuren per grafiek.'
    },
    {
      num: '04', icon: '♿',
      title: 'Toegankelijkheid als standaard',
      body: 'Kleur is nooit de enige encoding. Combineer altijd met labels, texturen of vormen. Valideer contrast op WCAG AA (4.5:1 voor tekst, 3:1 voor grafische elementen).',
      rule: 'WCAG 2.1 AA als minimum.'
    },
    {
      num: '05', icon: '🏷',
      title: 'Context altijd meegeven',
      body: 'Labels, assen, eenheden en een beschrijvende titel zijn geen optionele extra — ze maken de grafiek bruikbaar voor alle gebruikers, inclusief screenreaders.',
      rule: 'Altijd: titel, as-labels en eenheid.'
    },
    {
      num: '06', icon: '📐',
      title: 'Consistentie over creativiteit',
      body: 'Gebruik dezelfde kleurvolgorde, schaalverdeling en typografie in alle grafieken binnen een dashboard. Voorspelbaarheid verlaagt de cognitieve belasting.',
      rule: 'Één kleurpalet voor het hele product.'
    },
  ];

  semanticSwatches: Swatch[] = [
    { name: 'Succes',       hex: '#02C539', role: 'DS Green 700 · positief resultaat' },
    { name: 'Waarschuwing', hex: '#EF8100', role: 'DS Orange 600 · let op' },
    { name: 'Fout',         hex: '#E10036', role: 'DS Red 700 · fout of alarm' },
    { name: 'Info',         hex: '#009BE5', role: 'DS Blue 600 · informatief' },
    { name: 'Neutraal',     hex: '#9FB1BD', role: 'DS Grey 600 · onbeoordeeld' },
  ];

}
