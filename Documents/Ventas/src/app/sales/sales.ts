import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FinanceService } from '../finance.service';
import { Sale, SaleItem, PaymentMethod } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ConfirmModal } from '../shared/confirm-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sales',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, CurrencyPipe, DatePipe, ConfirmModal],
  template: `
    <div class="space-y-6 md:space-y-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Operaciones de Ventas</h2>
          <p class="text-xs md:text-sm text-zinc-500 font-medium">Registro de transacciones y gestión de ingresos</p>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div class="relative w-full sm:w-64">
            <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</mat-icon>
            <input type="text" 
                   [ngModel]="salesSearchTerm()" 
                   (ngModelChange)="salesSearchTerm.set($event)"
                   placeholder="Buscar en ventas..." 
                   class="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm">
          </div>
          
          <button (click)="openNewSale()" class="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm">
            <mat-icon class="text-sm">add_shopping_cart</mat-icon>
            Nueva Venta
          </button>
        </div>
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-10 max-w-4xl w-full shadow-2xl border border-zinc-200/60 my-8">
            <div class="flex justify-between items-center mb-6 md:mb-10">
              <div class="space-y-1">
                <h3 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">{{ editingSale() ? 'Editar' : 'Nueva' }} Venta</h3>
                <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Configuración de transacción</p>
              </div>
              <button (click)="cancel()" class="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
              <!-- Left: Add to Cart -->
              <div class="lg:col-span-5 space-y-6 md:space-y-8">
                <div class="space-y-4 md:space-y-6">
                  <div class="space-y-4">
                    <div class="space-y-2">
                      <label for="productSearch" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Buscar Producto</label>
                      <div class="relative">
                        <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</mat-icon>
                        <input id="productSearch" type="text" 
                               [ngModel]="productSearchTerm()" 
                               (ngModelChange)="productSearchTerm.set($event)"
                               placeholder="Nombre del producto..." 
                               class="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm">
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label for="saleProduct" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Seleccionar Producto</label>
                      <select id="saleProduct" [(ngModel)]="cartItem.productId" name="productId" 
                              class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm md:text-base">
                        <option value="">Seleccionar...</option>
                        @for (p of filteredProductsForSale(); track p.id) {
                          <option [value]="p.id" [disabled]="p.stock <= 0">
                            {{p.name}} ({{p.sellPrice | currency}}) - Stock: {{p.stock}}
                          </option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label for="saleQuantity" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Cantidad</label>
                      <input id="saleQuantity" type="number" [(ngModel)]="cartItem.quantity" name="quantity" 
                             class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono text-sm md:text-base">
                    </div>
                    <div class="space-y-2">
                      <label for="saleWorkerPayment" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pago Trab.</label>
                      <input id="saleWorkerPayment" type="number" [(ngModel)]="cartItem.workerPayment" name="workerPayment" 
                             class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono text-sm md:text-base">
                    </div>
                  </div>

                  <button (click)="addToCart()" [disabled]="!cartItem.productId" 
                          class="w-full py-4 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-zinc-200 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs disabled:opacity-50">
                    Agregar al Carrito
                  </button>
                </div>

                <div class="p-4 md:p-6 bg-zinc-950 rounded-2xl md:rounded-[2rem] text-white space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Venta</span>
                    <span class="text-xl md:text-2xl font-black font-mono tracking-tighter">{{ cartTotal() | currency }}</span>
                  </div>
                  <div class="h-px bg-zinc-800"></div>
                  <div class="space-y-2">
                    <label for="saleDate" class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fecha de Venta</label>
                    <input id="saleDate" type="date" [ngModel]="formatDate(saleDate())" (ngModelChange)="saleDate.set(parseDate($event))" 
                           class="w-full bg-transparent border-none p-0 text-zinc-100 font-bold outline-none focus:ring-0 text-sm md:text-base">
                  </div>
                </div>
              </div>

              <!-- Right: Cart & Payment -->
              <div class="lg:col-span-7 space-y-6 md:space-y-8">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h4 class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Resumen del Carrito</h4>
                    <span class="text-xs font-bold text-zinc-500">{{ cart().length }} Items</span>
                  </div>
                  
                  <div class="max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    @for (item of cart(); track $index) {
                      @let p = getProduct(item.productId);
                      <div class="flex justify-between items-center p-4 md:p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                        <div class="space-y-1">
                          <div class="font-black text-zinc-900 tracking-tight text-sm md:text-base">{{p?.name}}</div>
                          <div class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{{item.quantity}} x {{p?.sellPrice | currency}}</div>
                        </div>
                        <div class="flex items-center gap-3 md:gap-4">
                          <span class="font-black text-zinc-900 font-mono text-sm md:text-base">{{ (item.quantity * (p?.sellPrice || 0)) | currency }}</span>
                          <button (click)="removeFromCart($index)" class="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                            <mat-icon class="text-sm">delete_outline</mat-icon>
                          </button>
                        </div>
                      </div>
                    } @empty {
                      <div class="py-8 md:py-12 text-center border-2 border-dashed border-zinc-100 rounded-2xl md:rounded-3xl">
                        <p class="text-zinc-300 font-bold italic text-sm">El carrito está vacío</p>
                      </div>
                    }
                  </div>
                </div>

                <div class="space-y-6 pt-6 border-t border-zinc-100">
                  <div class="space-y-3">
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 block">Método de Pago</span>
                    <div class="grid grid-cols-3 gap-2 md:gap-3">
                      <button (click)="paymentMethod.set('cash')" 
                              [class.bg-zinc-900]="paymentMethod() === 'cash'" [class.text-white]="paymentMethod() === 'cash'"
                              [class.bg-zinc-50]="paymentMethod() !== 'cash'" [class.text-zinc-400]="paymentMethod() !== 'cash'"
                              class="py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-transparent"
                              [class.border-zinc-900]="paymentMethod() === 'cash'">Efectivo</button>
                      <button (click)="paymentMethod.set('transfer')" 
                              [class.bg-zinc-900]="paymentMethod() === 'transfer'" [class.text-white]="paymentMethod() === 'transfer'"
                              [class.bg-zinc-50]="paymentMethod() !== 'transfer'" [class.text-zinc-400]="paymentMethod() !== 'transfer'"
                              class="py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-transparent"
                              [class.border-zinc-900]="paymentMethod() === 'transfer'">Transferencia</button>
                      <button (click)="paymentMethod.set('split')" 
                              [class.bg-zinc-900]="paymentMethod() === 'split'" [class.text-white]="paymentMethod() === 'split'"
                              [class.bg-zinc-50]="paymentMethod() !== 'split'" [class.text-zinc-400]="paymentMethod() !== 'split'"
                              class="py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-transparent"
                              [class.border-zinc-900]="paymentMethod() === 'split'">Dividido</button>
                    </div>
                  </div>

                  @if (paymentMethod() === 'split') {
                    <div class="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div class="space-y-2">
                        <label for="splitCash" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monto Efectivo</label>
                        <input id="splitCash" type="number" [(ngModel)]="cashAmount" name="cashAmount" 
                               class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-bold text-zinc-900 font-mono text-sm md:text-base">
                      </div>
                      <div class="space-y-2">
                        <label for="splitTransfer" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monto Transferencia</label>
                        <input id="splitTransfer" type="number" [(ngModel)]="transferAmount" name="transferAmount" 
                               class="w-full p-3 md:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-bold text-zinc-900 font-mono text-sm md:text-base">
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="flex gap-3 md:gap-4 pt-8 md:pt-12">
              <button type="button" (click)="cancel()" 
                      class="flex-1 px-4 md:px-8 py-4 md:py-5 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-black text-zinc-500 uppercase tracking-widest text-[10px] md:text-xs">Cancelar</button>
              <button (click)="saveSale()" [disabled]="cart().length === 0" 
                      class="flex-[2] px-4 md:px-8 py-4 md:py-5 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 font-black uppercase tracking-widest text-[10px] md:text-xs disabled:opacity-50">
                Finalizar Transacción
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Sales Table -->
      <div class="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-200/60 overflow-hidden">
        <div class="p-4 md:p-8 border-b border-zinc-50 flex justify-between items-center">
          <h3 class="text-base md:text-lg font-black text-zinc-900 tracking-tight">Historial de Ventas</h3>
          <div class="flex gap-2">
            <span class="px-3 py-1 bg-zinc-50 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-full">Recientes</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[700px] md:min-w-full">
            <thead>
              <tr class="bg-zinc-50/50">
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Fecha</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Detalle de Productos</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Método de Pago</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Total</th>
                <th class="p-4 md:p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-50">
              @for (sale of filteredSales(); track sale.id) {
                <tr class="hover:bg-zinc-50/30 transition-colors group">
                  <td class="p-4 md:p-6">
                    <span class="text-sm font-bold text-zinc-600">{{sale.date | date:'dd MMM, yyyy'}}</span>
                  </td>
                  <td class="p-4 md:p-6">
                    <div class="flex flex-wrap gap-2">
                      @for (item of sale.items; track $index) {
                        @let p = getProduct(item.productId);
                        <span class="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-600">
                          {{p?.name}} <span class="text-zinc-400 ml-1">x{{item.quantity}}</span>
                        </span>
                      }
                    </div>
                  </td>
                  <td class="p-4 md:p-6">
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md inline-block w-fit" 
                            [ngClass]="{
                              'bg-emerald-50 text-emerald-600': sale.paymentMethod === 'cash',
                              'bg-blue-50 text-blue-600': sale.paymentMethod === 'transfer',
                              'bg-amber-50 text-amber-600': sale.paymentMethod === 'split'
                            }">
                        {{ sale.paymentMethod === 'cash' ? 'Efectivo' : sale.paymentMethod === 'transfer' ? 'Transferencia' : 'Dividido' }}
                      </span>
                      @if (sale.paymentMethod === 'split') {
                        <span class="text-[9px] font-bold text-zinc-400 tracking-tight">
                          E: {{sale.cashAmount | currency}} • T: {{sale.transferAmount | currency}}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="p-4 md:p-6 text-right">
                    <span class="text-sm font-black text-zinc-900 font-mono tracking-tighter">{{ sale.totalAmount | currency }}</span>
                  </td>
                  <td class="p-4 md:p-6">
                    <div class="flex justify-center gap-2">
                      <button (click)="edit(sale)" class="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                        <mat-icon class="text-sm">edit</mat-icon>
                      </button>
                      <button (click)="confirmDelete(sale.id)" class="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-12 md:p-20 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <mat-icon class="text-zinc-100 scale-[1.5] md:scale-[2] mb-4">receipt_long</mat-icon>
                      <p class="text-zinc-400 font-bold italic text-sm">No hay ventas registradas en el historial</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (saleToDelete()) {
        <app-confirm-modal
          title="¿Eliminar venta?"
          message="Esta acción eliminará el registro de la venta permanentemente."
          (confirmed)="delete()"
          (cancelled)="saleToDelete.set(null)"
        />
      }
    </div>
  `
})
export class Sales {
  financeService = inject(FinanceService);
  showForm = signal(false);
  editingSale = signal<Sale | null>(null);
  saleToDelete = signal<string | null>(null);
  productSearchTerm = signal('');
  salesSearchTerm = signal('');
  
