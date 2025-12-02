// Main compiler: IR -> DiagramModel

import type { DiagramIR, Theme } from '../types';
import { DiagramModel } from '../core/DiagramModel';
import { validate, ValidationResult } from './validator';
import { applyTheme, ThemeApplierOptions } from './themeApplier';
import { normalizeNodes, NormalizerOptions } from './nodeNormalizer';
import { CompileError, CompileWarning } from './errors';

export interface CompilerOptions extends ThemeApplierOptions, NormalizerOptions {
  strictMode?: boolean; // Throw on validation errors
  skipValidation?: boolean;
}

export interface CompileResult {
  model: DiagramModel | null;
  errors: CompileError[];
  warnings: CompileWarning[];
  validation: ValidationResult | null;
}

export class Compiler {
  private options: CompilerOptions;

  constructor(options: CompilerOptions = {}) {
    this.options = options;
  }

  compile(ir: DiagramIR, options?: CompilerOptions): CompileResult {
    const opts = { ...this.options, ...options };
    const errors: CompileError[] = [];
    const warnings: CompileWarning[] = [];

    // 1. Validation
    let validation: ValidationResult | null = null;
    if (!opts.skipValidation) {
      validation = validate(ir);
      warnings.push(...validation.warnings);

      if (!validation.valid) {
        if (opts.strictMode) {
          return {
            model: null,
            errors: validation.errors.map(
              e => new CompileError(e.code, e.message, { location: e.location })
            ),
            warnings,
            validation,
          };
        }
        // In non-strict mode, continue with warnings
        warnings.push(
          ...validation.errors.map(e => ({
            code: e.code,
            message: e.message,
            location: e.location,
          }))
        );
      }
    }

    // 2. Normalize nodes (auto-create implicit nodes)
    const normalized = normalizeNodes(ir, opts);

    // 3. Apply theme
    const themed = applyTheme(normalized, opts);

    // 4. Build DiagramModel
    const model = this.buildModel(themed);

    return {
      model,
      errors,
      warnings,
      validation,
    };
  }

  private buildModel(ir: DiagramIR): DiagramModel {
    const model = new DiagramModel();
    const { nodes, edges, groups } = ir.content;

    // Add groups first (they need to exist before nodes reference them)
    for (const group of groups) {
      model.addGroup({
        id: group.id,
        label: group.label,
        style: group.style,
        parentId: group.parentId,
        direction: group.direction,
        position: group.position,
        size: group.size,
        children: group.children ?? [],
      });
    }

    // Add nodes
    for (const node of nodes) {
      model.addNode({
        id: node.id,
        label: node.label,
        shape: node.shape,
        style: node.style,
        icon: node.icon,
        ports: node.ports,
        parentId: node.parentId,
        position: node.position,
        size: node.size,
      });
    }

    // Add edges
    for (const edge of edges) {
      model.addEdge({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourcePort: edge.sourcePort,
        targetPort: edge.targetPort,
        label: edge.label,
        style: edge.style,
      });
    }

    return model;
  }
}

// Convenience function
export function compile(ir: DiagramIR, options?: CompilerOptions): CompileResult {
  const compiler = new Compiler(options);
  return compiler.compile(ir, options);
}

// Compile with theme shorthand
export function compileWithTheme(
  ir: DiagramIR,
  theme: Theme | string,
  options?: Omit<CompilerOptions, 'theme'>
): CompileResult {
  return compile(ir, { ...options, theme });
}
