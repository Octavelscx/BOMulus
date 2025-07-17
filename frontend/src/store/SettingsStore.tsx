import { create } from 'zustand';
const API_URL = '/api';
import { APIKeys } from '../types/models';
import { MonitorStore } from './MonitorStore';


interface SettingsProps {
  apiKeys: APIKeys | null;
  isVisible: boolean;
  analyzeSaveState: boolean;
  analysisRefreshDays: number;
  toggleVisibility: () => void;
  loadSettings: () => void;
}

export const SettingsStore = create<SettingsProps>((set) => ({
  apiKeys: null,
  isVisible: false,
  analyzeSaveState: false,
  analysisRefreshDays: 0,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  loadSettings: async () => {
    const Monitor = MonitorStore.getState();
    Monitor.setMonitor(true, 'Setting Panel', null);
    try {
      const keysRes = await fetch(`${API_URL}/api-keys`);
      const apiKeys: APIKeys = await keysRes.json();
      const analyzeRes = await fetch(`${API_URL}/analyze-save-state`);
      const analyzeSaveState: boolean = await analyzeRes.json();
      const daysRes = await fetch(`${API_URL}/refresh-days`);
      const daysData = await daysRes.json();
      const analysisRefreshDays: number = daysData.days;
      Monitor.setMonitor(false, 'Setting Panel', null);
      set({ apiKeys, analyzeSaveState, analysisRefreshDays });
    } catch (err) {
      Monitor.setMonitor(false, 'Setting Panel', String(err));
    }
  },
}));
