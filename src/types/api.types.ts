// Standard error envelope from backend — always type and handle this shape.
export interface ApiError {
  status: number
  code: string
  message: string
  details: Record<string, unknown>
  timestamp: string
}

// Standard paginated list envelope — always destructure `content`, never treat as plain array.
export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
