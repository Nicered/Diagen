import { DiagenLexer } from './lexer';
import { parser } from './parser';
import { visitor } from './visitor';
import type { DiagramIR } from '../types';

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
}

export interface ParseResult {
  success: boolean;
  ir?: DiagramIR;
  errors: ParseError[];
}

/**
 * Parse a Diagen DSL string into an IR
 */
export function parse(input: string): ParseResult {
  const errors: ParseError[] = [];

  // Tokenize
  const lexResult = DiagenLexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    for (const error of lexResult.errors) {
      errors.push({
        message: error.message,
        line: error.line,
        column: error.column,
      });
    }
    return { success: false, errors };
  }

  // Parse
  parser.input = lexResult.tokens;
  const cst = parser.document();

  if (parser.errors.length > 0) {
    for (const error of parser.errors) {
      errors.push({
        message: error.message,
        line: error.token.startLine,
        column: error.token.startColumn,
      });
    }
    return { success: false, errors };
  }

  // Visit CST to build IR
  try {
    const ir = visitor.visit(cst) as DiagramIR;
    return { success: true, ir, errors: [] };
  } catch (e) {
    errors.push({
      message: e instanceof Error ? e.message : 'Unknown error during IR generation',
    });
    return { success: false, errors };
  }
}

export { DiagenLexer } from './lexer';
export { parser } from './parser';
export { visitor } from './visitor';
