import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product, Sale, SaleItem, Investment, Expense, AppSettings, StockMovement } from './models';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private readonly STORAGE_KEY = 'pos_finance_data';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  products = signal<Product[]>([]);
  sales = signal<Sale[]>([]);
  investments = signal<Investment[]>([]);
  expenses = signal<Expense[]>([]);
  stockMovements = signal<StockMovement[]>([]);
  settings = signal<AppSettings>({
    appName: 'FINANZAS PRO',
    recoveryPct: 5,
    reinvestmentPct: 20,
    profitPct: 75,
    netProfitPct: 73,
    othersPct: 2
  });

  constructor() {
    if (this.isBrowser) {
      this.loadFromStorage();
    }
    
    // Save to storage whenever signals change
    effect(() => {
      const data = {
        products: this.products(),
        sales: this.sales(),
        investments: this.investments(),
        expenses: this.expenses(),
        stockMovements: this.stockMovements(),
        settings: this.settings()
      };
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    });
  }

  private loadFromStorage() {
    if (!this.isBrowser) return;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.products) {
          // Migration: Ensure all products have stock
          const migrated = data.products.map((p: Product) => ({
            ...p,
            stock: p.stock !== undefined ? p.stock : 0,
            minStock: p.minStock !== undefined ? p.minStock : 5
          }));
          this.products.set(migrated);
        }
        if (data.sales) this.sales.set(data.sales);
        if (data.investments) {
          // Migration: Ensure all investments have a date
          const migrated = data.investments.map((inv: { date?: number }) => ({
            ...inv,
            date: inv.date || Date.now()
          }));
          this.investments.set(migrated);
        }
        if (data.expenses) this.expenses.set(data.expenses);
        if (data.stockMovements) this.stockMovements.set(data.stockMovements);
        if (data.settings) {
          this.settings.set({
            ...this.settings(),
            ...data.settings
          });
        }
        
        // If products list is empty, seed initial data
        if (this.products().length === 0) {
          this.seedInitialProducts();
        }

        // If investments list is empty, seed initial data
        if (this.investments().length === 0) {
          this.seedInitialInvestments();
        }
      } catch (e) {
        console.error('Error loading from storage', e);
      }
    } else {
      // Seed initial data from image
      this.seedInitialProducts();
    }
  }

  seedInitialProducts() {
    const initial: Omit<Product, 'id'>[] = [
      { name: 'ARROZ PORTO BELLO', costPrice: 700, sellPrice: 800, stock: 98, minStock: 10 },
      { name: 'Azucar 1kg', costPrice: 620, sellPrice: 680, stock: 4, minStock: 5 },
      { name: 'Nectar de Manzana', costPrice: 210, sellPrice: 280, stock: 2, minStock: 5 },
      { name: 'Jugo de caja pequeño', costPrice: 195, sellPrice: 250, stock: 1, minStock: 10 },
      { name: 'Frazada De Piso', costPrice: 300, sellPrice: 350, stock: 2, minStock: 5 },
      { name: 'Pure de Tomate', costPrice: 380, sellPrice: 500, stock: 31, minStock: 10 },
      { name: 'Refresco de Lata', costPrice: 230, sellPrice: 280, stock: 52, minStock: 24 },
      { name: 'Frijol Negro 1Kg', costPrice: 800, sellPrice: 900, stock: 37, minStock: 10 },
      { name: 'Espaguetis ADA 500g', costPrice: 250, sellPrice: 300, stock: 48, minStock: 20 },
      { name: 'Nutella', costPrice: 850, sellPrice: 1000, stock: 24, minStock: 5 },
      { name: 'Cerveza Cristal', costPrice: 292, sellPrice: 350, stock: 58, minStock: 24 },
      { name: 'Cerveza Unlager', costPrice: 213, sellPrice: 260, stock: 129, minStock: 24 },
      { name: 'Gominolas', costPrice: 38, sellPrice: 60, stock: 32, minStock: 10 },
      { name: 'Copa de Chocolate', costPrice: 30, sellPrice: 70, stock: 89, minStock: 20 },
      { name: 'Copa de gelatina', costPrice: 34, sellPrice: 70, stock: 93, minStock: 20 },
      { name: 'Wisky Pequeño', costPrice: 380, sellPrice: 500, stock: 1, minStock: 3 },
      { name: 'Wisky Reserve 7', costPrice: 1400, sellPrice: 1700, stock: 7, minStock: 5 },
      { name: 'Jabon de lavar', costPrice: 220, sellPrice: 280, stock: 11, minStock: 10 },
      { name: 'Pasta de diente', costPrice: 450, sellPrice: 550, stock: 2, minStock: 5 },
      { name: 'Leche Condensada', costPrice: 500, sellPrice: 600, stock: 48, minStock: 10 },
      { name: 'Atun', costPrice: 450, sellPrice: 550, stock: 3, minStock: 10 },
      { name: 'Galletas ShowGOL', costPrice: 165, sellPrice: 230, stock: 2, minStock: 10 },
      { name: 'Galleta de Vaquita', costPrice: 75, sellPrice: 120, stock: 25, minStock: 20 },
      { name: 'Galletas Maria', costPrice: 165, sellPrice: 250, stock: 4, minStock: 10 },
      { name: 'Galletas Marie', costPrice: 165, sellPrice: 250, stock: 6, minStock: 10 },
      { name: 'Papel Sanitario', costPrice: 125, sellPrice: 150, stock: 80, minStock: 20 },
      { name: 'Sazon Goya Amarillo', costPrice: 32, sellPrice: 70, stock: 32, minStock: 10 },
      { name: 'Jugo de caja pequeño Badelly', costPrice: 180, sellPrice: 250, stock: 29, minStock: 10 },
      { name: 'Chupa Chupa', costPrice: 40, sellPrice: 60, stock: 7, minStock: 20 },
      { name: 'Agua 591ml', costPrice: 160, sellPrice: 200, stock: 2, minStock: 12 },
      { name: 'Refresco de bala', costPrice: 700, sellPrice: 800, stock: 4, minStock: 5 },
      { name: 'Cerveza Bucanero', costPrice: 292, sellPrice: 350, stock: 5, minStock: 24 },
      { name: 'Wisky Don señor', costPrice: 1400, sellPrice: 1700, stock: 6, minStock: 3 },
      { name: 'Energizante', costPrice: 225, sellPrice: 300, stock: 86, minStock: 12 },
      { name: 'Atun (440)', costPrice: 440, sellPrice: 550, stock: 4, minStock: 10 },
      { name: 'Princess', costPrice: 260, sellPrice: 350, stock: 7, minStock: 10 },
      { name: 'Naylons', costPrice: 6.5, sellPrice: 10, stock: 100, minStock: 50 },
      { name: 'Papitas', costPrice: 320, sellPrice: 500, stock: 1, minStock: 10 },
      { name: 'Croncantina', costPrice: 200, sellPrice: 260, stock: 29, minStock: 10 },
      { name: 'Cerveza Cristal (960)', costPrice: 310, sellPrice: 350, stock: 960, minStock: 24 },
      { name: 'Golocetas', costPrice: 70, sellPrice: 100, stock: 28, minStock: 10 },
      { name: 'Galleta Chest', costPrice: 120, sellPrice: 180, stock: 10, minStock: 10 },
      { name: 'Wisky Reserve 1450', costPrice: 1450, sellPrice: 1700, stock: 60, minStock: 5 },
      { name: 'Picadillo De jamon 315', costPrice: 315, sellPrice: 360, stock: 90, minStock: 10 },
      { name: 'Vodka Wisky Pequeño', costPrice: 415, sellPrice: 500, stock: 168, minStock: 10 },
      { name: 'Sorbeto 220', costPrice: 220, sellPrice: 300, stock: 30, minStock: 10 }
    ];
    const currentNames = new Set(this.products().map(p => p.name.toLowerCase()));
    const toAdd = initial
      .filter(p => !currentNames.has(p.name.toLowerCase()))
      .map(p => ({ ...p, id: crypto.randomUUID() }));
      
    this.products.update(prev => [...prev, ...toAdd]);
  }

  seedInitialInvestments() {
    const initial: Omit<Investment, 'id'>[] = [
      { name: 'Luces,Neon,Cesped,Cortina Luminica', person: 'H y K', capital: 91800, currency: '180Usd(510)', date: Date.now(), description: '' },
      { name: 'Pintura', person: 'Ronald', capital: 19200, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Camara', person: 'H y K', capital: 27000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Carpintero', person: 'Ronald', capital: 50000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Tomacorrientes', person: 'H y K', capital: 12000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Extras(imp. Platicado)', person: 'H y K', capital: 11700, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Extras(Malta, Refesco)', person: 'Ronald', capital: 6700, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Lona', person: 'Ronald', capital: 25000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Soldadura', person: 'Ronald', capital: 10000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Cajitas electricas', person: 'H y K', capital: 3000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Abrazaderas', person: 'Ronald', capital: 3000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Electricidad', person: 'H y K', capital: 12350, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Extras(Abrazaderas,Tubo)', person: 'H y K', capital: 9700, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Papel Tapiz Marmol', person: 'H y K', capital: 8800, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Pullovers', person: 'H y K', capital: 16200, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Electricidad 2', person: 'H y K', capital: 3300, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Pintor', person: 'Ronald', capital: 7100, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Bridas', person: 'H y K', capital: 2500, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Escoba', person: 'H y K', capital: 1350, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Triciclo (Nevera)', person: 'H y K', capital: 1500, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Cajitas 5v y Micro SD', person: 'Ronald', capital: 26000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Candado,Bridas Regulador de V, Pilas', person: 'Ronald', capital: 20000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Tornillos para la base de TV', person: 'Ronald', capital: 1300, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Impresión IPV', person: 'H y K', capital: 1500, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Cartel de Camara', person: 'H y K', capital: 5200, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Domicilio Equipos Electrodomesticos', person: 'Ronald', capital: 10000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Cubo y cesto', person: 'H y K', capital: 1800, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Protectores de Voltaje', person: 'Ronald', capital: 9000, currency: 'MN', date: Date.now(), description: '' },
      { name: 'Cable', person: 'Ronald', capital: 6250, currency: '50M', date: Date.now(), description: '' }
    ];

    const currentNames = new Set(this.investments().map(i => i.name.toLowerCase()));
    const toAdd = initial
      .filter(i => !currentNames.has(i.name.toLowerCase()))
      .map(i => ({ ...i, id: crypto.randomUUID() }));

    this.investments.update(prev => [...prev, ...toAdd]);
  }

  // Product CRUD
  addProduct(product: Omit<Product, 'id'>) {
    const newProduct = { ...product, id: crypto.randomUUID() };
    this.products.update(p => [...p, newProduct]);
  }

  updateProduct(product: Product) {
    this.products.update(p => p.map(item => item.id === product.id ? product : item));
  }

  deleteProduct(id: string) {
    this.products.update(p => p.filter(item => item.id !== id));
  }

  // Sale CRUD
  addSale(sale: Omit<Sale, 'id' | 'grossProfit' | 'recoveryPct' | 'reinvestmentPct' | 'profitPct' | 'netProfitPct' | 'othersPct'>) {
    const s = this.settings();
    const grossProfit = sale.items.reduce((sum, item) => sum + (item.quantity * (item.sellPrice - item.costPrice)), 0);
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      grossProfit,
      recoveryPct: s.recoveryPct,
      reinvestmentPct: s.reinvestmentPct,
      profitPct: s.profitPct,
      netProfitPct: s.netProfitPct,
      othersPct: s.othersPct
    };
    
    // Update stock
    this.products.update(prev => prev.map(p => {
      const saleItem = sale.items.find(item => item.productId === p.id);
      if (saleItem) {
        return { ...p, stock: p.stock - saleItem.quantity };
      }
      return p;
    }));

    this.sales.update(prev => [...prev, newSale]);
  }

  updateSale(sale: Sale) {
    const oldSale = this.sales().find(s => s.id === sale.id);
    if (!oldSale) return;

    // Revert old stock
    this.products.update(prev => prev.map(p => {
      const oldItem = oldSale.items.find(item => item.productId === p.id);
      let newStock = p.stock;
      if (oldItem) newStock += oldItem.quantity;
      
      const newItem = sale.items.find(item => item.productId === p.id);
      if (newItem) newStock -= newItem.quantity;
      
      return { ...p, stock: newStock };
    }));

    this.sales.update(prev => prev.map(item => item.id === sale.id ? sale : item));
  }

  deleteSale(id: string) {
    const sale = this.sales().find(s => s.id === id);
    if (sale) {
      // Revert stock
      this.products.update(prev => prev.map(p => {
        const item = sale.items.find(si => si.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      }));
    }
    this.sales.update(prev => prev.filter(item => item.id !== id));
  }

  // Investment CRUD
  addInvestment(investment: Omit<Investment, 'id'>) {
    const newInv = { ...investment, id: crypto.randomUUID() };
    this.investments.update(prev => [...prev, newInv]);
  }

  updateInvestment(investment: Investment) {
    this.investments.update(prev => prev.map(item => item.id === investment.id ? investment : item));
  }

  deleteInvestment(id: string) {
    this.investments.update(prev => prev.filter(item => item.id !== id));
  }

  // Expense CRUD
  addExpense(expense: Omit<Expense, 'id'>) {
    const newExp = { ...expense, id: crypto.randomUUID() };
    this.expenses.update(prev => [...prev, newExp]);
  }

  updateExpense(expense: Expense) {
    this.expenses.update(prev => prev.map(item => item.id === expense.id ? expense : item));
  }

  deleteExpense(id: string) {
    this.expenses.update(prev => prev.filter(item => item.id !== id));
  }

  // Stock Movements
  adjustStock(movement: Omit<StockMovement, 'id' | 'date'>) {
    const newMovement: StockMovement = {
      ...movement,
      id: crypto.randomUUID(),
      date: Date.now()
    };
    
    this.products.update(prev => prev.map(p => {
      if (p.id === movement.productId) {
        return { ...p, stock: p.stock + movement.quantity };
      }
      return p;
    }));

    this.stockMovements.update(prev => [...prev, newMovement]);
  }

  // Settings
  updateSettings(settings: AppSettings) {
    this.settings.set(settings);
  }

  resetData() {
    this.products.set([]);
    this.sales.set([]);
    this.investments.set([]);
    this.expenses.set([]);
    this.stockMovements.set([]);
    this.settings.set({
      appName: 'FINANZAS PRO',
      recoveryPct: 5,
      reinvestmentPct: 20,
      profitPct: 75,
      netProfitPct: 73,
      othersPct: 2
    });
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Computed Utilities
  totalInvestedByPerson = computed(() => {
    const map = new Map<string, number>();
    this.investments().forEach(inv => {
      const current = map.get(inv.person) || 0;
      map.set(inv.person, current + inv.capital);
    });
    return Array.from(map.entries()).map(([person, total]) => ({ person, total }));
  });

  totalInvested = computed(() => {
    return this.investments().reduce((sum, inv) => sum + inv.capital, 0);
  });

  totalExpenses = computed(() => {
    return this.expenses().reduce((sum, exp) => sum + exp.amount, 0);
  });

  totalOutgoings = computed(() => {
    return this.totalInvested() + this.totalExpenses();
  });

  uniquePeople = computed(() => {
    const people = new Set<string>();
    this.investments().forEach(inv => people.add(inv.person));
    return Array.from(people).sort();
  });

  totalInventoryCost = computed(() => {
    return this.products().reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  });

  inventoryCostByProduct = computed(() => {
    return this.products()
      .map(p => ({
        name: p.name,
        stock: p.stock,
        costPrice: p.costPrice,
        totalCost: p.stock * p.costPrice
      }))
      .filter(p => p.stock > 0)
      .sort((a, b) => b.totalCost - a.totalCost);
  });

  productUtilities = computed(() => {
    const products = this.products();
    const sales = this.sales();
    
    return products.map(p => {
      // Find all items in all sales that match this product
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
    });
  });
}
