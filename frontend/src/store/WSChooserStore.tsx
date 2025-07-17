import { create } from 'zustand';
const API_URL = '/api';
import { Workspace } from '../types/models';
import { MonitorStore } from './MonitorStore';
import { SettingsStore } from './SettingsStore';

interface WSChooserProps {
  workspaces: Workspace[] | null;
  activeWorkspace: Workspace | null;
  workspaceToDelete: Workspace | null;
  isVisible: boolean;
  WSManagerIsVisible: boolean;
  toggleVisibility: () => void;
  toggleWSMVisibility: () => void;
  loadWorkspaces: () => void;
  setActiveWorkspace: (workspace: Workspace) => void;
  setWorkspaceToDelete: (workspace: Workspace | null) => void;
  deleteWorkspace: () => void;
}

export const WSChooserStore = create<WSChooserProps>((set) => ({
  workspaces: null,
  activeWorkspace: null,
  workspaceToDelete: null,
  isVisible: true,
  WSManagerIsVisible: true,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  toggleWSMVisibility: () =>
    set((state) => ({ WSManagerIsVisible: !state.WSManagerIsVisible })),
  loadWorkspaces: async () => {
    const Monitor = MonitorStore.getState();
    Monitor.setMonitor(true, 'Workspace', null);
    try {
      const res = await fetch(`${API_URL}/workspaces/recent`);
      const workspaces: Workspace[] = await res.json();
      Monitor.setMonitor(false, 'Workspace', null);
      set({ workspaces, isVisible: true, WSManagerIsVisible: true });
    } catch (err) {
      Monitor.setMonitor(false, 'Workspace', String(err));
    }
  },
  setActiveWorkspace: async (workspace) => {
    const Monitor = MonitorStore.getState();
    Monitor.setMonitor(true, 'Workspace', null);
    try {
      await fetch(`${API_URL}/set-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspace),
      });
      Monitor.setMonitor(false, 'Workspace', null);
      SettingsStore.getState().loadSettings();
      set({
        activeWorkspace: workspace,
        isVisible: false,
        WSManagerIsVisible: false,
      });
    } catch (err) {
      Monitor.setMonitor(true, 'Workspace', String(err));
    }
  },
  setWorkspaceToDelete: (workspace) => set({ workspaceToDelete: workspace }),
  deleteWorkspace: async () => {
    const Monitor = MonitorStore.getState();
    Monitor.setMonitor(true, 'Workspace', null);
    const state = WSChooserStore.getState();
    if (!state.workspaceToDelete) return;
    try {
      await fetch(`${API_URL}/workspaces`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.workspaceToDelete),
      });
      Monitor.setMonitor(false, 'Workspace', null);
      set({ workspaceToDelete: null });
      state.loadWorkspaces();
    } catch (err) {
      Monitor.setMonitor(false, 'Workspace', String(err));
    }
  },
}));
