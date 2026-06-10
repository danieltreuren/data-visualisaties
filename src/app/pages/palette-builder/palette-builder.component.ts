import { Component, OnInit, ChangeDetectorRef, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { PaletteService } from '../../shared/palette.service';

const AXIS_STYLE = {
  axisLine:  { lineStyle: { color: '#D0DCE4' } },
  axisTick:  { show: false },
  axisLabel: { color: '#566A78', fontSize: 11 },
};
const GRID     = { left: 16, right: 16, top: 16, bottom: 0,  containLabel: true };
const GRID_LEG = { left: 16, right: 16, top: 16, bottom: 40, containLabel: true };
const SPLIT    = { splitLine: { lineStyle: { color: '#EEF2F5', type: 'dashed' as const } } };
const LEGEND   = { bottom: 0, textStyle: { color: '#566A78', fontSize: 11 } };

const MONTHS  = ['Jan','Feb','Mrt','Apr','Mei','Jun'];
const CATS7   = ['Poliklinisch','Klinisch','Spoed','Revalidatie','Dagbeh.','GGZ','Overig'];
const CATS5   = CATS7.slice(0, 5);
const BAR7    = [1240, 870, 540, 320, 290, 180, 120];
const STACK5  = [
  [420,380,510,470,530,490],
  [180,210,160,230,195,215],
  [95,110,88,120,105,98],
  [60,75,55,80,70,65],
  [140,125,155,135,160,145],
];
const LINE4_NAMES = ['2025','2024','2023','2022'];
const LINE4_DATA  = [
  [1240,1380,1520,1290,1650,1430],
  [980,1050,1120,1070,1180,1090],
  [650,720,680,740,770,690],
  [420,450,430,480,510,460],
];
const PIE5_NAMES = ['Ziekenhuiszorg','GGZ','Farmacie','Hulpmiddelen','Overig'];
const PIE5_DATA  = [1240, 540, 320, 290, 180];
const SC3_SEEDS: [number,number][] = [[20,60],[50,45],[80,55]];
const SC3_NAMES  = ['Oncologie','Cardiologie','Orthopedie'];
const AREA3_DATA = [
  [420,380,510,470,530,490],
  [180,210,160,230,195,215],
  [95,110,88,120,105,98],
];
const AREA3_NAMES = ['Poliklinisch','Klinisch','Spoed'];

@Component({
  selector: 'app-palette-builder',
  standalone: true,
  imports: [RouterLink, NgxEchartsDirective],
  template: `
    <div class="page">
      <div class="container">
        <a class="back-link" routerLink="/">← Terug naar overzicht</a>

        <header class="page-header">
          <span class="page-label">Tools</span>
          <h1>Palet Editor</h1>
          <p class="page-sub">
            Stel je eigen kleurenpalet samen en zie direct het effect in het voorbeelddashboard.
            Klik op een kleurvlak om de color picker te openen, of plak een hex-code in het veld eronder.
          </p>
        </header>

        <!-- ── Color pickers ── -->
        <div class="picker-card">
          <div class="picker-header">
            <span class="picker-title">7 categoriekleuren</span>
            <div class="picker-actions">
              <button class="btn-ghost" (click)="reset()">↺ Reset naar actief palet</button>
              <button class="btn-copy" (click)="copyColors()">
                {{ copied ? '✓ Gekopieerd' : 'Kopieer hex-waarden' }}
              </button>
            </div>
          </div>
          <div class="color-row">
            @for (c of colors; track $index) {
              <div class="color-slot">
                <span class="slot-num">{{ $index + 1 }}</span>
                <div class="swatch-wrap">
                  <div class="swatch" [style.background]="c"></div>
                  <input
                    type="color"
                    class="color-native"
                    [value]="c"
                    (input)="onColorInput($index, $event)">
                </div>
                <div class="hex-wrap">
                  <span class="hex-label">HEX</span>
                  <input
                    type="text"
                    class="hex-field"
                    [value]="c"
                    maxlength="7"
                    spellcheck="false"
                    (blur)="onHexChange($index, $event)"
                    (keydown.enter)="onHexChange($index, $event)">
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Dashboard preview ── -->
        <div class="dashboard-section">
          <div class="dashboard-header">
            <h2>Voorbeelddashboard</h2>
            <p class="dashboard-sub">Combinatie van grafiektypen met 3–7 categorieën — wijzig een kleur hierboven om het effect direct te zien.</p>
          </div>

          <!-- Row 1: 2 cols -->
          <div class="dash-row dash-2">
            <div class="chart-card">
              <div class="chart-label">Declaraties per zorgtype — 7 categorieën</div>
              <div echarts [options]="opts['barH7']" class="echart"></div>
            </div>
            <div class="chart-card">
              <div class="chart-label">Declaraties naar type per maand — 5 categorieën</div>
              <div echarts [options]="opts['stack5']" class="echart"></div>
            </div>
          </div>

          <!-- Row 2: 3 cols -->
          <div class="dash-row dash-3">
            <div class="chart-card">
              <div class="chart-label">Patiëntbezoeken per jaar — 4 series</div>
              <div echarts [options]="opts['line4']" class="echart-sm"></div>
            </div>
            <div class="chart-card">
              <div class="chart-label">Declaratietypes — 5 categorieën</div>
              <div echarts [options]="opts['donut5']" class="echart-sm"></div>
            </div>
            <div class="chart-card">
              <div class="chart-label">Behandelduur vs tevredenheid — 3 groepen</div>
              <div echarts [options]="opts['scatter3']" class="echart-sm"></div>
            </div>
          </div>

          <!-- Row 3: area full-width -->
          <div class="dash-row dash-1">
            <div class="chart-card">
              <div class="chart-label">Declaratievolume gestapeld over tijd — 3 categorieën</div>
              <div echarts [options]="opts['area3']" class="echart-area"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { background: #F9FBFD; padding: 2.5rem 0 6rem; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
    .back-link { display: inline-block; color: #009BE5; text-decoration: none; font-size: .88rem; font-weight: 500; margin-bottom: 2rem; transition: color .15s; }
    .back-link:hover { color: #0691D3; }

    /* Header */
    .page-label { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #009BE5; display: block; margin-bottom: .4rem; }
    h1 { font-size: 2.25rem; font-weight: 700; color: #1A2B3C; letter-spacing: -.03em; margin: 0 0 .6rem; }
    .page-sub { font-size: .95rem; color: #566A78; line-height: 1.7; max-width: 680px; margin: 0 0 2rem; }

    /* Picker card */
    .picker-card { background: #fff; border: 1px solid #E1E9EF; border-radius: 14px; padding: 1.5rem 1.75rem; margin-bottom: 2.5rem; }
    .picker-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem; }
    .picker-title { font-size: .9rem; font-weight: 600; color: #1A2B3C; }
    .picker-actions { display: flex; gap: .5rem; }
    .btn-ghost { padding: 6px 14px; border-radius: 7px; border: 1px solid #D0DCE4; background: #fff; font-size: .82rem; color: #566A78; cursor: pointer; font-family: inherit; transition: border-color .15s; }
    .btn-ghost:hover { border-color: #009BE5; color: #009BE5; }
    .btn-copy { padding: 6px 14px; border-radius: 7px; border: none; background: #009BE5; color: #fff; font-size: .82rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: background .15s; }
    .btn-copy:hover { background: #0691D3; }

    /* Color slots */
    .color-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .color-slot { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .slot-num { font-size: 10px; font-weight: 700; letter-spacing: .04em; color: #9FB1BD; }
    .swatch-wrap { position: relative; width: 52px; height: 52px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.13); cursor: pointer; }
    .swatch { width: 100%; height: 100%; }
    .color-native { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; padding: 0; border: none; }
    .hex-wrap { display: flex; align-items: center; border: 1.5px solid #D0DCE4; border-radius: 7px; overflow: hidden; background: #fff; transition: border-color .15s; }
    .hex-wrap:focus-within { border-color: #009BE5; }
    .hex-label { font-size: 9px; font-weight: 700; letter-spacing: .04em; color: #9FB1BD; background: #F5F8FA; padding: 0 5px; border-right: 1px solid #E1E9EF; height: 100%; display: flex; align-items: center; flex-shrink: 0; }
    .hex-field { width: 60px; font-family: 'Courier New', monospace; font-size: 11px; text-align: left; border: none; padding: 5px 6px; color: #1A2B3C; background: #fff; outline: none; }

    /* Dashboard */
    .dashboard-section { }
    .dashboard-header { margin-bottom: 1.5rem; }
    h2 { font-size: 1.25rem; font-weight: 700; color: #1A2B3C; margin: 0 0 .35rem; }
    .dashboard-sub { font-size: .85rem; color: #566A78; margin: 0; }
    .dash-row { display: grid; gap: 1.25rem; margin-bottom: 1.25rem; }
    .dash-2 { grid-template-columns: 1fr 1fr; }
    .dash-3 { grid-template-columns: 1fr 1fr 1fr; }
    .dash-1 { grid-template-columns: 1fr; }
    .chart-card { background: #fff; border: 1px solid #E1E9EF; border-radius: 12px; padding: 1.25rem; }
    .chart-label { font-size: .78rem; font-weight: 500; color: #566A78; margin-bottom: .75rem; }
    .echart      { height: 240px; width: 100%; }
    .echart-sm   { height: 200px; width: 100%; }
    .echart-area { height: 180px; width: 100%; }

    @media (max-width: 800px) {
      .dash-2, .dash-3 { grid-template-columns: 1fr; }
      .color-row { gap: .75rem; }
      .swatch-wrap { width: 44px; height: 44px; }
      .hex-field { width: 56px; font-size: 10px; }
    }
  `]
})
export class PaletteBuilderComponent implements OnInit {
  colors: string[] = [];
  opts: Record<string, EChartsOption> = {};
  copied = false;

