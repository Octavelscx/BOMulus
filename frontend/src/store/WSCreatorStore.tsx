import { create } from 'zustand';
const API_URL = '/api';
import { WSChooserStore } from './WSChooserStore';
import { MonitorStore } from './MonitorStore';

interface WSCreatorProps {
  workspaceName: string | null;
  workspacePath: string | null;
  isVisible: boolean;
  toggleVisibility: () => void;
  setWorkspaceName: (name: string) => void;
  chooseDirectory: () => void;
  createWorkspace: () => void;
}

export const WSCreatorStore = create<WSCreatorProps>((set) => ({
  workspaceName: null,
  workspacePath: null,
  isVisible: false,
  toggleVisibility: () => {
    set((state) => ({ isVisible: !state.isVisible }));
    WSChooserStore.getState().toggleVisibility();
  },
  setWorkspaceName: (name: string) => set({ workspaceName: name }),
  chooseDirectory: async () => {
    const path = window.prompt('Workspace directory path');
    if (path) set({ workspacePath: path });
  },
  createWorkspace: async () => {
    const Monitor = MonitorStore.getState();
    Monitor.setMonitor(true, 'Workspace Creator', null);
    const state = WSCreatorStore.getState();
    if (!state.workspaceName || !state.workspacePath)
      return Monitor.setMonitor(
        false,
        'Workspace Creator',
        'Please select a directory and enter a workspace name.',
      );
    try {
      await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: state.workspacePath, name: state.workspaceName }),
      });
      Monitor.setMonitor(false, 'Workspace Creator', null);
      set({ isVisible: false });
      WSChooserStore.getState().loadWorkspaces();
    } catch (err) {
      Monitor.setMonitor(true, 'Workspace Creator', String(err));
    }
  },
}));
