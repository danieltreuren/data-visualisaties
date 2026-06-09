import { Injectable, signal, computed } from '@angular/core';

export interface SwatchMeta { name: string; role: string; }

export interface PaletteDef {
  name: string;
  description: string;
  wcagNote: string;
  colors: string[];
  swatches: SwatchMeta[];
}

export const PALETTES: PaletteDef[] = [
  {
    name: 'Standaard',
    description: 'Standaard Topicus categorisch palet. De merkkleur (#009BE5) is bewust niet opgenomen — die zit al in navigatie, knoppen en links. Door merk- en datakleuren te scheiden, ziet de gebruiker direct wat interface is en wat data.',
    wcagNote: 'Aandachtspunt: #F5A623 (goud) haalt formeel geen 3:1 contrast op wit — gebruik dit als ondersteunende vijfde kleur, niet als primaire encoding. Alle overige kleuren voldoen aan WCAG 3:1 voor grafische elementen.',
    colors: ['#2C7BB6','#E07B00','#7B61E0','#00897B','#F5A623','#D63D6E','#566A78'],
    swatches: [
      { name: 'Datablauw', role: 'Data-primair · ≠ merkkleur #009BE5' },
      { name: 'Amber',     role: 'Warm · CB-veilig naast blauw' },
      { name: 'Paars',     role: 'Onderscheidend' },
      { name: 'Teal',      role: 'Koel-groen · deuteranopie-veilig' },
      { name: 'Goud',      role: 'Geel-warm · ondersteunend' },
      { name: 'Roze',      role: 'Magenta-richting · CB-veilig' },
      { name: 'Leisteen',  role: 'Neutraal · DS Grey 900' },
    ],
  },
  {
    name: 'Okabe-Ito',
    description: 'Wetenschappelijk gevalideerd palet — standaard in Nature, Science en BMJ. Elk kleurenpaar is onderscheidbaar voor deuteranopen, protanopen én tritanopen. Amber is verduisterd ten opzichte van het origineel (#E69F00) voor WCAG-compliance.',
    wcagNote: 'Alle zeven kleuren halen minimaal 3:1 contrast op wit. Mauve (#CC79A7) zit op ~3.1:1 — net boven de grens voor grafische elementen (WCAG 1.4.11). Aanbevolen voor medische en wetenschappelijke contexten.',
    colors: ['#0072B2','#D55E00','#009E73','#CC79A7','#B07D00','#7C3FA0','#1E6878'],
    swatches: [
      { name: 'Blauw',      role: 'Okabe-Ito primair · ~5.7:1 op wit' },
      { name: 'Vermiljoen', role: 'Oranje-rood · deuteranopie-veilig' },
      { name: 'Zeegroen',   role: 'Verschilt van blauw bij rood-groen blindheid' },
      { name: 'Mauve',      role: 'Blauw-roze · ~3.1:1 — net voldoend' },
      { name: 'Amber',      role: 'Verduisterd van origineel E69F00 · ~3.7:1' },
      { name: 'Violet',     role: 'Hoge zichtbaarheid · ~7.0:1' },
      { name: 'Petrol',     role: 'Blauwgroen · onderscheidbaar van puur blauw' },
    ],
  },
  {
    name: 'Hoog contrast',
    description: 'Maximale visuele onderscheiding door grote spreiding in tint én helderheid. IBM Carbon-geïnspireerd. Elk kleurenpaar heeft minimaal ~1.8:1 onderlinge contrastverhouding. Ideaal voor drukke dashboards of kleine grafische elementen.',
    wcagNote: 'Alle kleuren >3:1 op wit, de meeste >4.5:1 (AA voor tekst). Paars (#8B1D8B) heeft het hoogste contrast: ~7.6:1 — geschikt voor labels op witte achtergrond.',
    colors: ['#1168B0','#C0350A','#1B7A4A','#8B1D8B','#AE6500','#B31360','#1A6478'],
    swatches: [
      { name: 'Koningsblauw', role: 'Primair · ~5.9:1' },
      { name: 'Oranjerood',   role: 'Sterk warm contrast · ~5.4:1' },
      { name: 'Donkergroen',  role: 'Verzadigd groen · ~4.8:1' },
      { name: 'Paars',        role: 'Maximaal contrast · ~7.6:1' },
      { name: 'Donkergoud',   role: 'Warm amber · ~4.6:1' },
      { name: 'Framboos',     role: 'Koel rood · ~6.5:1' },
      { name: 'Donkerpetrol', role: 'Blauwgroen · ~6.9:1' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private readonly _index = signal<number>(+(localStorage.getItem('palette-index') ?? '0'));

  readonly index = this._index.asReadonly();
  readonly palettes = PALETTES;
  readonly colors = computed(() => PALETTES[this._index()].colors);
  readonly activePalette = computed(() => PALETTES[this._index()]);

  setIndex(i: number): void {
    this._index.set(i);
    localStorage.setItem('palette-index', String(i));
  }
}
