import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FinanceService } from '../finance.service';
import { Investment } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmModal } from '../shared/confirm-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-investments',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, ConfirmModal],
  template: `
    <div class="space-y-6 md:space-y-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Inversiones y Capital</h2>
          <p class="text-xs md:text-sm text-zinc-500 font-medium">Gestión de capital invertido y valor de inventario</p>
        </div>
        <button (click)="showForm.set(true)" class="w-full md:w-auto bg-zinc-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm">
          <mat-icon class="text-sm">add</mat-icon>
          Nueva Inversión
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-zinc-300 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-zinc-50 rounded-xl text-zinc-600">
              <mat-icon class="text-sm">account_balance</mat-icon>
            </div>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inversión Total</span>
          <p class="text-xl md:text-2xl font-black text-zinc-900 mt-1 font-mono tracking-tighter">{{ financeService.totalOutgoings() | currency }}</p>
        </div>

        <div class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-zinc-300 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-zinc-50 rounded-xl text-zinc-600">
              <mat-icon class="text-sm">account_balance</mat-icon>
            </div>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inversión en Capital</span>
          <p class="text-xl md:text-2xl font-black text-zinc-900 mt-1 font-mono tracking-tighter">{{ financeService.totalInvested() | currency }}</p>
        </div>

        <div class="bg-zinc-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-zinc-800 group transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-zinc-800 rounded-xl text-zinc-400">
              <mat-icon class="text-sm">inventory_2</mat-icon>
            </div>
          </div>
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor Inventario</span>
          <p class="text-xl md:text-2xl font-black text-emerald-400 mt-1 font-mono tracking-tighter">{{ financeService.totalInventoryCost() | currency }}</p>
        </div>

        @for (item of financeService.totalInvestedByPerson(); track item.person) {
          <div class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200/60 flex justify-between items-start group hover:border-zinc-300 transition-all">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-zinc-50 rounded-xl text-zinc-600">
                  <mat-icon class="text-sm">person</mat-icon>
                </div>
              </div>
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Capital: {{item.person}}</span>
              <p class="text-xl md:text-2xl font-black text-zinc-900 mt-1 font-mono tracking-tighter">{{ item.total | currency }}</p>
            </div>
            <button (click)="addForPerson(item.person)" class="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
              <mat-icon class="text-sm">add_circle</mat-icon>
            </button>
          </div>
        }
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl border border-zinc-200/60">
            <div class="flex justify-between items-center mb-6 md:mb-8">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 tracking-tight">{{ editingInvestment() ? 'Editar' : 'Nueva' }} Inversión</h3>
              <button (click)="cancel()" class="text-zinc-400 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <form (submit)="saveInvestment()" class="space-y-4 md:space-y-6">
              <div class="space-y-2">
                <label for="invInvestor" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nombre Inversionista</label>
                <input id="invInvestor" [(ngModel)]="formModel.person" name="person" list="investors-list" required 
                       class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
                <datalist id="investors-list">
                  @for (person of financeService.uniquePeople(); track person) {
                    <option [value]="person"></option>
                  }
                </datalist>
              </div>

              <div class="space-y-2">
                <label for="invConcept" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Concepto/Descripción</label>
                <input id="invConcept" [(ngModel)]="formModel.name" name="name" required 
                       class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label for="invCapital" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Capital</label>
                  <input id="invCapital" type="number" [(ngModel)]="formModel.capital" name="capital" required 
                         class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono text-sm md:text-base">
                </div>
                <div class="space-y-2">
                  <label for="invCurrency" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Moneda</label>
                  <input id="invCurrency" [(ngModel)]="formModel.currency" name="currency" placeholder="MN" 
                         class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
                </div>
              </div>

              <div class="space-y-2">
                <label for="invDate" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Fecha</label>
                <input id="invDate" type="date" [ngModel]="formatDate(formModel.date)" (ngModelChange)="formModel.date = parseDate($event)" name="date" required 
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <!-- Investments Table -->
        <div class="space-y-4 md:space-y-6">
          <div class="flex items-center gap-3">
            <div class="h-1 w-12 bg-zinc-900 rounded-full"></div>
            <h3 class="text-[10px] md:text-sm font-black text-zinc-900 uppercase tracking-[0.3em]">Registro de Capital</h3>
          </div>
          <div class="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[400px] md:min-w-full">
                <thead>
                  <tr class="bg-zinc-50 border-b border-zinc-100">
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Descripción</th>
                    @for (person of financeService.uniquePeople(); track person) {
                      <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100 text-right">{{ person }}</th>
                    }
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Moneda</th>
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (inv of financeService.investments(); track inv.id) {
                    <tr class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                      <td class="p-4 md:p-5 font-black text-zinc-900 text-sm tracking-tight border-r border-zinc-100">{{ inv.name }}</td>
                      @for (person of financeService.uniquePeople(); track person) {
                        <td class="p-4 md:p-5 text-right border-r border-zinc-100 font-mono text-sm">
                          @if (inv.person === person) {
                            <span class="font-black text-zinc-900">{{ inv.capital | number:'1.2-2' }}</span>
                          } @else {
                            <span class="text-zinc-200">-</span>
                          }
                        </td>
                      }
                      <td class="p-4 md:p-5 text-zinc-500 border-r border-zinc-100 text-xs font-bold uppercase tracking-widest">{{ inv.currency || 'MN' }}</td>
                      <td class="p-4 md:p-5 text-center">
                        <div class="flex justify-center gap-2">
                          <button (click)="edit(inv)" class="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                            <mat-icon class="text-sm">edit</mat-icon>
                          </button>
                          <button (click)="confirmDelete(inv.id)" class="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                            <mat-icon class="text-sm">delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td [attr.colspan]="financeService.uniquePeople().length + 3" class="p-12 md:p-20 text-center">
                        <mat-icon class="text-zinc-200 scale-[1.5] md:scale-[2] mb-4">account_balance</mat-icon>
                        <p class="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Sin registros de capital</p>
                      </td>
                    </tr>
                  }
                </tbody>
                @if (financeService.investments().length > 0) {
                  <tfoot class="bg-zinc-50/50 font-black">
                    <tr>
                      <td class="p-4 md:p-5 border-r border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-widest">Total</td>
                      @for (person of financeService.uniquePeople(); track person) {
                        <td class="p-4 md:p-5 text-right border-r border-zinc-100 font-mono text-zinc-900 text-sm">
                          {{ getPersonTotal(person) | number:'1.2-2' }}
                        </td>
                      }
                      <td class="p-4 md:p-5 border-r border-zinc-100"></td>
                      <td class="p-4 md:p-5 text-center font-mono text-zinc-900 text-sm">
                        {{ financeService.totalInvested() | currency }}
                      </td>
                    </tr>
                  </tfoot>
                }
              </table>
            </div>
          </div>
        </div>

        <!-- Inventory Cost Breakdown -->
        <div class="space-y-4 md:space-y-6">
          <div class="flex items-center gap-3">
            <div class="h-1 w-12 bg-emerald-500 rounded-full"></div>
            <h3 class="text-[10px] md:text-sm font-black text-zinc-900 uppercase tracking-[0.3em]">Inversión en Inventario</h3>
          </div>
          <div class="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60 overflow-hidden">
            <div class="overflow-x-auto max-h-[400px] md:max-h-[600px] custom-scrollbar">
              <table class="w-full text-left border-collapse min-w-[400px] md:min-w-full">
                <thead class="sticky top-0 bg-zinc-50 z-10">
                  <tr class="border-b border-zinc-100">
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Producto</th>
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Stock</th>
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Costo U.</th>
                    <th class="p-4 md:p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of financeService.inventoryCostByProduct(); track p.name) {
                    <tr class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                      <td class="p-4 md:p-5 text-sm font-black text-zinc-900 tracking-tight">{{ p.name }}</td>
                      <td class="p-4 md:p-5 text-sm text-right font-mono text-zinc-500">{{ p.stock }}</td>
                      <td class="p-4 md:p-5 text-sm text-right font-mono text-zinc-500">{{ p.costPrice | currency }}</td>
                      <td class="p-4 md:p-5 text-sm text-right font-mono font-black text-zinc-900">{{ p.totalCost | currency }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="p-12 md:p-20 text-center">
                        <mat-icon class="text-zinc-200 scale-[1.5] md:scale-[2] mb-4">inventory_2</mat-icon>
                        <p class="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Sin productos</p>
                      </td>
                    </tr>
                  }
                </tbody>
                @if (financeService.inventoryCostByProduct().length > 0) {
                  <tfoot class="bg-emerald-50/30 font-black sticky bottom-0 border-t border-emerald-100">
                    <tr>
                      <td colspan="3" class="p-4 md:p-5 text-right text-[10px] text-emerald-600 uppercase tracking-widest">Total Inventario</td>
                      <td class="p-4 md:p-5 text-right font-mono text-emerald-600 text-base md:text-lg tracking-tighter">
                        {{ financeService.totalInventoryCost() | currency }}
                      </td>
                    </tr>
                  </tfoot>
                }
              </table>
            </div>
          </div>
        </div>
      </div>

      @if (investmentToDelete()) {
        <app-confirm-modal
          title="¿Eliminar inversión?"
          message="Esta acción eliminará el registro de la inversión permanentemente."
          (confirmed)="delete()"
          (cancelled)="investmentToDelete.set(null)"
        />
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e4e4e7;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #d4d4d8;
    }
  `],
})
export class Investments {
  financeService = inject(FinanceService);
  showForm = signal(false);
  editingInvestment = signal<Investment | null>(null);
  investmentToDelete = signal<string | null>(null);
  
