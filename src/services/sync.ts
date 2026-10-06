/**
 * SAATHI Offline-First & Sync Management Service
 * Handles offline detection, simulated hackathon toggles,
 * and synchronized storage for game sessions and patient logs.
 */

export type SyncStatus = 'connected' | 'offline' | 'syncing' | 'synced';

type StatusListener = (status: SyncStatus, pendingCount: number) => void;

class SyncService {
  private status: SyncStatus = 'connected';
  private simulatedOffline = false;
  private listeners: Set<StatusListener> = new Set();
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const isOnline = navigator.onLine;
      const savedSimulated = localStorage.getItem('saathi_simulated_offline');
      if (savedSimulated === 'true') {
        this.simulatedOffline = true;
        this.status = 'offline';
      } else {
        this.status = isOnline ? 'connected' : 'offline';
      }

      window.addEventListener('online', () => this.handleNativeOnline());
      window.addEventListener('offline', () => this.handleNativeOffline());
    }
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public isOffline(): boolean {
    return this.status === 'offline';
  }

  public isSimulatedOffline(): boolean {
    return this.simulatedOffline;
  }

  public getPendingSyncCount(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const pending = localStorage.getItem('saathi_pending_sync_count');
      return pending ? parseInt(pending, 10) : 0;
    } catch {
      return 0;
    }
  }

  public incrementPendingSync(): void {
    const current = this.getPendingSyncCount();
    const next = current + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem('saathi_pending_sync_count', String(next));
    }
    this.notify();
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.getPendingSyncCount());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const count = this.getPendingSyncCount();
    this.listeners.forEach((fn) => fn(this.status, count));
  }

  private handleNativeOffline(): void {
    if (!this.simulatedOffline) {
      this.status = 'offline';
      this.notify();
    }
  }

  private handleNativeOnline(): void {
    if (!this.simulatedOffline) {
      this.triggerSync();
    }
  }

  /**
   * Offline simulation control: Test disconnect behavior without disabling device WiFi
   */
  public setSimulatedOffline(offline: boolean): void {
    this.simulatedOffline = offline;
    if (typeof window !== 'undefined') {
      localStorage.setItem('saathi_simulated_offline', String(offline));
    }

    if (offline) {
      this.status = 'offline';
      this.notify();
    } else {
      // Transitioning back to online -> trigger simulated sync
      this.triggerSync();
    }
  }

  public triggerSync(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);

    this.status = 'syncing';
    this.notify();

    // Simulate network round-trip syncing of local game sessions to cloud
    this.syncTimer = setTimeout(() => {
      // Clear pending queue count
      if (typeof window !== 'undefined') {
        localStorage.setItem('saathi_pending_sync_count', '0');
      }

      this.status = 'synced';
      this.notify();

      // Transition to connected after showing "Synced" feedback
      this.syncTimer = setTimeout(() => {
        this.status = 'connected';
        this.notify();
      }, 2500);
    }, 1800);
  }
}

export const syncService = new SyncService();
