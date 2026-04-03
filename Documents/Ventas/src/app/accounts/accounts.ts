import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FinanceService } from '../finance.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-accounts',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6 md:space-y-10">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div class="flex items-center gap-4 flex-1">
          <div class="p-3 bg-zinc-900 rounded-2xl text-white shadow-lg shadow-zinc-200">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Cuentas y Saldos</h2>
            <p class="text-xs md:text-sm text-zinc-500 font-medium">Control de efectivo y transferencias bancarias</p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <button (click)="showExchangeModal.set(true)" class="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm">
            <mat-icon class="text-sm">swap_horiz</mat-icon>
            Intercambiar Transferencia por Efectivo
          </button>
        </div>
      </div>

      <!-- Account Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        @for (account of financeService.accounts(); track account.id) {
          <div class="bg-white p-8 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-zinc-200/60 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 blur-[80px] opacity-10 transition-all group-hover:opacity-20"
                 [class.bg-emerald-500]="account.id === 'cash'"
                 [class.bg-blue-500]="account.id === 'transfer'"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-4 mb-6">
                <div class="p-4 rounded-2xl"
                     [class.bg-emerald-50]="account.id === 'cash'"
                     [class.bg-blue-50]="account.id === 'transfer'"
                     [class.text-emerald-600]="account.id === 'cash'"
                     [class.text-blue-600]="account.id === 'transfer'">
                  <mat-icon class="scale-125">{{ account.id === 'cash' ? 'payments' : 'account_balance' }}</mat-icon>
                </div>
                <div>
                  <h3 class="text-lg font-black text-zinc-900 uppercase tracking-widest">{{ account.name }}</h3>
                  <p class="text-xs text-zinc-400 font-medium">Saldo disponible actual</p>
                </div>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-4xl md:text-5xl font-black text-zinc-900 font-mono tracking-tighter">{{ account.balance | currency }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Transactions Table -->
      <div class="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-200/60 overflow-hidden">
        <div class="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center">
          <h3 class="text-lg font-black text-zinc-900 tracking-tight">Historial de Movimientos</h3>
          <div class="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <mat-icon class="text-sm">history</mat-icon>
            Últimos 50 movimientos
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-zinc-50/50">
                <th class="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fecha</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cuenta</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Concepto</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-50">
              @for (tx of financeService.accountTransactions(); track tx.id) {
                <tr class="hover:bg-zinc-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <p class="text-xs font-bold text-zinc-900">{{ tx.date | date:'dd/MM/yyyy' }}</p>
                    <p class="text-[10px] text-zinc-400 font-mono">{{ tx.date | date:'HH:mm' }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full"
                           [class.bg-emerald-500]="tx.accountId === 'cash'"
                           [class.bg-blue-500]="tx.accountId === 'transfer'"></div>
                      <span class="text-xs font-bold text-zinc-700">{{ tx.accountId === 'cash' ? 'Efectivo' : 'Transferencia' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-xs font-medium text-zinc-600">{{ tx.reason }}</p>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-sm font-black font-mono tracking-tight"
                          [class.text-emerald-600]="tx.type === 'entry'"
                          [class.text-red-600]="tx.type === 'exit'">
                      {{ tx.type === 'entry' ? '+' : '-' }}{{ tx.amount | currency }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-6 py-20 text-center">
                    <div class="flex flex-col items-center gap-3 text-zinc-300">
                      <mat-icon class="scale-150">history</mat-icon>
                      <p class="text-sm font-bold uppercase tracking-widest">No hay movimientos registrados</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Exchange Modal -->
      @if (showExchangeModal()) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl border border-zinc-200/60">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 tracking-tight">Intercambiar Saldo</h3>
              <button (click)="showExchangeModal.set(false)" class="text-zinc-400 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="mb-8 flex items-center justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div class="text-center flex-1">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Desde</p>
                <div class="flex flex-col items-center gap-1">
                  <mat-icon class="text-blue-600">account_balance</mat-icon>
                  <span class="text-xs font-bold">Transferencia</span>
                </div>
              </div>
              <mat-icon class="text-zinc-300">arrow_forward</mat-icon>
              <div class="text-center flex-1">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Hacia</p>
                <div class="flex flex-col items-center gap-1">
                  <mat-icon class="text-emerald-600">payments</mat-icon>
                  <span class="text-xs font-bold">Efectivo</span>
                </div>
              </div>
            </div>

            <form (submit)="confirmExchange()" class="space-y-6">
              @if (exchangeError()) {
                <div class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <mat-icon class="text-sm">error</mat-icon>
                  <p class="text-xs font-bold">{{ exchangeError() }}</p>
                </div>
              }

              <div class="space-y-2">
                <label for="exAmount" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monto a Intercambiar</label>
                <input id="exAmount" type="number" [(ngModel)]="exchangeAmount" name="amount" required min="1"
                       class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono text-xl">
                <div class="flex justify-between items-center px-1">
                  <p class="text-[10px] text-zinc-400 font-medium">Saldo disponible: {{ (financeService.accounts()[1].balance) | currency }}</p>
                  @if (financeService.settings().exchangeCommissionPct > 0) {
                    <p class="text-[10px] text-red-500 font-bold">Comisión ({{financeService.settings().exchangeCommissionPct}}%): {{ (exchangeAmount * financeService.settings().exchangeCommissionPct / 100) | currency }}</p>
                  }
                </div>
                @if (financeService.settings().exchangeCommissionPct > 0) {
                  <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center mt-2">
                    <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Recibirás en Efectivo:</span>
                    <span class="text-sm font-black text-emerald-700 font-mono">{{ (exchangeAmount - (exchangeAmount * financeService.settings().exchangeCommissionPct / 100)) | currency }}</span>
                  </div>
                }
              </div>

              <div class="space-y-2">
                <label for="exReason" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Motivo (Opcional)</label>
                <input id="exReason" [(ngModel)]="exchangeReason" name="reason" placeholder="Ej: Cambio por efectivo para caja"
                       class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900">
              </div>

              <div class="flex gap-4 pt-4">
                <button type="button" (click)="showExchangeModal.set(false)" 
                        class="flex-1 px-6 py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-600">Cancelar</button>
                <button type="submit" 
                        class="flex-1 px-6 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class Accounts {
  financeService = inject(FinanceService);
  showExchangeModal = signal(false);
  exchangeAmount = 0;
  exchangeReason = '';
  exchangeError = signal<string | null>(null);

  confirmExchange() {
    try {
      this.financeService.exchangeTransferToCash(this.exchangeAmount, this.exchangeReason || undefined);
      this.showExchangeModal.set(false);
      this.exchangeAmount = 0;
      this.exchangeReason = '';
      this.exchangeError.set(null);
    } catch (e: unknown) {
      this.exchangeError.set(e instanceof Error ? e.message : 'Error al realizar el intercambio');
    }
  }
}
