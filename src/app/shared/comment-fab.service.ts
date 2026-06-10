import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommentFabService {
  readonly isAdding = signal(false);
  readonly pinCount = signal(0);

  toggle(): void { this.isAdding.update(v => !v); }
  cancel(): void { this.isAdding.set(false); }
  setPinCount(n: number): void { this.pinCount.set(n); }
}
