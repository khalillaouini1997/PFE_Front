/**
 * RFC 7807 Problem Details for HTTP APIs
 * This interface represents the standard error response format
 */
export interface ProblemDetail {
  type?: string;        // A URI reference that identifies the problem type
  title?: string;       // A short, human-readable summary of the problem type
  status: number;       // The HTTP status code
  detail: string;       // A human-readable explanation specific to this occurrence
  instance?: string;    // A URI reference that identifies the specific occurrence
  [key: string]: any;   // Additional properties
}

/**
 * Helper function to check if an error response is a ProblemDetail
 */
export function isProblemDetail(error: any): error is ProblemDetail {
  return error && 
         typeof error === 'object' &&
         typeof error.status === 'number' &&
         typeof error.detail === 'string';
}
