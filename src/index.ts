// =============================================================================
// Diagen - Code-driven diagram and infographic generator
// =============================================================================

// -----------------------------------------------------------------------------
// High-level Pipeline API (recommended)
// -----------------------------------------------------------------------------
export {
  // Main functions
  compileDsl,
  parse,
  toSvg,
  dslToSvg,
  createDiagram,
  // Builder API
  Diagen,
} from './pipeline';
export type { PipelineOptions, CompiledDiagram, DiagramDefinition } from './pipeline';

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------
export { parse as parseDsl } from './parser';
export type { ParseResult, ParseError } from './parser';

// -----------------------------------------------------------------------------
// Compiler
// -----------------------------------------------------------------------------
export {
  Compiler,
  compile,
  compileWithTheme,
  validate,
  applyTheme,
  normalizeNodes,
} from './compiler';
export type {
  CompilerOptions,
  CompileResult,
  ValidationResult,
  ThemeApplierOptions,
  CompileWarning,
  SourceLocation,
} from './compiler';

// -----------------------------------------------------------------------------
// Core Model
// -----------------------------------------------------------------------------
export { DiagramModel } from './core';

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------
export { ElkLayoutAdapter, elkAdapter } from './layout';
export type { LayoutOptions } from './layout';

// -----------------------------------------------------------------------------
// Renderer (React)
// -----------------------------------------------------------------------------
export { DiagramRenderer } from './renderer';
export type { DiagramRendererProps } from './renderer';

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------
export { exportToSvg, downloadSvg, generateSvg } from './export';
export type { SvgExportOptions } from './export';

// -----------------------------------------------------------------------------
// Themes
// -----------------------------------------------------------------------------
export {
  themes,
  getTheme,
  applyThemeToNode,
  applyThemeToEdge,
  createTheme,
  professionalTheme,
  modernTheme,
  minimalTheme,
} from './themes';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type {
  // Style types
  Gradient,
  Shadow,
  NodeStyle,
  EdgeStyle,
  TextStyle,
  // Node types
  NodeShape,
  PortPosition,
  Port,
  DiagramNode,
  // Edge types
  ArrowType,
  DiagramEdge,
  // Group types
  DiagramGroup,
  // Theme types
  ThemeColors,
  ThemeTypography,
  Theme,
  // IR types
  Direction,
  DocumentType,
  DocumentMeta,
  DiagramIR,
  InfographicSubtype,
  DocumentIR,
} from './types';

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------
export { DiagenError, CompileError, ValidationError, ErrorCodes } from './compiler';