  private paletteService = inject(PaletteService);
  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      this.colors = [...this.paletteService.colors()];
      this.buildCharts();
      this.cdRef.detectChanges();
    });
  }

  ngOnInit(): void {}

  reset(): void {
    this.colors = [...this.paletteService.colors()];
    this.buildCharts();
    this.cdRef.detectChanges();
  }

  onColorInput(i: number, event: Event): void {
    this.colors[i] = (event.target as HTMLInputElement).value;
    this.buildCharts();
    this.cdRef.detectChanges();
  }

  onHexChange(i: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      this.colors[i] = val;
      this.buildCharts();
    }
    input.value = this.colors[i];
    this.cdRef.detectChanges();
  }

  async copyColors(): Promise<void> {
    await navigator.clipboard.writeText(this.colors.join(', '));
    this.copied = true;
    this.cdRef.detectChanges();
    setTimeout(() => { this.copied = false; this.cdRef.detectChanges(); }, 2500);
  }

  private buildCharts(): void {
    const C = this.colors;

    // Horizontal bar — 7 categories
    this.opts['barH7'] = {
      tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
      grid: GRID,
      xAxis: { type: 'value', ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      yAxis: { type: 'category', data: [...CATS7].reverse(), ...AXIS_STYLE },
      series: [{ type: 'bar', barMaxWidth: 32,
        data: [...BAR7].reverse().map((v, i, arr) => ({
          value: v, itemStyle: { color: C[arr.length - 1 - i], borderRadius: [0,4,4,0] }
        })),
        label: { show: true, position: 'right', color: '#566A78', fontSize: 10 }
      }]
    };

    // Stacked bar — 5 categories
    this.opts['stack5'] = {
      tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
      legend: LEGEND, grid: GRID_LEG,
      xAxis: { type: 'category', data: MONTHS, ...AXIS_STYLE },
      yAxis: { type: 'value', ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      series: STACK5.map((data, i) => ({
        name: CATS5[i], type: 'bar' as const, stack: 't', data, barMaxWidth: 52,
        itemStyle: { color: C[i], borderRadius: i === STACK5.length - 1 ? [4,4,0,0] : [0,0,0,0] }
      }))
    };

    // Line — 4 series
    this.opts['line4'] = {
      tooltip: { trigger: 'axis' as const },
      legend: LEGEND, grid: GRID_LEG,
      xAxis: { type: 'category', data: MONTHS, ...AXIS_STYLE, boundaryGap: false },
      yAxis: { type: 'value', min: 300, ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      series: LINE4_DATA.map((data, i) => ({
        name: LINE4_NAMES[i], type: 'line' as const, data, smooth: true,
        lineStyle: { color: C[i], width: 2.5 }, itemStyle: { color: C[i] }
      }))
    };

    // Donut — 5 categories
    this.opts['donut5'] = {
      tooltip: { trigger: 'item' as const, formatter: '{b}: {d}%' },
      legend: { bottom: 0, textStyle: { color: '#566A78', fontSize: 10 } },
      series: [{ type: 'pie', radius: ['38%','65%'], center: ['50%','44%'],
        data: PIE5_NAMES.map((name, i) => ({ value: PIE5_DATA[i], name, itemStyle: { color: C[i] } })),
        label: { formatter: '{d}%', color: '#1A2B3C', fontSize: 10 }
      }]
    };

    // Scatter — 3 groups
    this.opts['scatter3'] = {
      tooltip: { trigger: 'item' as const },
      legend: LEGEND, grid: GRID_LEG,
      xAxis: { type: 'value', name: 'Duur (min)', nameTextStyle: { color: '#566A78', fontSize: 10 }, ...AXIS_STYLE, ...SPLIT },
      yAxis: { type: 'value', name: 'Score', nameTextStyle: { color: '#566A78', fontSize: 10 }, ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      series: SC3_NAMES.map((name, gi) => {
        const [bx, by] = SC3_SEEDS[gi];
        return { name, type: 'scatter' as const, symbolSize: 9, itemStyle: { color: C[gi], opacity: 0.82 },
          data: Array.from({ length: 14 }, (_: unknown, i: number) => [
            bx + i * 2 + (Math.sin(i + gi) * 5 | 0),
            by + i * 1.5 + (Math.cos(i + gi) * 8 | 0)
          ])
        };
      })
    };

    // Area stacked — 3 categories
    this.opts['area3'] = {
      tooltip: { trigger: 'axis' as const },
      legend: LEGEND, grid: GRID_LEG,
      xAxis: { type: 'category', data: MONTHS, ...AXIS_STYLE, boundaryGap: false },
      yAxis: { type: 'value', ...SPLIT, axisLabel: { color: '#566A78', fontSize: 11 } },
      series: AREA3_DATA.map((data, i) => ({
        name: AREA3_NAMES[i], type: 'line' as const, stack: 't', smooth: true, data,
        lineStyle: { color: C[i] }, itemStyle: { color: C[i] },
        areaStyle: { color: C[i], opacity: 0.6 }
      }))
    };
  }
}
