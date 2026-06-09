import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { CommentOverlayComponent } from '../../shared/comment-overlay.component';

interface ChartInfo {
  dutchName: string; englishName: string; category: string;
  description: string; goal: string;
  whenToUse: string[]; whenToAvoid: string[];
  variants: string[]; accessibilityNotes: string[];
}

const C = ['#2C7BB6','#E07B00','#7B61E0','#00897B','#F5A623','#D63D6E','#566A78'];

const AXIS_STYLE = {
  axisLine:  { lineStyle: { color: '#D0DCE4' } },
  axisTick:  { show: false },
  axisLabel: { color: '#566A78', fontSize: 11 },
};
const GRID  = { left: 16, right: 16, top: 16, bottom: 0, containLabel: true };
const SPLIT = { splitLine: { lineStyle: { color: '#EEF2F5', type: 'dashed' as const } } };

const CHART_DATA: Record<string, ChartInfo> = {
  'staafdiagram': {
    dutchName: 'Staafdiagram', englishName: 'Bar Chart', category: 'Vergelijking',
    description: 'Het staafdiagram vergelijkt categorieën via balken met een gedeelde basislijn. Onze visuele cortex vergelijkt lengtes nauwkeurig, waardoor dit een van de meest betrouwbare grafiektypen is.',
    goal: 'Vergelijk categorieën op basis van één numerieke waarde.',
    whenToUse: ['Vergelijken van discrete categorieën (afdelingen, zorgpaden, diagnosegroepen)','Rangordening communiceren — de langste balk valt onmiddellijk op','Klein tot middelgroot aantal categorieën (ideaal 3–10)'],
    whenToAvoid: ['Meer dan ~15 categorieën','Trend over tijd — gebruik dan een lijndiagram','Part-to-whole verhoudingen — gebruik gestapeld of taartdiagram'],
    variants: ['Verticale balken — standaard','Horizontale balken — beter bij lange labels','Gegroepeerde balken — meerdere series naast elkaar'],
    accessibilityNotes: ['Voeg directe labels toe aan de balken','Zorg voor 3:1 contrast tussen balk en achtergrond','Horizontale oriëntatie is screenreader-vriendelijker'],
  },
  'gestapeld-staafdiagram': {
    dutchName: 'Gestapeld staafdiagram', englishName: 'Stacked Bar Chart', category: 'Samenstelling',
    description: 'Elke balk is opgedeeld in gekleurde segmenten die subcategorieën representeren. Hiermee communiceer je tegelijk het totaal en de samenstelling.',
    goal: 'Toon samenstelling én totaal per categorie.',
    whenToUse: ['Samenstelling én totaal tegelijk tonen','Verhoudingen vergelijken tussen groepen','Maximaal 4–5 segmenten voor leesbaarheid'],
    whenToAvoid: ['Precieze vergelijking van niet-basislijnsegmenten','Meer dan 5 subcategorieën','Alleen verhoudingen tonen — gebruik dan de 100%-variant'],
    variants: ['Standaard gestapeld — absolute waarden zichtbaar','100% gestapeld — nadruk op verhoudingen','Horizontaal gestapeld — beter bij lange labels'],
    accessibilityNotes: ['Voeg altijd een legenda toe','Gebruik het categorisch palet — nooit rood + groen als buren','Overweeg directe labels bij max. 3 segmenten'],
  },
  'lijndiagram': {
    dutchName: 'Lijndiagram', englishName: 'Line Chart', category: 'Trend',
    description: 'Verbindt datapunten met een lijn en is het standaard instrument voor trends over een continue as. De lijn suggereert continuïteit — gebruik dit type uitsluitend bij inherent geordende data.',
    goal: 'Toon trends, verloop en verandering over een continue as.',
    whenToUse: ['Trends en verandering over tijd','Vergelijken van meerdere series (max. 5–6 lijnen)','Doorlopende data waarbij interpolatie zinvol is'],
    whenToAvoid: ['Categorische data zonder inherente volgorde','Slechts één of twee datapunten','Meer dan 6–7 series — wordt een "spaghetti-diagram"'],
    variants: ['Rechte lijnen — nadruk op exacte datapunten','Vloeiende lijnen — nadruk op het verloop','Stap-lijnen — voor discrete veranderingen (bijv. tarieven)'],
    accessibilityNotes: ['Combineer kleur met lijnpatronen (gestippeld, streepje)','Directe labels aan het einde zijn beter dan een aparte legenda','Min. 3:1 contrast voor de lijn ten opzichte van de achtergrond'],
  },
  'cirkeldiagram': {
    dutchName: 'Cirkeldiagram / Donut', englishName: 'Pie / Donut Chart', category: 'Samenstelling',
    description: 'Toont verhoudingen als segmenten van een cirkel. Mensen vergelijken hoeken minder nauwkeurig dan lengtes — gebruik spaarzaam en bij voorkeur de donut-variant.',
    goal: 'Toon eenvoudige part-to-whole verhoudingen.',
    whenToUse: ['Max. 5 segmenten met duidelijk onderscheid','Één dominant aandeel dat direct duidelijk moet zijn','Donut: centrale KPI-waarde weergeven'],
    whenToAvoid: ['Meer dan 5–6 segmenten','Wanneer precieze vergelijking vereist is — gebruik staafdiagram','Negatieve waarden of nulwaarden'],
    variants: ['Cirkeldiagram (vol)','Donut-diagram — met centrale waarde','Semi-donut — ruimtebesparend voor dashboards'],
    accessibilityNotes: ['Voeg percentagewaarden direct bij segmenten toe','Gebruik nooit alleen kleur — voeg labels toe','Vermijd "exploded slices": verstoort proporties'],
  },
  'spreidingsdiagram': {
    dutchName: 'Spreidingsdiagram', englishName: 'Scatter Plot', category: 'Correlatie',
    description: 'Plaatst individuele datapunten op twee assen om correlaties, clusters en uitschieters zichtbaar te maken. Het krachtigste type voor verbanden tussen continue variabelen.',
    goal: 'Ontdek correlaties, clusters en uitschieters tussen twee variabelen.',
    whenToUse: ['Correlatie of relatie tussen twee continue variabelen','Clusters of uitschieters ontdekken','Grote datasets met veel observaties'],
    whenToAvoid: ['Categorische data op beide assen','Minder dan ~10 datapunten — gebruik dan een tabel','Voor een niet-analytisch publiek'],
    variants: ['Standaard scatter','Bubble chart — derde dimensie via puntgrootte','Connected scatter — tijdsvolgorde zichtbaar'],
    accessibilityNotes: ['Min. 6px puntgrootte voor zichtbaarheid','Bij overlapping: gebruik transparantie of jitter','Voeg een trendlijn toe om correlatie te verduidelijken'],
  },
  'vlakdiagram': {
    dutchName: 'Vlakdiagram', englishName: 'Area Chart', category: 'Trend',
    description: 'Een lijndiagram waarbij het gebied onder de lijn gevuld is. De vulling benadrukt volume en cumulatieve waarden. Bijzonder effectief voor gestapelde bijdragen over tijd.',
    goal: 'Benadruk volume en cumulatieve trends over tijd.',
    whenToUse: ['Cumulatief volume over tijd','Meerdere series waarbij het totaal relevant is','Gestapeld: part-to-whole over tijd'],
    whenToAvoid: ['Overlappende series die elkaar maskeren','Meer dan 3–4 gestapelde series'],
    variants: ['Standaard — één serie met nadruk op volume','Gestapeld — meerdere series opgestapeld','100% gestapeld — proportionele bijdrage'],
    accessibilityNotes: ['Gebruik 0.7–0.85 opacity voor overlappende gebieden','Voeg lijncontour toe voor betere leesbaarheid'],
  },
  'heatmap': {
    dutchName: 'Heatmap', englishName: 'Heatmap', category: 'Patroon',
    description: 'Kleur als primaire encoding om waarden in een matrix te tonen. Patronen, concentraties en afwijkingen zijn direct zichtbaar zonder individuele waarden te lezen.',
    goal: 'Maak patronen en concentraties zichtbaar in een matrix.',
    whenToUse: ['Patronen in een matrix (dag × uur, afdeling × periode)','Correlatiematrices','Grote datasets waarbij het patroon belangrijker is dan waarden'],
    whenToAvoid: ['Exacte waarden cruciaal zijn — kleur is minder precies dan positie','Rood-groen kleurschema — problematisch bij kleurenblindheid'],
    variants: ['Kalender-heatmap','Correlatie-heatmap','Geografische heatmap'],
    accessibilityNotes: ['Gebruik sequentieel of divergerend kleurschema — nooit rood-groen','Voeg numerieke waarden toe als overlay','Geef de kleurschaal een legenda met min, midden en max'],
  },
  'treemap': {
    dutchName: 'Treemap', englishName: 'Treemap', category: 'Hiërarchie',
    description: 'Hiërarchische data als geneste rechthoeken. Oppervlak representeert een kwantitatieve waarde. Ruimte-efficiënt voor grote datasets met meerdere niveaus.',
    goal: 'Toon hiërarchische data en grootteverhouding van subcategorieën.',
    whenToUse: ['Hiërarchische data met kwantitatieve waarden','Grootte van subcategorieën vergelijken','Ruimte-efficiënte weergave van geneste datasets'],
    whenToAvoid: ['Precieze vergelijking — oppervlak is moeilijker te schatten dan lengte','Meer dan 2–3 hiërarchieniveaus'],
    variants: ['Enkelvoudige treemap','Geneste treemap — meerdere hiërarchieniveaus'],
    accessibilityNotes: ['Voeg tekstlabels toe aan cellen die groot genoeg zijn','Kleine cellen zijn onleesbaar — overweeg drempelwaarde voor "overig"'],
  },
  'kpi-meter': {
    dutchName: 'KPI / Meter', englishName: 'Gauge', category: 'Status',
    description: 'Toont een enkelvoudige waarde ten opzichte van een doel of schaal. Snel leesbaar dashboard-component voor statusoverzichten in zorgcontexten.',
    goal: 'Toon de status van één metric ten opzichte van een doel of drempel.',
    whenToUse: ['Één metric met een duidelijk doel of drempelwaarde','Dashboard-contexten met snelle statusaflezing','KPIs zoals bezettingsgraad, doelrealisatie, naleving'],
    whenToAvoid: ['Trends of vergelijkingen zijn relevant — gebruik lijn- of staafdiagram','Meerdere niet-gerelateerde metrics naast elkaar'],
    variants: ['Halve cirkel (semi-circle gauge)','Lineaire meter / progress bar','Bullet chart — rijker alternatief met doel en bandbreedte'],
    accessibilityNotes: ['Voeg altijd de numerieke waarde toe','Gebruik semantische kleuren voor zones (groen/oranje/rood)','Zorg voor een tekstalternatief dat de status beschrijft'],
  },
};

