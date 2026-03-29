// Shared State Service - Manages application-wide shared state
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface SharedState {
  [key: string]: unknown;
}

export type StateChangeHandler = (key: string, value: unknown) => void;

@Injectable({ providedIn: 'root' })
export class SharedStateService {
  private readonly api = inject(ApiService);

  private readonly state = signal<SharedState>({});
  private readonly version = signal(0);
  private readonly stateHandlers = new Set<StateChangeHandler>();

  // Public readonly signals
  readonly state$ = this.state.asReadonly();
  readonly version$ = this.version.asReadonly();

  constructor() {
    this.setupStateSync();
    this.setupWindowListeners();
  }

  /**
   * Get a value from shared state
   */
  getState<T>(key: string): T | undefined {
    return this.state()[key] as T;
  }

  /**
   * Set a value in shared state
   */
  async setState(key: string, value: unknown): Promise<void> {
    this.state.update(s => ({ ...s, [key]: value }));
    this.version.update(v => v + 1);

    // Notify backend
    await this.api.call('setSharedState', [key, value]).catch(() => {});

    // Notify local subscribers
    this.stateHandlers.forEach(handler => handler(key, value));
  }

  /**
   * Subscribe to state changes
   */
  subscribeState(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  /**
   * Get all shared state
   */
  getAllState(): SharedState {
    return { ...this.state() };
  }

  /**
   * Get state as observable for a specific key
   */
  select<T>(key: string): () => T | undefined {
    return () => this.getState<T>(key);
  }

  private setupStateSync(): void {
    // Periodically sync state with backend
    setInterval(async () => {
      try {
        const backendState = await this.api.call<SharedState>('getSharedState').catch(() => ({}));
        this.state.update(state => ({ ...state, ...backendState }));
      } catch {
        // Ignore sync errors
      }
    }, 5000);
  }

  private setupWindowListeners(): void {
    // Listen for state updates from backend
    window.addEventListener('state-update', ((event: CustomEvent) => {
      const { key, value } = event.detail;
      this.state.update(state => ({ ...state, [key]: value }));
      this.stateHandlers.forEach(handler => handler(key, value));
    }) as EventListener);
  }
}
