import { create } from 'zustand';
const API_URL = '/api';
import { Monitor } from '../types/global';
import { WSChooserStore } from './WSChooserStore';
import { PriceCalculationResult } from '../types/models';
import { CompareViewStore } from './CompareViewStore';
import { MonitorStore } from './MonitorStore';


interface CalculatorProps {
  productionQuantity: number;
  calculationResult: PriceCalculationResult | null;
  isVisible: boolean;
  toggleVisibility: () => void;
  setProductionQuantity: (productionQuantity: number, init: boolean) => void;
  getProductionQuantity: () => void;
  reset: () => void;
}

export const CalculatorStore = create<CalculatorProps>((set) => ({
  productionQuantity: 1,
  calculationResult: null,
  isVisible: true,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  setProductionQuantity: async (
    productionQuantity: number,
    init: boolean = false,
  ) => {
    const Monitor = MonitorStore.getState();
    if (isNaN(productionQuantity) || productionQuantity < 0) {
      Monitor.setMonitor(false, 'Calculator', null);
      return set({ productionQuantity: 0 });
    }
    Monitor.setMonitor(true, 'Calculator', null);
    set({ productionQuantity });
    const activeWorkspace = WSChooserStore.getState().activeWorkspace;
    if (!activeWorkspace)
      return Monitor.setMonitor(
        false,
        'Calculator',
        'No active workspace found...',
      );
    try {
      const productionQuantity = CalculatorStore.getState().productionQuantity;
      if (!init) {
        await fetch(`${API_URL}/production-qty`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspace: activeWorkspace, quantity: productionQuantity.toString() }),
        });
      }
      const res = await fetch(`${API_URL}/price-calc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: activeWorkspace, quantity: productionQuantity }),
      });
      const calculationResult: PriceCalculationResult = await res.json();
      Monitor.setMonitor(false, 'Calculator', null);
      set({ calculationResult });
      CompareViewStore.getState().loadComponents();
    } catch (err) {
      Monitor.setMonitor(false, 'Calculator', String(err));
    }
  },
  getProductionQuantity: () => {
    const Monitor = MonitorStore.getState();
    const activeWorkspace = WSChooserStore.getState().activeWorkspace;
    if (!activeWorkspace)
      return Monitor.setMonitor(
        false,
        'Calculator',
        'No active workspace found...',
      );
    let productionQuantity = activeWorkspace.workspace_infos.production_quantity
      ? parseInt(activeWorkspace.workspace_infos.production_quantity, 10)
      : 1;
    if (isNaN(productionQuantity) || productionQuantity <= 0) {
      productionQuantity = 1;
    }
    CalculatorStore.getState().setProductionQuantity(productionQuantity, true);
  },
  reset: () =>
    set({
      productionQuantity: 1,
      calculationResult: null,
      isVisible: true,
    }),
}));
