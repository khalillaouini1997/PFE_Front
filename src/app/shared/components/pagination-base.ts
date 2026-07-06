import { signal } from '@angular/core';

export interface PaginationState {
  maxSize: number;
  bigTotalItems: number;
  bigCurrentPage: number;
  itemsPerPage: number;
}

export function createPaginationState(overrides?: Partial<PaginationState>): PaginationState {
  return {
    maxSize: 5,
    bigTotalItems: 0,
    bigCurrentPage: 1,
    itemsPerPage: 30,
    ...overrides
  };
}

export function pageChanged(event: any, state: PaginationState): void {
  if (event.first !== undefined && event.rows !== undefined) {
    state.bigCurrentPage = (event.first / event.rows) + 1;
    state.itemsPerPage = event.rows;
  }
}
