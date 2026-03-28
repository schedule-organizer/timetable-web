import axios from 'axios'

/** Maps Axios API error bodies to a short user-facing string. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as { message?: string }
    if (typeof data.message === 'string' && data.message.length > 0) {
      return data.message
    }
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}
