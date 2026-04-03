import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-zinc-200/60 animate-in fade-in zoom-in duration-300">
        <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
          <mat-icon class="scale-[1.5]">warning_amber</mat-icon>
        </div>
        
        <div class="space-y-2 mb-8">
          <h3 class="text-2xl font-black text-zinc-900 tracking-tight">{{ title() }}</h3>
          <p class="text-zinc-500 font-medium leading-relaxed">{{ message() }}</p>
        </div>
        
        <div class="flex gap-4">
          <button (click)="cancelled.emit()" 
                  class="flex-1 px-6 py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-600 uppercase tracking-widest text-[10px]">
            Cancelar
          </button>
          <button (click)="confirmed.emit()" 
                  class="flex-1 px-6 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold uppercase tracking-widest text-[10px]">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModal {
  title = input('¿Estás seguro?');
  message = input('Esta acción no se puede deshacer.');
  confirmed = output<void>();
  cancelled = output<void>();
}