  formModel = {
    name: '',
    person: '',
    capital: 0,
    description: '',
    currency: 'MN',
    date: Date.now()
  };

  formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  parseDate(dateStr: string): number {
    return new Date(dateStr).getTime();
  }

  getPersonTotal(person: string) {
    return this.financeService.investments()
      .filter(i => i.person === person)
      .reduce((sum, i) => sum + i.capital, 0);
  }

  addForPerson(person: string) {
    this.cancel();
    this.formModel.person = person;
    this.showForm.set(true);
  }

  edit(inv: Investment) {
    this.editingInvestment.set(inv);
    this.formModel = { ...inv };
    this.showForm.set(true);
  }

  confirmDelete(id: string) {
    this.investmentToDelete.set(id);
  }

  delete() {
    const id = this.investmentToDelete();
    if (id) {
      this.financeService.deleteInvestment(id);
      this.investmentToDelete.set(null);
    }
  }

  cancel() {
    this.showForm.set(false);
    this.editingInvestment.set(null);
    this.formModel = { name: '', person: '', capital: 0, description: '', currency: 'MN', date: Date.now() };
  }

  saveInvestment() {
    if (this.editingInvestment()) {
      this.financeService.updateInvestment({
        ...this.editingInvestment()!,
        ...this.formModel
      });
    } else {
      this.financeService.addInvestment(this.formModel);
    }
    this.cancel();
  }
}
