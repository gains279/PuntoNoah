import { ChangeDetectionStrategy, Component, inject, signal, computed, ElementRef, ViewChild, effect, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { FinanceService } from '../finance.service';
import { PdfService } from '../pdf.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sale, SaleItem } from '../models';
import * as d3 from 'd3';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="space-y-6 md:space-y-10">
      <!-- Header with Date Filters -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Dashboard de Mercado</h2>
          <p class="text-xs md:text-sm text-zinc-500 font-medium">Análisis de rendimiento y métricas clave</p>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 bg-zinc-50 p-2 rounded-2xl border border-zinc-200/50">
            <div class="flex items-center justify-between gap-2 px-3 py-2 sm:py-0">
              <label for="startDate" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Desde</label>
              <input id="startDate" type="date" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" class="bg-transparent border-none text-sm font-bold text-zinc-800 focus:ring-0 outline-none w-full sm:w-auto">
            </div>
            <div class="hidden sm:block w-px h-6 bg-zinc-200"></div>
            <div class="flex items-center justify-between gap-2 px-3 py-2 sm:py-0">
              <label for="endDate" class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Hasta</label>
              <input id="endDate" type="date" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" class="bg-transparent border-none text-sm font-bold text-zinc-800 focus:ring-0 outline-none w-full sm:w-auto">
            </div>
            <button (click)="resetFilters()" class="p-2 bg-white text-zinc-400 hover:text-zinc-900 rounded-xl shadow-sm border border-zinc-200 transition-all">
              <mat-icon class="text-sm">history</mat-icon>
            </button>
          </div>
          
          <button (click)="exportClosing()" 
                  class="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 font-bold text-sm">
            <mat-icon class="text-sm">picture_as_pdf</mat-icon>
            <span>Exportar Cierre</span>
          </button>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-emerald-200 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <mat-icon class="text-sm">payments</mat-icon>
            </div>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ingresos Totales</span>
          <p class="text-xl font-black text-zinc-900 mt-1 font-mono">{{ totalRevenue() | currency }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-blue-200 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-blue-50 rounded-xl text-blue-600">
              <mat-icon class="text-sm">trending_up</mat-icon>
            </div>
            <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{ grossProfitPct() | number:'1.0-1' }}%</span>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Utilidad Bruta</span>
          <p class="text-xl font-black text-zinc-900 mt-1 font-mono">{{ totalGrossProfit() | currency }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-emerald-200 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200">
              <mat-icon class="text-sm">account_balance_wallet</mat-icon>
            </div>
            <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{{ netProfitPct() | number:'1.0-1' }}%</span>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ganancia Inversores</span>
          <p class="text-xl font-black text-emerald-600 mt-1 font-mono">{{ totalNetProfit() | currency }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-red-200 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-red-50 rounded-xl text-red-600">
              <mat-icon class="text-sm">shopping_bag</mat-icon>
            </div>
            <span class="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full">{{ expensesPct() | number:'1.0-1' }}%</span>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gastos Totales</span>
          <p class="text-xl font-black text-zinc-900 mt-1 font-mono">{{ totalExpenses() | currency }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200/60 group hover:border-amber-200 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-amber-50 rounded-xl text-amber-600">
              <mat-icon class="text-sm">savings</mat-icon>
            </div>
          </div>
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inversión Total</span>
          <p class="text-xl font-black text-zinc-900 mt-1 font-mono">{{ totalInvestmentCombined() | currency }}</p>
        </div>

        <div class="bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-800 group transition-all">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-zinc-800 rounded-xl text-zinc-400">
              <mat-icon class="text-sm">outbox</mat-icon>
            </div>
          </div>
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Salidas Totales</span>
          <p class="text-xl font-black text-white mt-1 font-mono">{{ (totalExpenses() + totalInvested()) | currency }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <!-- Sales Trend Chart -->
        <div class="lg:col-span-2 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 class="text-base md:text-lg font-black text-zinc-900 tracking-tight">Tendencia de Ventas</h3>
              <p class="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-wider">Ingresos diarios en el periodo</p>
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[10px] font-black text-emerald-700 uppercase">En Vivo</span>
              </div>
            </div>
          </div>
          <div #chartContainer class="h-64 md:h-80 w-full overflow-hidden">
            <svg #chartSvg class="w-full h-full"></svg>
          </div>
        </div>

        <!-- Product Performance -->
        <div class="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
          <h3 class="text-base md:text-lg font-black text-zinc-900 tracking-tight mb-6">Top Utilidades</h3>
          <div class="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            @for (item of filteredProductUtilities(); track item.product.id) {
              <div class="group p-4 bg-zinc-50 hover:bg-white hover:shadow-md hover:border-zinc-200 border border-transparent rounded-2xl transition-all duration-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-black text-zinc-900 text-sm tracking-tight">{{item.product.name}}</span>
                  <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {{ (item.netProfit / (totalNetProfit() || 1)) * 100 | number:'1.0-1' }}%
                  </span>
                </div>
                <div class="flex items-end justify-between">
                  <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {{item.totalQuantity}} unidades vendidas
                  </div>
                  <div class="text-right">
                    <span class="block font-black text-zinc-900 font-mono">{{item.netProfit | currency}}</span>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="py-20 text-center">
                <mat-icon class="text-zinc-200 scale-[2]">query_stats</mat-icon>
                <p class="mt-4 text-zinc-400 text-sm font-bold uppercase tracking-widest">Sin datos</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Stock Alerts -->
      <div class="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-200/60">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-base md:text-lg font-black text-zinc-900 tracking-tight">Control de Inventario</h3>
            <p class="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-wider">Alertas de reposición inmediata</p>
          </div>
          <mat-icon class="text-zinc-200 scale-110 md:scale-125">inventory_2</mat-icon>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (p of lowStockProducts(); track p.id) {
            <div class="p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group" 
                 [class.bg-red-50]="p.stock === 0" [class.border-red-100]="p.stock === 0" [class.hover:border-red-200]="p.stock === 0"
                 [class.bg-amber-50]="p.stock > 0" [class.border-amber-100]="p.stock > 0" [class.hover:border-amber-200]="p.stock > 0">
              <div>
                <span class="block font-black text-zinc-900 text-sm tracking-tight mb-1">{{p.name}}</span>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest" [class.text-red-600]="p.stock === 0" [class.text-amber-600]="p.stock > 0">
                    {{ p.stock === 0 ? 'Agotado' : 'Stock: ' + p.stock }}
                  </span>
                </div>
              </div>
              <div class="p-2 rounded-xl" [class.bg-red-100]="p.stock === 0" [class.text-red-600]="p.stock === 0"
                   [class.bg-amber-100]="p.stock > 0" [class.text-amber-600]="p.stock > 0">
                <mat-icon class="text-sm">{{ p.stock === 0 ? 'error' : 'warning' }}</mat-icon>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-12 text-center bg-emerald-50/50 rounded-[2rem] border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center gap-3">
              <div class="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <mat-icon>check_circle</mat-icon>
              </div>
              <span class="font-black text-emerald-800 uppercase tracking-widest text-sm">Inventario Optimizado</span>
            </div>
          }
        </div>
      </div>

      <!-- Detailed Distribution -->
      <div class="bg-zinc-950 text-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <h3 class="text-xl md:text-2xl font-black tracking-tight mb-2">Distribución de Utilidades</h3>
              <p class="text-zinc-500 text-xs md:text-sm font-medium">Desglose acumulado de la utilidad bruta histórica</p>
            </div>
            <div class="text-left lg:text-right">
              <span class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Utilidad Bruta Total</span>
              <p class="text-2xl md:text-4xl font-black text-white tracking-tighter font-mono">{{ allTimeGrossProfit() | currency }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            @for (item of profitDistribution(); track item.label) {
              <div class="space-y-4 group">
                <div class="flex justify-between items-end">
                  <div>
                    <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">{{item.label}}</span>
                    <span class="text-xl font-black text-white font-mono tracking-tight">{{item.value | currency}}</span>
                  </div>
                  <span class="text-xs font-black text-emerald-400 font-mono">{{item.pct | number:'1.0-1'}}%</span>
                </div>
                <div class="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                       [style.width.%]="item.pct"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- All-Time Summary -->
      <div class="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-200/60">
        <div class="flex items-center gap-3 mb-10">
          <div class="h-1 w-12 bg-zinc-900 rounded-full"></div>
          <h3 class="text-[10px] md:text-sm font-black text-zinc-900 uppercase tracking-[0.3em]">Resumen Histórico</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div class="relative pl-4">
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Ventas Totales</span>
            <p class="text-xl md:text-2xl font-black text-zinc-900 font-mono tracking-tighter">{{ allTimeSales() | currency }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-100 rounded-full"></div>
          </div>
          <div class="relative pl-4">
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Inversión Acumulada</span>
            <p class="text-xl md:text-2xl font-black text-zinc-900 font-mono tracking-tighter">{{ allTimeOutgoings() | currency }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-100 rounded-full"></div>
          </div>
          <div class="relative pl-4">
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Inversión Capital</span>
            <p class="text-xl md:text-2xl font-black text-zinc-900 font-mono tracking-tighter">{{ allTimeInvestment() | currency }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-100 rounded-full"></div>
          </div>
          <div class="relative pl-4">
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Gastos Registrados</span>
            <p class="text-xl md:text-2xl font-black text-zinc-900 font-mono tracking-tighter">{{ allTimeExpenses() | currency }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-100 rounded-full"></div>
          </div>
        </div>
      </div>
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
export class Dashboard implements AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('chartSvg') chartSvg!: ElementRef;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  financeService = inject(FinanceService);
  pdfService = inject(PdfService);
  startDate = signal<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  endDate = signal<string>(new Date().toISOString().split('T')[0]);

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        if (this.filteredSales()) {
          setTimeout(() => this.renderChart(), 0);
        }
      });
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.renderChart();
    }
  }

  resetFilters() {
    this.startDate.set('2020-01-01');
    this.endDate.set(new Date().toISOString().split('T')[0]);
  }

  exportClosing() {
    const date = new Date(this.endDate() + 'T12:00:00');
    this.pdfService.exportDailyClosing(date);
  }

  filteredSales = computed(() => {
    const start = new Date(this.startDate() + 'T00:00:00').getTime();
    const end = new Date(this.endDate() + 'T23:59:59').getTime();
    return this.financeService.sales().filter(s => s.date >= start && s.date <= end);
  });

  filteredExpenses = computed(() => {
    const start = new Date(this.startDate() + 'T00:00:00').getTime();
    const end = new Date(this.endDate() + 'T23:59:59').getTime();
    return this.financeService.expenses().filter(e => e.date >= start && e.date <= end);
  });

  filteredInvestments = computed(() => {
    const start = new Date(this.startDate() + 'T00:00:00').getTime();
    const end = new Date(this.endDate() + 'T23:59:59').getTime();
    return this.financeService.investments().filter(i => i.date >= start && i.date <= end);
  });

  filteredProductUtilities = computed(() => {
    const sales = this.filteredSales();
    const products = this.financeService.products();
    
    return products.map(p => {
      const productSaleItems: { item: SaleItem, sale: Sale }[] = [];
      sales.forEach(s => {
        s.items.forEach(item => {
          if (item.productId === p.id) {
            productSaleItems.push({ item, sale: s });
          }
        });
      });

      const totalQuantity = productSaleItems.reduce((sum, si) => sum + si.item.quantity, 0);
      const totalRevenue = productSaleItems.reduce((sum, si) => sum + (si.item.quantity * si.item.sellPrice), 0);
      const totalCost = productSaleItems.reduce((sum, si) => sum + (si.item.quantity * si.item.costPrice), 0);
      const grossProfit = totalRevenue - totalCost;
      
      let recovery = 0;
      let reinvestment = 0;
      let profit = 0;
      let netProfit = 0;
      let others = 0;
      let totalWorkerPayment = 0;

      productSaleItems.forEach(si => {
        const itemGross = si.item.quantity * (si.item.sellPrice - si.item.costPrice);
        recovery += itemGross * (si.sale.recoveryPct / 100);
        reinvestment += itemGross * (si.sale.reinvestmentPct / 100);
        const itemProfit = itemGross * (si.sale.profitPct / 100);
        profit += itemProfit;
        
        const itemNetBase = itemGross * (si.sale.netProfitPct / 100);
        netProfit += (itemNetBase - si.item.workerPayment);
        others += itemGross * (si.sale.othersPct / 100);
        totalWorkerPayment += si.item.workerPayment;
      });

      return {
        product: p,
        totalQuantity,
        totalRevenue,
        grossProfit,
        recovery,
        reinvestment,
        profit,
        netProfit,
        others,
        totalWorkerPayment
      };
    }).filter(item => item.totalQuantity > 0).sort((a, b) => b.netProfit - a.netProfit);
  });

  totalRevenue = computed(() => this.filteredProductUtilities().reduce((sum, item) => sum + item.totalRevenue, 0));
  totalGrossProfit = computed(() => this.filteredProductUtilities().reduce((sum, item) => sum + item.grossProfit, 0));
  totalNetProfit = computed(() => this.filteredProductUtilities().reduce((sum, item) => sum + item.netProfit, 0));
  totalExpenses = computed(() => this.filteredExpenses().reduce((sum, item) => sum + item.amount, 0));
  totalInvested = computed(() => this.filteredInvestments().reduce((sum, item) => sum + item.capital, 0));
  totalInvestmentCombined = computed(() => this.totalInvested() + this.totalExpenses());

  grossProfitPct = computed(() => (this.totalGrossProfit() / (this.totalRevenue() || 1)) * 100);
  netProfitPct = computed(() => (this.totalNetProfit() / (this.totalRevenue() || 1)) * 100);
  expensesPct = computed(() => (this.totalExpenses() / (this.totalRevenue() || 1)) * 100);

  // All-time metrics
  allTimeSales = computed(() => this.financeService.sales().reduce((sum, s) => sum + s.totalAmount, 0));
  allTimeGrossProfit = computed(() => this.financeService.sales().reduce((sum, s) => sum + s.grossProfit, 0));
  allTimeInvestment = computed(() => this.financeService.investments().reduce((sum, i) => sum + i.capital, 0));
  allTimeExpenses = computed(() => this.financeService.expenses().reduce((sum, e) => sum + e.amount, 0));
  allTimeOutgoings = computed(() => this.allTimeInvestment() + this.allTimeExpenses());

  profitDistribution = computed(() => {
    const total = this.allTimeGrossProfit() || 1;
    const settings = this.financeService.settings();
    
    return [
      { label: 'Recuperación', value: total * (settings.recoveryPct / 100), pct: settings.recoveryPct },
      { label: 'Reinversión', value: total * (settings.reinvestmentPct / 100), pct: settings.reinvestmentPct },
      { label: 'Inversor 1 (Mitad)', value: total * ((settings.netProfitPct / 2) / 100), pct: settings.netProfitPct / 2 },
      { label: 'Inversor 2 (Mitad)', value: total * ((settings.netProfitPct / 2) / 100), pct: settings.netProfitPct / 2 },
      { label: 'Trabajador', value: total * (settings.othersPct / 100), pct: settings.othersPct },
    ];
  });

  lowStockProducts = computed(() => 
    this.financeService.products().filter(p => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock)
  );

  renderChart() {
    if (!this.chartSvg) return;

    const element = this.chartSvg.nativeElement;
    d3.select(element).selectAll("*").remove();

    const sales = this.filteredSales();
    if (sales.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = this.chartContainer.nativeElement.offsetWidth - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Aggregate by date
    const dataMap = d3.rollup(sales, v => d3.sum(v, d => d.totalAmount), d => new Date(d.date).setHours(0,0,0,0));
    const data = Array.from(dataMap, ([date, total]) => ({ date: new Date(date), total }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total) as number * 1.1])
      .range([height, 0]);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(() => ""))
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.1);

    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ""))
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.1);

    // Area gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.2);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981").attr("stop-opacity", 0);

    interface ChartData {
      date: Date;
      total: number;
    }

    // Area
    const area = d3.area<ChartData>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.total))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Line
    const line = d3.line<ChartData>()
      .x(d => x(d.date))
      .y(d => y(d.total))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Dots
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.total))
      .attr("r", 4)
      .attr("fill", "white")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b") as (dv: Date | d3.NumberValue, i: number) => string))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick text").attr("class", "text-[10px] font-bold text-zinc-400 uppercase"));

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick text").attr("class", "text-[10px] font-bold text-zinc-400 uppercase"));
  }
}
