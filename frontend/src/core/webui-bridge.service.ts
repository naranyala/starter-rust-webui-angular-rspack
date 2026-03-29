// WebUI Bridge Service - RPC calls to backend via WebUI bridge
import { Injectable, signal, inject } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { DEFAULT_TIMEOUT_MS } from '../app/constants/app.constants';

export interface BridgeCallStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastCallTime: number | null;
  averageResponseTime: number;
}

@Injectable({ providedIn: 'root' })
export class WebUiBridgeService {
  private readonly api = inject(ApiService);
  private readonly defaultTimeout = DEFAULT_TIMEOUT_MS;

  private readonly stats = signal<BridgeCallStats>({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    lastCallTime: null,
    averageResponseTime: 0,
  });

  // Public readonly signals
  readonly stats$ = this.stats.asReadonly();

  /**
   * Call backend function via WebUI bridge (returns ApiResponse)
   */
  async call<T>(functionName: string, args: unknown[] = []): Promise<ApiResponse<T>> {
    this.updateStats('start');
    const startTime = Date.now();

    try {
      const response = await this.api.call<T>(functionName, args);
      this.updateStats(response.success ? 'success' : 'failure', startTime);
      return response;
    } catch (error) {
      this.updateStats('failure', startTime);
      throw error;
    }
  }

  /**
   * Call backend and throw on error (returns data directly)
   */
  async callOrThrow<T>(functionName: string, args: unknown[] = []): Promise<T> {
    return this.api.callOrThrow<T>(functionName, args);
  }

  /**
   * Call with response event listener (for legacy event-based responses)
   */
  async callWithResponse<T>(functionName: string, args: unknown[] = []): Promise<T> {
    return new Promise((resolve, reject) => {
      const responseEvent = `${functionName}_response`;

      const handler = (event: CustomEvent<T>) => {
        window.removeEventListener(responseEvent, handler as EventListener);
        this.updateStats('success');
        resolve(event.detail);
      };

      window.addEventListener(responseEvent, handler as EventListener);

      this.call(functionName, args).catch(reject);

      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener(responseEvent, handler as EventListener);
        this.updateStats('failure');
        reject(new Error(`Timeout waiting for response: ${functionName}`));
      }, this.defaultTimeout);
    });
  }

  /**
   * Get bridge statistics
   */
  getStats(): BridgeCallStats {
    return this.stats();
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.set({
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      lastCallTime: null,
      averageResponseTime: 0,
    });
  }

  private updateStats(
    status: 'start' | 'success' | 'failure',
    startTime?: number
  ): void {
    if (status === 'start') {
      this.stats.update(s => ({ ...s, totalCalls: s.totalCalls + 1 }));
      return;
    }

    this.stats.update(s => {
      const responseTime = startTime ? Date.now() - startTime : 0;
      const newTotal = s.successfulCalls + s.failedCalls + 1;
      const newAvg = s.totalCalls > 0
        ? (s.averageResponseTime * s.totalCalls + responseTime) / newTotal
        : responseTime;

      return {
        ...s,
        successfulCalls: status === 'success' ? s.successfulCalls + 1 : s.successfulCalls,
        failedCalls: status === 'failure' ? s.failedCalls + 1 : s.failedCalls,
        lastCallTime: Date.now(),
        averageResponseTime: newAvg,
      };
    });
  }
}
