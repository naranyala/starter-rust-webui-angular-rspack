// Shared State Service — Reactive key-value state synced with backend.
// Replaces the shared state portion of the monolithic CommunicationService.
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export type StateChangeHandler = (key: string, value: unknown) => void;
export interface SharedState {
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class SharedStateService {
  private readonly api = inject(ApiService);
  private readonly state = signal<SharedState>({});
  private readonly stateHandlers = new Set<StateChangeHandler>();

  readonly state$ = this.state.asReadonly();
  readonly stateVersion = signal(0);

  constructor() {
    this.setupStateSync();
  }

  /** Get a value from shared state. */
  getState<T>(key: string): T | undefined {
    return this.state()[key] as T;
  }

  /** Set a value in shared state and notify backend. */
  async setState(key: string, value: unknown): Promise<void> {
    this.state.update((s) => ({ ...s, [key]: value }));
    this.stateVersion.update((v) => v + 1);
    await this.api.call('setSharedState', [key, value]).catch(() => {});
    this.stateHandlers.forEach((h) => h(key, value));
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribeState(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  /** Get a snapshot of all shared state. */
  getAllState(): SharedState {
    return { ...this.state() };
  }

  private setupStateSync(): void {
    // Periodically sync state with backend
    setInterval(async () => {
      try {
        const backendState = await this.api.call<SharedState>('getSharedState').catch(() => ({}));
        this.state.update((s) => ({ ...s, ...backendState }));
      } catch {
        // Ignore sync errors
      }
    }, 5000);
  }
}
