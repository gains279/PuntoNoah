import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FinanceService } from '../finance.service';
import { AppSettings } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 md:space-y-10">
      <div class="flex items-center gap-3 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <mat-icon class="text-zinc-400">settings</mat-icon>
        <div>
          <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Configuración de Utilidades</h2>
          <p class="text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-widest">Ajustes del sistema</p>
        </div>
      </div>

      <div class="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-200/60 space-y-6 md:space-y-8">
        <div class="space-y-2">
          <label for="appName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nombre de la Aplicación</label>
          <div class="flex gap-2">
            <input id="appName" type="text" [(ngModel)]="localSettings.appName" 
                   class="flex-1 p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
          </div>
        </div>

        <div class="pt-4 md:pt-6 border-t border-zinc-100">
          <p class="text-zinc-500 text-xs md:text-sm font-medium">Define los porcentajes de distribución de la utilidad bruta obtenida de las ventas.</p>
        </div>
        
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-zinc-50 rounded-2xl md:rounded-3xl border border-zinc-100 gap-4">
            <div>
              <span class="block font-black text-zinc-900 tracking-tight text-sm md:text-base">Recuperación</span>
              <span class="text-[10px] md:text-xs text-zinc-400 font-medium">Fondo para recuperar inversión inicial</span>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <input type="number" [(ngModel)]="localSettings.recoveryPct" class="w-20 p-2 bg-white border border-zinc-200 rounded-xl text-right font-mono font-bold text-zinc-900">
              <span class="font-black text-zinc-400">%</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-zinc-50 rounded-2xl md:rounded-3xl border border-zinc-100 gap-4">
            <div>
              <span class="block font-black text-zinc-900 tracking-tight text-sm md:text-base">Reinversión</span>
              <span class="text-[10px] md:text-xs text-zinc-400 font-medium">Fondo para compra de insumos</span>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <input type="number" [(ngModel)]="localSettings.reinvestmentPct" class="w-20 p-2 bg-white border border-zinc-200 rounded-xl text-right font-mono font-bold text-zinc-900">
              <span class="font-black text-zinc-400">%</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-zinc-50 rounded-2xl md:rounded-3xl border border-zinc-100 gap-4">
            <div>
              <span class="block font-black text-zinc-900 tracking-tight text-sm md:text-base">Inversores</span>
              <span class="text-[10px] md:text-xs text-zinc-400 font-medium">Se divide a la mitad ({{ localSettings.netProfitPct / 2 | number:'1.0-2' }}% c/u)</span>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <input type="number" [(ngModel)]="localSettings.netProfitPct" (ngModelChange)="updateProfitPct()" class="w-20 p-2 bg-white border border-zinc-200 rounded-xl text-right font-mono font-bold text-zinc-900">
              <span class="font-black text-zinc-400">%</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-zinc-50 rounded-2xl md:rounded-3xl border border-zinc-100 gap-4">
            <div>
              <span class="block font-black text-zinc-900 tracking-tight text-sm md:text-base">Trabajador</span>
              <span class="text-[10px] md:text-xs text-zinc-400 font-medium">Porcentaje de ganancia para el trabajador</span>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <input type="number" [(ngModel)]="localSettings.othersPct" (ngModelChange)="updateProfitPct()" class="w-20 p-2 bg-white border border-zinc-200 rounded-xl text-right font-mono font-bold text-zinc-900">
              <span class="font-black text-zinc-400">%</span>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="text-xs md:text-sm font-bold" [class.text-red-500]="totalPct() !== 100" [class.text-emerald-600]="totalPct() === 100">
            Total: <span class="text-lg md:text-xl font-black font-mono">{{totalPct()}}%</span>
            @if (totalPct() !== 100) {
              <span class="ml-2 block md:inline text-[10px] uppercase tracking-widest">(Debe sumar 100%)</span>
            }
          </div>
          <button (click)="save()" [disabled]="totalPct() !== 100" class="w-full md:w-auto px-8 py-3 md:py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-zinc-200">
            Guardar Cambios
          </button>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-red-50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-red-100 space-y-6">
        <div class="flex items-center gap-3 text-red-600">
          <mat-icon>warning</mat-icon>
          <h3 class="text-lg md:text-xl font-black tracking-tight">Zona de Peligro</h3>
        </div>
        <p class="text-red-600/70 text-xs md:text-sm font-medium">Al restaurar la aplicación, se eliminarán todos los productos, ventas, inversiones y gastos de forma permanente. Esta acción no se puede deshacer.</p>
        
        <button (click)="showResetConfirm = true" class="w-full md:w-auto px-6 py-3 md:py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-100">
          <mat-icon>delete_forever</mat-icon>
          Restaurar Aplicación
        </button>

        <div class="pt-6 border-t border-red-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div class="space-y-3">
            <p class="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Productos de Ejemplo</p>
            <button (click)="seedData()" class="w-full px-6 py-3 md:py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-zinc-100">
              <mat-icon class="text-sm">auto_awesome</mat-icon>
              Cargar Iniciales
            </button>
          </div>
          <div class="space-y-3">
            <p class="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Inversiones de Ejemplo</p>
            <button (click)="seedInvestments()" class="w-full px-6 py-3 md:py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-zinc-100">
              <mat-icon class="text-sm">account_balance</mat-icon>
              Cargar Iniciales
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Confirmation Modal -->
      @if (showResetConfirm) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl border border-zinc-200/60">
            <div class="text-red-600 mb-6">
              <mat-icon class="text-4xl md:text-5xl">report_problem</mat-icon>
            </div>
            <h3 class="text-lg md:text-xl font-black text-zinc-900 mb-2 tracking-tight">¿Estás absolutamente seguro?</h3>
            <p class="text-zinc-500 text-xs md:text-sm font-medium mb-8">Esta acción borrará todos los datos registrados. No hay forma de recuperar la información una vez eliminada.</p>
            
            <div class="flex gap-3 md:gap-4">
              <button (click)="showResetConfirm = false" class="flex-1 px-4 md:px-6 py-3 md:py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-600 text-sm md:text-base">
                Cancelar
              </button>
              <button (click)="confirmReset()" class="flex-1 px-4 md:px-6 py-3 md:py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-red-100">
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success Message Toast (Simple) -->
      @if (showSuccessToast) {
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[60] animate-in slide-in-from-bottom-4 duration-300">
          <mat-icon class="text-emerald-400">check_circle</mat-icon>
          <span class="text-xs md:text-sm font-bold">{{ successMessage }}</span>
        </div>
      }
    </div>
  `
})
export class Settings {
  financeService = inject(FinanceService);
  localSettings: AppSettings = { ...this.financeService.settings() };
  
  showResetConfirm = false;
  showSuccessToast = false;
  successMessage = '';

  totalPct() {
    return this.localSettings.recoveryPct + this.localSettings.reinvestmentPct + this.localSettings.netProfitPct + this.localSettings.othersPct;
  }

  updateProfitPct() {
    this.localSettings.profitPct = this.localSettings.netProfitPct + this.localSettings.othersPct;
  }

  save() {
    if (this.totalPct() === 100) {
      this.financeService.updateSettings(this.localSettings);
      this.showToast('Configuración guardada correctamente.');
    }
  }

  confirmReset() {
    this.financeService.resetData();
    this.showResetConfirm = false;
    this.localSettings = { ...this.financeService.settings() };
    this.showToast('La aplicación ha sido restaurada de 0.');
  }

  seedData() {
    this.financeService.seedInitialProducts();
    this.showToast('Productos iniciales cargados correctamente.');
  }

  seedInvestments() {
    this.financeService.seedInitialInvestments();
    this.showToast('Inversiones iniciales cargadas correctamente.');
  }

  private showToast(message: string) {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => this.showSuccessToast = false, 3000);
  }
}
