// Compiler error types

export interface SourceLocation {
  line: number;
  column: number;
  offset?: number;
}

export class DiagenError extends Error {
  code: string;
  location?: SourceLocation;

  constructor(code: string, message: string, location?: SourceLocation) {
    super(message);
    this.name = 'DiagenError';
    this.code = code;
    this.location = location;
  }
}

export class CompileError extends DiagenError {
  elementId?: string;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    options?: {
      location?: SourceLocation;
      elementId?: string;
      details?: Record<string, unknown>;
    }
  ) {
    super(code, message, options?.location);
    this.name = 'CompileError';
    this.elementId = options?.elementId;
    this.details = options?.details;
  }
}

export class ValidationError extends DiagenError {
  constructor(code: string, message: string, location?: SourceLocation) {
    super(code, message, location);
    this.name = 'ValidationError';
  }
}

// Error codes
export const ErrorCodes = {
  DUPLICATE_ID: 'DIAGEN-002',
  UNDEFINED_NODE_REF: 'DIAGEN-003',
  CIRCULAR_GROUP: 'DIAGEN-004',
  INVALID_ATTRIBUTE: 'DIAGEN-005',
} as const;

// Warning types
export interface CompileWarning {
  code: string;
  message: string;
  location?: SourceLocation;
  elementId?: string;
}

export function createWarning(
  code: string,
  message: string,
  elementId?: string
): CompileWarning {
  return { code, message, elementId };
}
