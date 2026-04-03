import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FinanceService } from '../finance.service';
import { Product } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmModal } from '../shared/confirm-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-products',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, ConfirmModal],
  template: `
    <div class="space-y-6 md:space-y-10">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div class="flex-1">
          <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Gestión de Productos</h2>
          <p class="text-xs md:text-sm text-zinc-500 font-medium">Control de inventario, costos y precios de venta</p>
        </div>
        
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div class="relative w-full sm:w-64">
            <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</mat-icon>
            <input type="text" 
                   [ngModel]="searchTerm()" 
                   (ngModelChange)="searchTerm.set($event)"
                   placeholder="Buscar producto..." 
                   class="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 text-sm">
          </div>
          
          <button (click)="showForm.set(true)" class="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm">
            <mat-icon class="text-sm">add</mat-icon>
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full shadow-2xl border border-zinc-200/60 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 tracking-tight">{{ editingProduct() ? 'Editar' : 'Nuevo' }} Producto</h3>
              <button (click)="cancel()" class="text-zinc-400 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form (submit)="saveProduct()" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div class="space-y-6">
                <div class="space-y-2">
                  <label for="prodName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
                  <input id="prodName" [(ngModel)]="formModel.name" name="name" required 
                         class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="prodCost" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Precio Costo</label>
                    <input id="prodCost" type="number" [(ngModel)]="formModel.costPrice" name="costPrice" required 
                           class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono">
                  </div>
                  <div class="space-y-2">
                    <label for="prodSell" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Precio Venta</label>
                    <input id="prodSell" type="number" [(ngModel)]="formModel.sellPrice" name="sellPrice" required 
                           class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono">
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="prodStock" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Stock Inicial</label>
                    <input id="prodStock" type="number" [(ngModel)]="formModel.stock" name="stock" required 
                           class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono">
                  </div>
                  <div class="space-y-2">
                    <label for="prodMinStock" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                    <input id="prodMinStock" type="number" [(ngModel)]="formModel.minStock" name="minStock" required 
                           class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono">
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="prodDesc" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea id="prodDesc" [(ngModel)]="formModel.description" name="description" 
                            class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 h-24"></textarea>
                </div>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 block">Foto del Producto</span>
                  <div class="relative group aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center gap-4 transition-all hover:border-zinc-400">
                    @if (formModel.imageUrl) {
                      <img [src]="formModel.imageUrl" alt="Vista previa del producto" class="absolute inset-0 w-full h-full object-cover" referrerpolicy="no-referrer">
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" (click)="formModel.imageUrl = ''" class="p-3 bg-white text-red-600 rounded-full shadow-xl">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    } @else {
                      <mat-icon class="scale-[2] text-zinc-300">add_a_photo</mat-icon>
                      <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Subir Imagen</p>
                      <input type="file" (change)="onFileSelected($event)" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                    }
                  </div>
                </div>

                <div class="flex gap-4 pt-4">
                  <button type="button" (click)="cancel()" 
                          class="flex-1 px-6 py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-600">Cancelar</button>
                  <button type="submit" 
                          class="flex-1 px-6 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold">Guardar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        @for (product of filteredProducts(); track product.id) {
          <div class="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-200/60 hover:shadow-xl hover:border-zinc-300 transition-all group relative overflow-hidden">
            <!-- Stock Status Indicator -->
            <div class="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 blur-[60px] opacity-20 transition-all group-hover:opacity-40"
                 [class.bg-red-500]="product.stock === 0" 
                 [class.bg-amber-500]="product.stock > 0 && product.stock <= product.minStock" 
                 [class.bg-emerald-500]="product.stock > product.minStock"></div>

            <div class="flex gap-4 md:gap-6 mb-6 relative z-10">
              <div class="w-20 h-20 md:w-24 md:h-24 bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100">
                @if (product.imageUrl) {
                  <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-zinc-200">
                    <mat-icon class="scale-110 md:scale-125">inventory_2</mat-icon>
                  </div>
                }
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h4 class="text-lg md:text-xl font-black text-zinc-900 tracking-tight truncate">{{product.name}}</h4>
                  <div class="flex gap-1">
                    <button (click)="edit(product)" class="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                      <mat-icon class="text-sm">edit</mat-icon>
                    </button>
                    <button (click)="confirmDelete(product.id)" class="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                      <mat-icon class="text-sm">delete</mat-icon>
                    </button>
                  </div>
                </div>
                <p class="text-xs text-zinc-400 font-medium line-clamp-2 mt-1">{{product.description || 'Sin descripción adicional'}}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 md:gap-6 py-6 border-y border-zinc-50 relative z-10">
              <div>
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Costo</span>
                <p class="text-xs md:text-sm font-black text-zinc-600 font-mono tracking-tight">{{product.costPrice | currency}}</p>
              </div>
              <div>
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Venta</span>
                <p class="text-xs md:text-sm font-black text-zinc-900 font-mono tracking-tight">{{product.sellPrice | currency}}</p>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Stock</span>
                <p class="text-xs md:text-sm font-black font-mono tracking-tight" 
                   [class.text-red-600]="product.stock === 0" 
                   [class.text-amber-600]="product.stock > 0 && product.stock <= product.minStock" 
                   [class.text-emerald-600]="product.stock > product.minStock">
                  {{product.stock}}
                </p>
              </div>
            </div>
            
            <div class="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Margen Bruto</span>
                <span class="text-base md:text-lg font-black text-emerald-600 font-mono tracking-tighter">{{ (product.sellPrice - product.costPrice) | currency }}</span>
              </div>
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button (click)="openStockAdjustment(product)" 
                        class="flex-1 sm:flex-none p-2 bg-zinc-50 text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-1">
                  <mat-icon class="text-sm">inventory</mat-icon>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Ajustar</span>
                </button>
                <div class="flex-1 sm:flex-none px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-center"
                     [class.bg-red-50]="product.stock === 0" [class.text-red-600]="product.stock === 0"
                     [class.bg-amber-50]="product.stock > 0 && product.stock <= product.minStock" [class.text-amber-600]="product.stock > 0 && product.stock <= product.minStock"
                     [class.bg-emerald-50]="product.stock > product.minStock" [class.text-emerald-600]="product.stock > product.minStock">
                  {{ product.stock === 0 ? 'Agotado' : (product.stock <= product.minStock ? 'Bajo' : 'OK') }}
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-20 md:py-32 text-center bg-white rounded-2xl md:rounded-[3rem] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-4">
            <div class="p-6 bg-zinc-50 text-zinc-200 rounded-full">
              <mat-icon class="scale-150 md:scale-[2]">inventory</mat-icon>
            </div>
            <div>
              <p class="text-zinc-900 font-black tracking-tight text-base md:text-lg">Catálogo Vacío</p>
              <p class="text-zinc-400 text-xs md:text-sm font-medium">Comienza agregando tu primer producto al sistema</p>
            </div>
          </div>
        }
      </div>

      <!-- Stock Adjustment Modal -->
      @if (showStockModal()) {
        <div class="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl border border-zinc-200/60">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 tracking-tight">Ajustar Stock</h3>
              <button (click)="showStockModal.set(false)" class="text-zinc-400 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Producto</p>
              <p class="font-bold text-zinc-900">{{ selectedProductForStock()?.name }}</p>
              <p class="text-xs text-zinc-500 mt-1">Stock actual: <span class="font-mono font-bold">{{ selectedProductForStock()?.stock }}</span></p>
            </div>

            <form (submit)="saveStockAdjustment()" class="space-y-6">
              @if (stockError()) {
                <div class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <mat-icon class="text-sm">error</mat-icon>
                  <p class="text-xs font-bold">{{ stockError() }}</p>
                </div>
              }

              <div class="grid grid-cols-2 gap-4">
                <button type="button" 
                        (click)="stockAdjustmentType.set('entry')"
                        [class.bg-emerald-600]="stockAdjustmentType() === 'entry'"
                        [class.text-white]="stockAdjustmentType() === 'entry'"
                        [class.bg-zinc-50]="stockAdjustmentType() !== 'entry'"
                        [class.text-zinc-400]="stockAdjustmentType() !== 'entry'"
                        class="p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  <mat-icon>add_circle</mat-icon>
                  Entrada
                </button>
                <button type="button" 
                        (click)="stockAdjustmentType.set('exit')"
                        [class.bg-red-600]="stockAdjustmentType() === 'exit'"
                        [class.text-white]="stockAdjustmentType() === 'exit'"
                        [class.bg-zinc-50]="stockAdjustmentType() !== 'exit'"
                        [class.text-zinc-400]="stockAdjustmentType() !== 'exit'"
                        class="p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  <mat-icon>remove_circle</mat-icon>
                  Salida
                </button>
              </div>

              <div class="space-y-2">
                <label for="adjQty" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Cantidad</label>
                <input id="adjQty" type="number" [(ngModel)]="stockAdjustmentQty" name="qty" required min="1"
                       class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900 font-mono">
              </div>

              <div class="space-y-2">
                <label for="adjReason" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Motivo / Razón</label>
                <input id="adjReason" [(ngModel)]="stockAdjustmentReason" name="reason" required placeholder="Ej: Reposición, Merma, etc."
                       class="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900">
              </div>

              <div class="flex gap-4 pt-4">
                <button type="button" (click)="showStockModal.set(false)" 
                        class="flex-1 px-6 py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-600">Cancelar</button>
                <button type="submit" 
                        class="flex-1 px-6 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (productToDelete()) {
        <app-confirm-modal
          title="¿Eliminar producto?"
          message="Esta acción eliminará el producto permanentemente."
          (confirmed)="delete()"
          (cancelled)="productToDelete.set(null)"
        />
      }
    </div>
  `
})
export class Products {
  financeService = inject(FinanceService);
  showForm = signal(false);
  editingProduct = signal<Product | null>(null);
  productToDelete = signal<string | null>(null);
  searchTerm = signal('');
  
