// Integrated pipeline: DSL -> Rendered output

import type { DiagramIR, Theme, DiagramNode, DiagramEdge, DiagramGroup } from '../types';
import { DiagramModel } from '../core/DiagramModel';
import { parse as parseSource, ParseResult } from '../parser';
import { compile, CompilerOptions } from '../compiler';
import { ElkLayoutAdapter, LayoutOptions } from '../layout/elkAdapter';
import { exportToSvg, SvgExportOptions } from '../export/svgExporter';

// Pipeline options
export interface PipelineOptions {
  // Compiler options
  theme?: Theme | string;
  strictMode?: boolean;
  autoCreateNodes?: boolean;

  // Layout options
  layout?: LayoutOptions;

  // Skip steps
  skipLayout?: boolean;
}

// Compiled diagram result
export interface CompiledDiagram {
  model: DiagramModel;
  ir: DiagramIR;
  warnings: string[];
}

// Parse DSL text to IR
export function parse(source: string): ParseResult {
  return parseSource(source);
}

// Full pipeline: DSL -> DiagramModel with layout
export async function compileDsl(
  source: string,
  options?: PipelineOptions
): Promise<CompiledDiagram> {
  // 1. Parse DSL to IR
  const parseResult = parseSource(source);

  if (!parseResult.success || !parseResult.ir) {
    const errorMessages = parseResult.errors.map(e => e.message).join('\n');
    throw new Error(`Parse error:\n${errorMessages}`);
  }

  const ir = parseResult.ir;

  // 2. Compile IR to Model
  const compilerOptions: CompilerOptions = {
    theme: options?.theme,
    strictMode: options?.strictMode,
    autoCreateNodes: options?.autoCreateNodes ?? true,
  };

  const result = compile(ir, compilerOptions);

  if (!result.model) {
    const errorMessages = result.errors.map(e => e.message).join('\n');
    throw new Error(`Compilation failed:\n${errorMessages}`);
  }

  // 3. Apply layout (if not skipped)
  if (!options?.skipLayout) {
    const layoutAdapter = new ElkLayoutAdapter();
    await layoutAdapter.layout(result.model, options?.layout);
  }

  return {
    model: result.model,
    ir,
    warnings: result.warnings.map(w => w.message),
  };
}

// Export to SVG
export async function toSvg(
  diagram: CompiledDiagram,
  options?: SvgExportOptions
): Promise<string> {
  return exportToSvg(diagram.model, options);
}

// Convenience: DSL -> SVG in one step
export async function dslToSvg(
  source: string,
  options?: PipelineOptions & SvgExportOptions
): Promise<string> {
  const diagram = await compileDsl(source, options);

  // Extract width/height from meta if not specified in options
  const svgOptions: SvgExportOptions = { ...options };
  if (!svgOptions.width && diagram.ir.meta.width) {
    svgOptions.width = Number(diagram.ir.meta.width);
  }
  if (!svgOptions.height && diagram.ir.meta.height) {
    svgOptions.height = Number(diagram.ir.meta.height);
  }

  return toSvg(diagram, svgOptions);
}

// Builder pattern API
export class Diagen {
  private source: string;
  private options: PipelineOptions = {};
  private compiled: CompiledDiagram | null = null;

  private constructor(source: string) {
    this.source = source;
  }

  static from(source: string): Diagen {
    return new Diagen(source);
  }

  theme(theme: Theme | string): Diagen {
    this.options.theme = theme;
    return this;
  }

  layout(options: LayoutOptions): Diagen {
    this.options.layout = options;
    return this;
  }

  strict(): Diagen {
    this.options.strictMode = true;
    return this;
  }

  skipLayout(): Diagen {
    this.options.skipLayout = true;
    return this;
  }

  async compile(): Promise<CompiledDiagram> {
    if (!this.compiled) {
      this.compiled = await compileDsl(this.source, this.options);
    }
    return this.compiled;
  }

  async toSvg(options?: SvgExportOptions): Promise<string> {
    const diagram = await this.compile();
    return toSvg(diagram, options);
  }

  async getModel(): Promise<DiagramModel> {
    const diagram = await this.compile();
    return diagram.model;
  }
}

// Programmatic API for creating diagrams without DSL
export interface DiagramDefinition {
  nodes: Array<Omit<DiagramNode, 'position' | 'size'>>;
  edges: Array<Omit<DiagramEdge, 'id'> & { id?: string }>;
  groups?: Array<Omit<DiagramGroup, 'position' | 'size'>>;
}

export async function createDiagram(
  definition: DiagramDefinition,
  options?: PipelineOptions
): Promise<CompiledDiagram> {
  // Build IR from definition
  const ir: DiagramIR = {
    type: 'diagram',
    subtype: null,
    meta: {},
    content: {
      nodes: definition.nodes.map(n => ({ ...n })) as DiagramNode[],
      edges: definition.edges.map((e, i) => ({
        ...e,
        id: e.id ?? `edge-${i}`,
      })) as DiagramEdge[],
      groups: (definition.groups?.map(g => ({ ...g })) ?? []) as DiagramGroup[],
    },
  };

  // Compile
  const compilerOptions: CompilerOptions = {
    theme: options?.theme,
    strictMode: options?.strictMode,
    autoCreateNodes: options?.autoCreateNodes ?? true,
  };

  const result = compile(ir, compilerOptions);

  if (!result.model) {
    const errorMessages = result.errors.map(e => e.message).join('\n');
    throw new Error(`Compilation failed:\n${errorMessages}`);
  }

  // Apply layout
  if (!options?.skipLayout) {
    const layoutAdapter = new ElkLayoutAdapter();
    await layoutAdapter.layout(result.model, options?.layout);
  }

  return {
    model: result.model,
    ir,
    warnings: result.warnings.map(w => w.message),
  };
}
