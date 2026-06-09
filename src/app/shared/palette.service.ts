import { Injectable, signal, computed } from '@angular/core';

export const PALETTES = [
  {
    name: 'Standaard',
    colors: ['#2C7BB6','#E07B00','#7B61E0','#00897B','#F5A623','#D63D6E','#566A78'],
  },
  {
    name: 'Okabe-Ito',
    colors: ['#0072B2','#D55E00','#009E73','#CC79A7','#B07D00','#7C3FA0','#1E6878'],
  },
  {
    name: 'Hoog contrast',
    colors: ['#1168B0','#C0350A','#1B7A4A','#8B1D8B','#AE6500','#B31360','#1A6478'],
  },
] as const;

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private readonly _index = signal<number>(+(localStorage.getItem('palette-index') ?? '0'));

  readonly index = this._index.asReadonly();
  readonly palettes = PALETTES;
  readonly colors = computed(() => [...PALETTES[this._index()].colors]);

  setIndex(i: number): void {
    this._index.set(i);
    localStorage.setItem('palette-index', String(i));
  }
}
