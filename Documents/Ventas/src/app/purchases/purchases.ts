import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FinanceService } from '../finance.service';
import { Product, PurchaseItem } from '../models';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-8 pb-20">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-zinc-200/60">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <mat-icon>shopping_bag</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-zinc-900 tracking-tight">Compras de Mercancía</h1>
            <p class="text-sm text-zinc-500 font-medium">Abastece tu inventario y registra costos</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="viewMode.set('new')" 
                  [class]="viewMode() === 'new' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                  class="px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2">
            <mat-icon class="text-sm">add_shopping_cart</mat-icon>
            Nueva Compra
          </button>
          <button (click)="viewMode.set('history')" 
                  [class]="viewMode() === 'history' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                  class="px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2">
            <mat-icon class="text-sm">history</mat-icon>
            Historial
          </button>
        </div>
      </div>

      @if (viewMode() === 'new') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Product Selection -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200/60">
              <div class="relative mb-6">
                <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</mat-icon>
                <input type="text" 
                       [(ngModel)]="searchQuery" 
                       placeholder="Buscar producto por nombre..." 
                       class="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (product of filteredProducts(); track product.id) {
                  <button (click)="addToCart(product)" 
                          class="flex items-center gap-4 p-4 bg-zinc-50 hover:bg-emerald-50 border border-zinc-100 hover:border-emerald-200 rounded-2xl transition-all group text-left">
                    <div class="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:border-emerald-200 transition-colors overflow-hidden">
                      @if (product.imageUrl) {
                        <img [src]="product.imageUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer" [alt]="product.name">
                      } @else {
                        <mat-icon>inventory_2</mat-icon>
                      }
                    </div>
                    <div class="flex-1">
                      <span class="block font-bold text-zinc-900 text-sm">{{ product.name }}</span>
                      <div class="flex items-center justify-between mt-1">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stock: {{ product.stock }}</span>
                        <span class="text-xs font-black text-emerald-600">{{ product.costPrice | currency }}</span>
                      </div>
                    </div>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Cart / Summary -->
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200/60 sticky top-24">
              <h3 class="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
                <mat-icon class="text-emerald-500">shopping_cart</mat-icon>
                Detalle de Compra
              </h3>

              <div class="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                @for (item of cart(); track item.productId) {
                  @let product = getProduct(item.productId);
                  <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                      <span class="font-bold text-zinc-900 text-sm">{{ product?.name }}</span>
                      <button (click)="removeFromCart(item.productId)" class="text-zinc-400 hover:text-red-500 transition-colors">
                        <mat-icon class="text-sm">close</mat-icon>
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="space-y-1">
                        <label [for]="'qty-' + item.productId" class="text-[10px] font-bold text-zinc-400 uppercase">Cantidad</label>
                        <input [id]="'qty-' + item.productId" type="number" [(ngModel)]="item.quantity" min="1" class="w-full p-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold">
                      </div>
                      <div class="space-y-1">
                        <label [for]="'cost-' + item.productId" class="text-[10px] font-bold text-zinc-400 uppercase">Costo Unit.</label>
                        <input [id]="'cost-' + item.productId" type="number" [(ngModel)]="item.costPrice" min="0" class="w-full p-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold">
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="py-12 text-center">
                    <mat-icon class="text-zinc-200 scale-[2] mb-4">add_shopping_cart</mat-icon>
                    <p class="text-zinc-400 font-bold text-sm">No hay productos seleccionados</p>
                  </div>
                }
              </div>

              <div class="space-y-4 pt-6 border-t border-zinc-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-zinc-500">Total Compra</span>
                  <span class="text-2xl font-black text-emerald-600 font-mono">{{ cartTotal() | currency }}</span>
                </div>

                <div class="space-y-3">
                  <input type="text" [(ngModel)]="supplier" placeholder="Proveedor (Opcional)" class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium">
                  <textarea [(ngModel)]="description" placeholder="Notas de la compra..." class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium h-20 resize-none"></textarea>
                </div>

                <button (click)="finalizePurchase()" 
                        [disabled]="cart().length === 0"
                        class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-200 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                  <mat-icon>check_circle</mat-icon>
                  REGISTRAR COMPRA
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- History Mode -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200/60 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-zinc-50 border-b border-zinc-100">
                  <th class="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fecha</th>
                  <th class="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Proveedor</th>
                  <th class="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Productos</th>
                  <th class="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                  <th class="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-50">
                @for (purchase of financeService.purchases(); track purchase.id) {
                  <tr class="hover:bg-zinc-50/50 transition-colors">
                    <td class="p-6">
                      <span class="block font-bold text-zinc-900 text-sm">{{ purchase.date | date:'shortDate' }}</span>
                      <span class="text-[10px] text-zinc-400 font-medium">{{ purchase.date | date:'shortTime' }}</span>
                    </td>
                    <td class="p-6">
                      <span class="font-bold text-zinc-600 text-sm">{{ purchase.supplier || 'N/A' }}</span>
                    </td>
                    <td class="p-6">
                      <div class="flex -space-x-2">
                        @for (item of purchase.items.slice(0, 3); track item.productId) {
                          <div class="w-8 h-8 rounded-full bg-white border-2 border-zinc-50 flex items-center justify-center text-[10px] font-bold text-zinc-400 overflow-hidden shadow-sm" [title]="getProduct(item.productId)?.name">
                            @if (getProduct(item.productId)?.imageUrl) {
                              <img [src]="getProduct(item.productId)?.imageUrl" class="w-full h-full object-cover" [alt]="getProduct(item.productId)?.name">
                            } @else {
                              {{ getProduct(item.productId)?.name?.charAt(0) }}
                            }
                          </div>
                        }
                        @if (purchase.items.length > 3) {
                          <div class="w-8 h-8 rounded-full bg-zinc-100 border-2 border-zinc-50 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                            +{{ purchase.items.length - 3 }}
                          </div>
                        }
                      </div>
                    </td>
                    <td class="p-6 text-right">
                      <span class="font-black text-emerald-600 font-mono">{{ purchase.totalAmount | currency }}</span>
                    </td>
                    <td class="p-6">
                      <div class="flex justify-center gap-2">
                        <button (click)="deletePurchase(purchase.id)" class="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <mat-icon class="text-sm">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="p-20 text-center">
                      <mat-icon class="text-zinc-200 scale-[3] mb-6">inventory</mat-icon>
                      <p class="text-zinc-400 font-bold">No hay compras registradas</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Purchases {
  financeService = inject(FinanceService);
  
  viewMode = signal<'new' | 'history'>('new');
  searchQuery = '';
  cart = signal<PurchaseItem[]>([]);
  supplier = '';
  description = '';

  filteredProducts = computed(() => {
    const query = this.searchQuery.toLowerCase();
    return this.financeService.products().filter(p => 
      p.name.toLowerCase().includes(query)
    );
  });

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  });

  getProduct(id: string) {
    return this.financeService.products().find(p => p.id === id);
  }

  addToCart(product: Product) {
    const existing = this.cart().find(item => item.productId === product.id);
    if (existing) {
      this.cart.update(prev => prev.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      this.cart.update(prev => [...prev, {
        productId: product.id,
        quantity: 1,
        costPrice: product.costPrice
      }]);
    }
  }

  removeFromCart(productId: string) {
    this.cart.update(prev => prev.filter(item => item.productId !== productId));
  }

  finalizePurchase() {
    if (this.cart().length === 0) return;

    this.financeService.addPurchase({
      items: [...this.cart()],
      date: Date.now(),
      totalAmount: this.cartTotal(),
      supplier: this.supplier,
      description: this.description
    });

    // Reset
    this.cart.set([]);
    this.supplier = '';
    this.description = '';
    this.viewMode.set('history');
  }

  deletePurchase(id: string) {
    if (confirm('¿Estás seguro de eliminar este registro de compra? El stock se revertirá.')) {
      this.financeService.deletePurchase(id);
    }
  }
}
