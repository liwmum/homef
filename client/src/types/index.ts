// src/types/index.ts

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T[];
  meta: PaginationMeta;
}