  showStockModal = signal(false);
  selectedProductForStock = signal<Product | null>(null);
  stockAdjustmentQty = 1;
  stockAdjustmentType = signal<'entry' | 'exit'>('entry');
  stockAdjustmentReason = '';
  stockError = signal<string | null>(null);

  formModel = {
    name: '',
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 5,
    description: '',
    imageUrl: ''
  };

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.financeService.products().filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.formModel.imageUrl = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  openStockAdjustment(product: Product) {
    this.selectedProductForStock.set(product);
    this.stockAdjustmentQty = 1;
    this.stockAdjustmentType.set('entry');
    this.stockAdjustmentReason = '';
    this.stockError.set(null);
    this.showStockModal.set(true);
  }

  saveStockAdjustment() {
    const product = this.selectedProductForStock();
    if (product) {
      if (this.stockAdjustmentType() === 'exit' && this.stockAdjustmentQty > product.stock) {
        this.stockError.set('No hay suficiente stock para realizar esta salida.');
        return;
      }
      
      const qty = this.stockAdjustmentType() === 'entry' ? this.stockAdjustmentQty : -this.stockAdjustmentQty;
      this.financeService.adjustStock({
        productId: product.id,
        quantity: qty,
        type: this.stockAdjustmentType(),
        reason: this.stockAdjustmentReason
      });
      this.showStockModal.set(false);
      this.stockError.set(null);
    }
  }

  edit(product: Product) {
    this.editingProduct.set(product);
    this.formModel = { 
      ...product, 
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    };
    this.showForm.set(true);
  }

  confirmDelete(id: string) {
    this.productToDelete.set(id);
  }

  delete() {
    const id = this.productToDelete();
    if (id) {
      this.financeService.deleteProduct(id);
      this.productToDelete.set(null);
    }
  }

  cancel() {
    this.showForm.set(false);
    this.editingProduct.set(null);
    this.formModel = { name: '', costPrice: 0, sellPrice: 0, stock: 0, minStock: 5, description: '', imageUrl: '' };
  }

  saveProduct() {
    if (this.editingProduct()) {
      this.financeService.updateProduct({
        ...this.editingProduct()!,
        ...this.formModel
      });
    } else {
      this.financeService.addProduct(this.formModel);
    }
    this.cancel();
  }
}
