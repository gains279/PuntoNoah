import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FinanceService } from '../finance.service';
import { Expense } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ConfirmModal } from '../shared/confirm-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-expenses',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, CurrencyPipe, DatePipe, ConfirmModal],
  template: `
    <div class="space-y-6 md:space-y-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Gastos Operativos</h2>
          <p class="text-xs md:text-sm text-zinc-500 font-medium">Registro y seguimiento de egresos de la empresa</p>
        </div>
        <button (click)="showForm.set(true)" class="w-full md:w-auto bg-zinc-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm">
          <mat-icon class="text-sm">add</mat-icon>
          Registrar Gasto
        </button>
      </div>

      <!-- Summary Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div class="bg-zinc-950 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl shadow-zinc-200 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-red-500 blur-[60px] opacity-20 transition-all group-hover:opacity-40"></div>
          <div class="relative z-10 space-y-2">
            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Gastos Acumulados</span>
            <p class="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter">{{ financeService.totalExpenses() | currency }}</p>
          </div>
        </div>
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl border border-zinc-200/60">
            <div class="flex justify-between items-center mb-6 md:mb-8">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 tracking-tight">{{ editingExpense() ? 'Editar' : 'Nuevo' }} Gasto</h3>
              <button (click)="cancel()" class="text-zinc-300 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form (submit)="saveExpense()" class="space-y-4 md:space-y-6">
              <div class="space-y-2">
                <label for="expDescription" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descripción del Gasto</label>
                <input id="expDescription" [(ngModel)]="formModel.description" name="description" required 
                       class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
              </div>

              <div class="space-y-2">
                <label for="expAmount" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monto</label>
                <input id="expAmount" type="number" [(ngModel)]="formModel.amount" name="amount" required 
                       class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono text-sm md:text-base">
              </div>

              <div class="space-y-2">
                <label for="expDate" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Fecha</label>
                <input id="expDate" type="date" [ngModel]="formatDate(formModel.date)" (ngModelChange)="formModel.date = parseDate($event)" name="date" required 
                       class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
              </div>
              
              <div class="flex gap-3 md:gap-4 pt-4">
                <button type="button" (click)="cancel()" 
                        class="flex-1 px-4 md:px-6 py-3 md:py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-600 text-sm md:text-base">Cancelar</button>
                <button type="submit" 
                        class="flex-1 px-4 md:px-6 py-3 md:py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm md:text-base">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Expenses List -->
      <div class="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-200/60 overflow-hidden">
        <div class="p-4 md:p-8 border-b border-zinc-50 flex justify-between items-center">
          <h3 class="text-base md:text-lg font-black text-zinc-900 tracking-tight">Registro de Egresos</h3>
          <span class="px-3 py-1 bg-zinc-50 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-full">Historial</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[500px] md:min-w-full">
            <thead>
              <tr class="bg-zinc-50/50">
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Fecha</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Concepto / Descripción</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Monto</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-50">
              @for (exp of financeService.expenses(); track exp.id) {
                <tr class="hover:bg-zinc-50/30 transition-colors group">
                  <td class="p-4 md:p-6">
                    <span class="text-sm font-bold text-zinc-600">{{exp.date | date:'dd MMM, yyyy'}}</span>
                  </td>
                  <td class="p-4 md:p-6">
                    <span class="text-sm font-black text-zinc-900 tracking-tight">{{exp.description}}</span>
                  </td>
                  <td class="p-4 md:p-6 text-right">
                    <span class="text-sm font-black text-red-600 font-mono tracking-tighter">{{ exp.amount | currency }}</span>
                  </td>
                  <td class="p-4 md:p-6">
                    <div class="flex justify-center gap-2">
                      <button (click)="edit(exp)" class="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                        <mat-icon class="text-sm">edit</mat-icon>
                      </button>
                      <button (click)="confirmDelete(exp.id)" class="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="p-12 md:p-20 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <mat-icon class="text-zinc-100 scale-[1.5] md:scale-[2] mb-4">payments</mat-icon>
                      <p class="text-zinc-400 font-bold italic text-sm">No hay gastos registrados</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (expenseToDelete()) {
        <app-confirm-modal
          title="¿Eliminar gasto?"
          message="Esta acción eliminará el registro del gasto permanentemente."
          (confirmed)="delete()"
          (cancelled)="expenseToDelete.set(null)"
        />
      }
    </div>
  `
})
export class Expenses {
  financeService = inject(FinanceService);
  showForm = signal(false);
  editingExpense = signal<Expense | null>(null);
  expenseToDelete = signal<string | null>(null);
  
  formModel = {
    description: '',
    amount: 0,
    date: Date.now()
  };

  formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  parseDate(dateStr: string): number {
    return new Date(dateStr).getTime();
  }

  edit(exp: Expense) {
    this.editingExpense.set(exp);
    this.formModel = { ...exp };
    this.showForm.set(true);
  }

  confirmDelete(id: string) {
    this.expenseToDelete.set(id);
  }

  delete() {
    const id = this.expenseToDelete();
    if (id) {
      this.financeService.deleteExpense(id);
      this.expenseToDelete.set(null);
    }
  }

  cancel() {
    this.showForm.set(false);
    this.editingExpense.set(null);
    this.formModel = { description: '', amount: 0, date: Date.now() };
  }

  saveExpense() {
    if (this.editingExpense()) {
      this.financeService.updateExpense({
        ...this.editingExpense()!,
        ...this.formModel
      });
    } else {
      this.financeService.addExpense(this.formModel);
    }
    this.cancel();
  }
}