const FALLBACK: ChartInfo = {
  dutchName: 'Onbekend', englishName: 'Unknown', category: '',
  description: '', goal: '', whenToUse: [], whenToAvoid: [], variants: [], accessibilityNotes: [],
};

@Component({
  selector: 'app-chart-detail',
  standalone: true,
  imports: [RouterLink, NgxEchartsDirective, CommentOverlayComponent],
  template: `
    <div class="page">
      <app-comment-overlay [pageId]="chartType"></app-comment-overlay>
      <div class="container">

        <a class="back-link" routerLink="/">← Terug naar overzicht</a>

        <header class="detail-header">
          <span class="chart-category">{{ chart.category }}</span>
          <h1>{{ chart.dutchName }}</h1>
          <span class="english-label">{{ chart.englishName }}</span>
        </header>

        <div class="goal-bar">
          <span class="goal-label">Doel</span>
          <span class="goal-text">{{ chart.goal }}</span>
        </div>

        <p class="description">{{ chart.description }}</p>

        <!-- ── Voorbeeldvisualisaties ── -->
        <div class="chart-section">
          <h2>Voorbeeldvisualisaties</h2>
          <div class="chart-examples">

            @if (chartType === 'staafdiagram') {
              <div class="chart-example">
                <div class="chart-example-label">Declaraties per zorgtype (Q1 2025)</div>
                <div echarts [options]="opts['barV']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Horizontale variant — zorgpaden</div>
                <div echarts [options]="opts['barH']" class="echart"></div>
              </div>
            }

            @if (chartType === 'gestapeld-staafdiagram') {
              <div class="chart-example">
                <div class="chart-example-label">Declaraties naar type per maand</div>
                <div echarts [options]="opts['stackedV']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">100% gestapeld — verhoudingen per maand</div>
                <div echarts [options]="opts['stacked100']" class="echart"></div>
              </div>
            }

            @if (chartType === 'lijndiagram') {
              <div class="chart-example">
                <div class="chart-example-label">Patiëntbezoeken per maand (2025)</div>
                <div echarts [options]="opts['lineSingle']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Vergelijking 2024 vs 2025</div>
                <div echarts [options]="opts['lineMulti']" class="echart"></div>
              </div>
            }

            @if (chartType === 'cirkeldiagram') {
              <div class="chart-example">
                <div class="chart-example-label">Donut — declaratietypes</div>
                <div echarts [options]="opts['donut']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Cirkeldiagram — zorgcategorieën</div>
                <div echarts [options]="opts['pie']" class="echart"></div>
              </div>
            }

            @if (chartType === 'spreidingsdiagram') {
              <div class="chart-example">
                <div class="chart-example-label">Behandelduur vs tevredenheidscore</div>
                <div echarts [options]="opts['scatter']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Bubble chart — 3 dimensies</div>
                <div echarts [options]="opts['bubble']" class="echart"></div>
              </div>
            }

            @if (chartType === 'vlakdiagram') {
              <div class="chart-example">
                <div class="chart-example-label">Declaratievolume over tijd</div>
                <div echarts [options]="opts['areaSingle']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Gestapeld vlakdiagram — per type</div>
                <div echarts [options]="opts['areaStacked']" class="echart"></div>
              </div>
            }

            @if (chartType === 'heatmap') {
              <div class="chart-example">
                <div class="chart-example-label">Aanmeldingen per dag × tijdstip</div>
                <div echarts [options]="opts['heatmapDayHour']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Volume per afdeling × maand</div>
                <div echarts [options]="opts['heatmapGrid']" class="echart"></div>
              </div>
            }

            @if (chartType === 'treemap') {
              <div class="chart-example">
                <div class="chart-example-label">Declaraties per zorgcategorie</div>
                <div echarts [options]="opts['treemap']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Geneste treemap — met subcategorieën</div>
                <div echarts [options]="opts['treemapNested']" class="echart"></div>
              </div>
            }

            @if (chartType === 'kpi-meter') {
              <div class="chart-example">
                <div class="chart-example-label">Semi-circle gauge — bezettingsgraad</div>
                <div echarts [options]="opts['gauge']" class="echart"></div>
              </div>
              <div class="chart-example">
                <div class="chart-example-label">Progress bars — meerdere KPIs</div>
                <div echarts [options]="opts['progress']" class="echart"></div>
              </div>
            }

          </div>
        </div>

        <!-- ── Info kaarten ── -->
        <div class="info-grid">
          <div class="info-card use">
            <h2>✓ Gebruik wanneer...</h2>
            <ul>@for (item of chart.whenToUse; track item) { <li>{{ item }}</li> }</ul>
          </div>
          <div class="info-card avoid">
            <h2>✕ Vermijd wanneer...</h2>
            <ul>@for (item of chart.whenToAvoid; track item) { <li>{{ item }}</li> }</ul>
          </div>
        </div>

        <div class="variants-card">
          <h2>Varianten</h2>
          <ul class="variants-list">
            @for (v of chart.variants; track v) {
              <li><span class="variant-dot"></span>{{ v }}</li>
            }
          </ul>
        </div>

        <div class="a11y-card">
          <h2>♿ Toegankelijkheid</h2>
          <ul>@for (note of chart.accessibilityNotes; track note) { <li>{{ note }}</li> }</ul>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { position: relative; min-height: 100vh; background: #F9FBFD; padding: 2.5rem 0 6rem; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 2rem; }
    .back-link { display: inline-block; color: #009BE5; text-decoration: none; font-size: .88rem; font-weight: 500; margin-bottom: 2rem; transition: color .15s; }
    .back-link:hover { color: #0691D3; }
    .chart-category { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #009BE5; display: block; margin-bottom: .4rem; }
    h1 { font-size: 2.5rem; font-weight: 700; color: #1A2B3C; letter-spacing: -.03em; margin: 0 0 .4rem; }
    .english-label { font-size: 1rem; color: #9FB1BD; }
    .goal-bar { display: flex; align-items: baseline; gap: .75rem; background: #EAF8FF; border-left: 3px solid #009BE5; border-radius: 0 8px 8px 0; padding: .75rem 1.1rem; margin: 1.5rem 0 1.75rem; }
    .goal-label { font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #009BE5; flex-shrink: 0; }
    .goal-text { font-size: .92rem; color: #1A2B3C; font-weight: 500; }
    .description { font-size: 1rem; color: #3D5166; line-height: 1.8; margin-bottom: 2.5rem; max-width: 800px; }
    .chart-section h2 { font-size: 1.1rem; font-weight: 600; color: #1A2B3C; margin: 0 0 1.25rem; }
    .chart-examples { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
    .chart-example { background: #fff; border: 1px solid #E1E9EF; border-radius: 12px; padding: 1.25rem; overflow: hidden; }
    .chart-example-label { font-size: .8rem; font-weight: 500; color: #566A78; margin-bottom: .75rem; }
    .echart { height: 240px; width: 100%; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .info-card { padding: 1.75rem; border-radius: 12px; border: 1px solid transparent; }
    .info-card.use   { background: #F0FAF4; border-color: #AEFFC5; }
    .info-card.avoid { background: #FFF5F5; border-color: #FFBCCC; }
    h2 { font-size: .95rem; font-weight: 600; margin: 0 0 1rem; color: #1A2B3C; }
    .info-card ul { margin: 0; padding: 0 0 0 1.25rem; }
    .info-card li { font-size: .88rem; color: #3D5166; line-height: 1.65; margin-bottom: .4rem; }
    .variants-card { background: #fff; border: 1px solid #E1E9EF; border-radius: 12px; padding: 1.75rem; margin-bottom: 1.5rem; }
    .variants-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .6rem; }
    .variants-list li { display: flex; align-items: flex-start; gap: .65rem; font-size: .88rem; color: #3D5166; }
    .variant-dot { width: 7px; height: 7px; border-radius: 50%; background: #009BE5; flex-shrink: 0; margin-top: .4rem; }
    .a11y-card { background: #F0F9FF; border: 1px solid #B4E7FF; border-radius: 12px; padding: 1.75rem; }
    .a11y-card ul { margin: 0; padding: 0 0 0 1.25rem; }
    .a11y-card li { font-size: .88rem; color: #3D5166; line-height: 1.65; margin-bottom: .4rem; }
    @media (max-width: 700px) { .info-grid, .chart-examples { grid-template-columns: 1fr; } h1 { font-size: 1.9rem; } }
  `]
})
export class ChartDetailComponent implements OnInit {
  chart: ChartInfo = FALLBACK;
  chartType = '';
  opts: Record<string, EChartsOption> = {};

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.chartType = this.route.snapshot.paramMap.get('type') ?? '';
    this.chart = CHART_DATA[this.chartType] ?? FALLBACK;
    this.buildCharts();
  }

  private buildCharts(): void {
    const months  = ['Jan','Feb','Mrt','Apr','Mei','Jun'];
    const tooltip = { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } };
    const legend  = { bottom: 0, textStyle: { color: '#566A78', fontSize: 11 } };
    const gridLeg = { left: 16, right: 16, top: 16, bottom: 40, containLabel: true };

    // ── BAR ──────────────────────────────────────────────────────────
    this.opts['barV'] = {
      tooltip,
      grid: GRID,
      xAxis: { type: 'category', data: ['Poliklinisch','Dagbehandeling','Klinisch','Spoed','Revalidatie'], ...AXIS_STYLE },
      yAxis: { type: 'value', ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      series: [{ type: 'bar', data: [1240,870,540,320,290], barMaxWidth: 52,
        itemStyle: { color: C[0], borderRadius: [4,4,0,0] },
        label: { show: true, position: 'top', color: '#566A78', fontSize: 11 } }]
    };
    this.opts['barH'] = {
      tooltip,
      grid: GRID,
      xAxis: { type: 'value', ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      yAxis: { type: 'category', data: ['Oncologie','Cardiologie','Orthopedie','Neurologie','Dermatologie'].reverse(), ...AXIS_STYLE },
      series: [{ type: 'bar', data: [890,760,630,480,340].reverse(), barMaxWidth: 36,
        itemStyle: { color: C[0], borderRadius: [0,4,4,0] },
        label: { show: true, position: 'right', color: '#566A78', fontSize: 11 } }]
    };

    // ── STACKED BAR ───────────────────────────────────────────────────
    const poli = [420,380,510,470,530,490], klin = [180,210,160,230,195,215], spoed = [95,110,88,120,105,98];
    const baseStack: EChartsOption = { tooltip, legend, grid: gridLeg,
      xAxis: { type: 'category', data: months, ...AXIS_STYLE },
      yAxis: { type: 'value', ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } } };
    this.opts['stackedV'] = { ...baseStack, series: [
      { name:'Poliklinisch', type:'bar', stack:'t', data: poli,  itemStyle:{ color: C[0] }, barMaxWidth: 52 },
      { name:'Klinisch',     type:'bar', stack:'t', data: klin,  itemStyle:{ color: C[1] } },
      { name:'Spoed',        type:'bar', stack:'t', data: spoed, itemStyle:{ color: C[2], borderRadius:[4,4,0,0] } },
    ]};
    const pct = (arr: number[], i: number) => Math.round(arr[i] / (poli[i]+klin[i]+spoed[i]) * 100);
    this.opts['stacked100'] = { ...baseStack,
      yAxis: { type:'value', max:100, axisLabel:{ color:'#566A78', fontSize:11, formatter:'{value}%' }, ...SPLIT },
      series: [
        { name:'Poliklinisch', type:'bar', stack:'t', data: months.map((_,i)=>pct(poli,i)),  itemStyle:{ color: C[0] }, barMaxWidth: 52 },
        { name:'Klinisch',     type:'bar', stack:'t', data: months.map((_,i)=>pct(klin,i)),  itemStyle:{ color: C[1] } },
        { name:'Spoed',        type:'bar', stack:'t', data: months.map((_,i)=>pct(spoed,i)), itemStyle:{ color: C[2], borderRadius:[4,4,0,0] } },
      ]};

    // ── LINE ──────────────────────────────────────────────────────────
    const visits25 = [1240,1380,1520,1290,1650,1430];
    const visits24 = [1180,1290,1410,1350,1580,1390];
    const lineAxis: EChartsOption = { tooltip: { trigger:'axis' as const },
      grid: gridLeg,
      xAxis: { type:'category', data: months, ...AXIS_STYLE, boundaryGap: false },
      yAxis: { type:'value', min: 1000, ...SPLIT, axisLabel:{ color:'#566A78', fontSize:11 } } };
    this.opts['lineSingle'] = { ...lineAxis, legend: undefined, grid: GRID, series: [{
      type:'line', data: visits25, smooth: true,
      lineStyle:{ color: C[0], width:2.5 }, itemStyle:{ color: C[0] },
      areaStyle:{ color: C[0], opacity: 0.08 },
      label:{ show: false }
    }]};
    this.opts['lineMulti'] = { ...lineAxis, legend, series: [
      { name:'2025', type:'line', data: visits25, smooth: true, lineStyle:{ color: C[0], width:2.5 }, itemStyle:{ color: C[0] } },
      { name:'2024', type:'line', data: visits24, smooth: true, lineStyle:{ color: C[6], width:2, type:'dashed' }, itemStyle:{ color: C[6] } },
    ]};

    // ── PIE / DONUT ───────────────────────────────────────────────────
    const pieData = [
      { value:1240, name:'Poliklinisch',  itemStyle:{ color: C[0] } },
      { value:540,  name:'Klinisch',      itemStyle:{ color: C[1] } },
      { value:320,  name:'Spoed',         itemStyle:{ color: C[2] } },
      { value:290,  name:'Revalidatie',   itemStyle:{ color: C[3] } },
      { value:110,  name:'Overig',        itemStyle:{ color: C[6] } },
    ];
    this.opts['donut'] = {
      tooltip: { trigger:'item' as const, formatter:'{b}: {d}%' },
      legend: { bottom:0, textStyle:{ color:'#566A78', fontSize:11 } },
      series: [{ type:'pie', radius:['40%','68%'], center:['50%','46%'], data: pieData,
        label:{ formatter:'{d}%', color:'#1A2B3C', fontSize:11 } }]
    };
    this.opts['pie'] = {
      tooltip: { trigger:'item' as const, formatter:'{b}: {d}%' },
      legend: { bottom:0, textStyle:{ color:'#566A78', fontSize:11 } },
      series: [{ type:'pie', radius:'62%', center:['50%','46%'], data: pieData,
        label:{ formatter:'{b}\n{d}%', color:'#1A2B3C', fontSize:10 } }]
    };

    // ── SCATTER ───────────────────────────────────────────────────────
    const scatter1 = Array.from({length:20}, (_,i) => [20+i*3+(Math.sin(i)*5|0), 60+i*1.5+(Math.cos(i)*8|0)]);
    const scatter2 = Array.from({length:15}, (_,i) => [80+i*2+(Math.sin(i*2)*6|0), 40+i*2+(Math.cos(i*2)*10|0)]);
    const scatterAxis: EChartsOption = {
      tooltip: { trigger:'item' as const, formatter: (p: any) => `Duur: ${p.data[0]} min<br>Score: ${p.data[1]}` },
      grid: GRID,
      xAxis: { type:'value', name:'Behandelduur (min)', nameTextStyle:{ color:'#566A78', fontSize:11 }, ...AXIS_STYLE, ...SPLIT },
      yAxis: { type:'value', name:'Tevredenheid', nameTextStyle:{ color:'#566A78', fontSize:11 }, ...SPLIT, axisLabel:{ color:'#566A78', fontSize:11 } },
    };
    this.opts['scatter'] = { ...scatterAxis, legend, series: [
      { name:'Routine', type:'scatter', data: scatter1, symbolSize:8, itemStyle:{ color: C[0], opacity:.75 } },
      { name:'Complex', type:'scatter', data: scatter2, symbolSize:8, itemStyle:{ color: C[1], opacity:.75 } },
    ]};
    const bubble = Array.from({length:12}, (_,i) => [20+i*7, 50+Math.sin(i)*20, 8+i*3]);
    this.opts['bubble'] = { ...scatterAxis, legend: undefined, grid: GRID, series: [{
      type:'scatter', data: bubble,
      symbolSize: (d: number[]) => Math.sqrt(d[2]) * 5,
      itemStyle:{ color: C[0], opacity:.7 },
      label:{ show: false }
    }]};

    // ── AREA ─────────────────────────────────────────────────────────
    const areaBase: EChartsOption = {
      tooltip: { trigger:'axis' as const }, grid: gridLeg, legend,
      xAxis: { type:'category', data: months, ...AXIS_STYLE, boundaryGap: false },
      yAxis: { type:'value', ...SPLIT, axisLabel:{ color:'#566A78', fontSize:11 } }
    };
    this.opts['areaSingle'] = { ...areaBase, legend: undefined, grid: GRID, series: [{
      type:'line', data:[420,380,510,470,530,490], smooth:true,
      lineStyle:{ color: C[0], width:2 }, itemStyle:{ color: C[0] },
      areaStyle:{ color: C[0], opacity:0.15 }
    }]};
    this.opts['areaStacked'] = { ...areaBase, series: [
      { name:'Poliklinisch', type:'line', stack:'t', smooth:true, data: poli, lineStyle:{ color: C[0] }, itemStyle:{ color: C[0] }, areaStyle:{ color: C[0], opacity:0.6 } },
      { name:'Klinisch',     type:'line', stack:'t', smooth:true, data: klin, lineStyle:{ color: C[1] }, itemStyle:{ color: C[1] }, areaStyle:{ color: C[1], opacity:0.6 } },
      { name:'Spoed',        type:'line', stack:'t', smooth:true, data: spoed,lineStyle:{ color: C[2] }, itemStyle:{ color: C[2] }, areaStyle:{ color: C[2], opacity:0.6 } },
    ]};

    // ── HEATMAP ───────────────────────────────────────────────────────
    const days  = ['Ma','Di','Wo','Do','Vr'];
    const hours = ['8u','9u','10u','11u','12u','13u','14u','15u','16u'];
    const hmData: [number,number,number][] = [];
    for (let d = 0; d < days.length; d++)
      for (let h = 0; h < hours.length; h++)
        hmData.push([h, d, Math.max(0, 30 + Math.round(Math.sin(d+h)*20 + Math.cos(h)*15))]);
    this.opts['heatmapDayHour'] = {
      tooltip: { position:'top' as const, formatter: (p: any) => `${days[p.data[1]]} ${hours[p.data[0]]}: ${p.data[2]} aanmeldingen` },
      grid: { left:40, right:40, top:10, bottom:50, containLabel:true },
      xAxis: { type:'category', data: hours, splitArea:{ show:true }, ...AXIS_STYLE },
      yAxis: { type:'category', data: days,  splitArea:{ show:true }, ...AXIS_STYLE },
      visualMap: { min:0, max:80, calculable:true, orient:'horizontal', left:'center', bottom:0,
        inRange:{ color:['#EAF8FF','#009BE5','#063EAF'] },
        textStyle:{ color:'#566A78', fontSize:10 } },
      series: [{ type:'heatmap', data: hmData, label:{ show:true, fontSize:9, color:'#1A2B3C' } }]
    };
    const depts   = ['Cardiologie','Oncologie','Neurologie','Orthopedie'];
    const hmGrid: [number,number,number][] = [];
    for (let m = 0; m < months.length; m++)
      for (let d = 0; d < depts.length; d++)
        hmGrid.push([m, d, 100 + Math.round(Math.sin(m+d)*80 + Math.cos(m)*60)]);
    this.opts['heatmapGrid'] = {
      tooltip: { position:'top' as const },
      grid: { left:80, right:40, top:10, bottom:50, containLabel:false },
      xAxis: { type:'category', data: months, splitArea:{ show:true }, ...AXIS_STYLE },
      yAxis: { type:'category', data: depts,  splitArea:{ show:true }, ...AXIS_STYLE },
      visualMap: { min:0, max:200, calculable:true, orient:'horizontal', left:'center', bottom:0,
        inRange:{ color:['#EAF8FF','#009BE5','#063EAF'] },
        textStyle:{ color:'#566A78', fontSize:10 } },
      series: [{ type:'heatmap', data: hmGrid, label:{ show:true, fontSize:10, color:'#fff' } }]
    };

    // ── TREEMAP ───────────────────────────────────────────────────────
    this.opts['treemap'] = {
      tooltip: { formatter: (p: any) => `${p.name}: ${p.value.toLocaleString('nl-NL')}` },
      series: [{ type:'treemap', roam: false, nodeClick: false,
        data: [
          { name:'Ziekenhuiszorg', value:4500, itemStyle:{ color: C[0] } },
          { name:'GGZ',           value:1200, itemStyle:{ color: C[1] } },
          { name:'Farmacie',      value: 890, itemStyle:{ color: C[2] } },
          { name:'Hulpmiddelen',  value: 430, itemStyle:{ color: C[3] } },
          { name:'Paramedisch',   value: 320, itemStyle:{ color: C[4] } },
          { name:'Overig',        value: 180, itemStyle:{ color: C[6] } },
        ],
        label: { show:true, color:'#fff', fontSize:12, fontWeight:'bold' },
        breadcrumb: { show:false }, left:'2%', right:'2%', top:'2%', bottom:'2%'
      }]
    };
    this.opts['treemapNested'] = {
      tooltip: { formatter: (p: any) => `${p.name}: ${p.value.toLocaleString('nl-NL')}` },
      series: [{ type:'treemap', roam: false, nodeClick: false,
        data: [
          { name:'Ziekenhuiszorg', value:4500, itemStyle:{ color: C[0] }, children: [
            { name:'Opname',      value:2200, itemStyle:{ color: '#3A8EC6' } },
            { name:'Polikliniek', value:1800, itemStyle:{ color: '#1A6B9A' } },
            { name:'DBC',         value: 500, itemStyle:{ color: '#0D4F73' } },
          ]},
          { name:'GGZ', value:1200, itemStyle:{ color: C[1] }, children: [
            { name:'Basis GGZ',         value:800, itemStyle:{ color: '#F0900A' } },
            { name:'Gespecialiseerde GGZ', value:400, itemStyle:{ color: '#C06800' } },
          ]},
          { name:'Farmacie',     value: 890, itemStyle:{ color: C[2] } },
          { name:'Hulpmiddelen', value: 430, itemStyle:{ color: C[3] } },
        ],
        label: { show:true, color:'#fff', fontSize:11, fontWeight:'bold' },
        upperLabel: { show:true, color:'#fff', fontSize:11 },
        breadcrumb: { show:false }, left:'2%', right:'2%', top:'2%', bottom:'2%'
      }]
    };

    // ── GAUGE ─────────────────────────────────────────────────────────
    this.opts['gauge'] = {
      tooltip: { formatter:'{a}: {c}%' },
      series: [{ name:'Bezettingsgraad', type:'gauge',
        startAngle:180, endAngle:0,
        min:0, max:100, radius:'85%', center:['50%','60%'],
        axisLine:{ lineStyle:{ width:18, color:[[.6,'#E10036'],[.8,'#EF8100'],[1,'#02C539']] } },
        pointer:{ itemStyle:{ color:'#1A2B3C' }, length:'75%', width:5 },
        axisTick:{ show:false }, splitLine:{ show:false },
        axisLabel:{ show:false },
        detail:{ valueAnimation:true, fontSize:22, color:'#1A2B3C', offsetCenter:[0,'25%'], formatter:'{value}%' },
        title:{ offsetCenter:[0,'46%'], color:'#566A78', fontSize:11 },
        data:[{ value:78, name:'Bezettingsgraad' }]
      }]
    };
    this.opts['progress'] = {
      tooltip: { trigger:'axis' as const, axisPointer:{ type:'shadow' as const } },
      grid: { left:100, right:48, top:16, bottom:8, containLabel:false },
      xAxis: { type:'value', max:100, axisLabel:{ formatter:'{value}%', color:'#566A78', fontSize:11 }, ...SPLIT },
      yAxis: { type:'category', data:['Bezettingsgraad','Doelrealisatie','Tevredenheid','Doorstroom'], axisLabel:{ color:'#566A78', fontSize:11 }, axisTick:{ show:false }, axisLine:{ show:false } },
      series: [{
        type:'bar', data:[78,84,92,61], barWidth:16, showBackground:true,
        backgroundStyle:{ color:'#EEF2F5', borderRadius:[0,4,4,0] },
        itemStyle:{ color: C[0], borderRadius:[0,4,4,0] },
        label:{ show:true, position:'right', formatter:'{c}%', color:'#566A78', fontSize:11 }
      }]
    };
  }
}
