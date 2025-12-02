// Compiler module exports

export { Compiler, compile, compileWithTheme } from './compiler';
export type { CompilerOptions, CompileResult } from './compiler';

export { validate } from './validator';
export type { ValidationResult } from './validator';

export { applyTheme, mergeStyles } from './themeApplier';
export type { ThemeApplierOptions } from './themeApplier';

export { normalizeNodes, resolveNodeReference, parsePortReference } from './nodeNormalizer';
export type { NormalizerOptions } from './nodeNormalizer';

export {
  DiagenError,
  CompileError,
  ValidationError,
  ErrorCodes,
  createWarning,
} from './errors';
export type { SourceLocation, CompileWarning } from './errors';
