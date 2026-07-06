import { Injectable, inject, signal, computed } from '@angular/core';

export interface LoadingState {
  key: string;
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = signal<Map<string, LoadingState>>(new Map());

  readonly isLoading = computed(() => {
    const states = this.loadingStates();
    return Array.from(states.values()).some(state => state.isLoading);
  });

  readonly loadingMessage = computed(() => {
    const states = this.loadingStates();
    const loadingStates = Array.from(states.values()).filter(state => state.isLoading);
    return loadingStates.length > 0 ? loadingStates[0].message : 'Loading...';
  });

  setLoading(key: string, isLoading: boolean, message?: string) {
    this.loadingStates.update(states => {
      const newStates = new Map(states);
      if (isLoading) {
        newStates.set(key, { key, isLoading, message });
      } else {
        newStates.delete(key);
      }
      return newStates;
    });
  }

  getLoadingState(key: string): LoadingState | undefined {
    return this.loadingStates().get(key);
  }

  clearAll() {
    this.loadingStates.set(new Map());
  }
}