  // Cart State
  cart = signal<SaleItem[]>([]);
  cartItem = {
    productId: '',
    quantity: 1,
    workerPayment: 0
  };

  // Payment State
  paymentMethod = signal<PaymentMethod>('cash');
  cashAmount = 0;
  transferAmount = 0;
  saleDate = signal(Date.now());

  filteredProductsForSale = computed(() => {
    const term = this.productSearchTerm().toLowerCase();
    return this.financeService.products().filter(p => 
      p.name.toLowerCase().includes(term)
    );
  });

  filteredSales = computed(() => {
    const term = this.salesSearchTerm().toLowerCase();
    if (!term) return this.financeService.sales();
    
    return this.financeService.sales().filter(sale => {
      // Search by product names in items
      const hasProduct = sale.items.some(item => {
        const p = this.getProduct(item.productId);
        return p?.name.toLowerCase().includes(term);
      });
      
      // Search by date (simple string check)
      const dateStr = new Date(sale.date).toLocaleDateString().toLowerCase();
      const hasDate = dateStr.includes(term);
      
      return hasProduct || hasDate;
    });
  });

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => {
      const p = this.getProduct(item.productId);
      return sum + (item.quantity * (p?.sellPrice || 0));
    }, 0);
  });

  getProduct(id: string) {
    return this.financeService.products().find(p => p.id === id);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  parseDate(dateStr: string): number {
    return new Date(dateStr).getTime();
  }

  openNewSale() {
    this.cancel();
    this.showForm.set(true);
  }

  addToCart() {
    const p = this.getProduct(this.cartItem.productId);
    if (!p) return;

    if (this.cartItem.quantity > p.stock) {
      alert(`No hay suficiente stock para ${p.name}. Stock disponible: ${p.stock}`);
      return;
    }

    const newItem: SaleItem = {
      productId: p.id,
      quantity: this.cartItem.quantity,
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
      workerPayment: this.cartItem.workerPayment
    };

    this.cart.update(prev => [...prev, newItem]);
    
    // Reset item form
    this.cartItem = {
      productId: '',
      quantity: 1,
      workerPayment: 0
    };
  }

  removeFromCart(index: number) {
    this.cart.update(prev => prev.filter((_, i) => i !== index));
  }

  edit(sale: Sale) {
    this.editingSale.set(sale);
    this.cart.set([...sale.items]);
    this.paymentMethod.set(sale.paymentMethod);
    this.cashAmount = sale.cashAmount;
    this.transferAmount = sale.transferAmount;
    this.saleDate.set(sale.date);
    this.showForm.set(true);
  }

  confirmDelete(id: string) {
    this.saleToDelete.set(id);
  }

  delete() {
    const id = this.saleToDelete();
    if (id) {
      this.financeService.deleteSale(id);
      this.saleToDelete.set(null);
    }
  }

  cancel() {
    this.showForm.set(false);
    this.editingSale.set(null);
    this.cart.set([]);
    this.cartItem = { productId: '', quantity: 1, workerPayment: 0 };
    this.paymentMethod.set('cash');
    this.cashAmount = 0;
    this.transferAmount = 0;
    this.saleDate.set(Date.now());
  }

  saveSale() {
    const total = this.cartTotal();
    let finalCash = 0;
    let finalTransfer = 0;

    if (this.paymentMethod() === 'cash') {
      finalCash = total;
    } else if (this.paymentMethod() === 'transfer') {
      finalTransfer = total;
    } else {
      finalCash = this.cashAmount;
      finalTransfer = this.transferAmount;
    }

    const saleData = {
      items: this.cart(),
      date: this.saleDate(),
      paymentMethod: this.paymentMethod(),
      cashAmount: finalCash,
      transferAmount: finalTransfer,
      totalAmount: total
    };

    if (this.editingSale()) {
      this.financeService.updateSale({
        ...this.editingSale()!,
        ...saleData
      });
    } else {
      this.financeService.addSale(saleData);
    }
    this.cancel();
  }
}
