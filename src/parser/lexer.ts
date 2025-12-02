import { createToken, Lexer } from 'chevrotain';

// Whitespace & Comments
export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
});

export const Newline = createToken({
  name: 'Newline',
  pattern: /\r?\n/,
});

export const LineComment = createToken({
  name: 'LineComment',
  pattern: /\/\/[^\r\n]*/,
  group: Lexer.SKIPPED,
});

export const BlockComment = createToken({
  name: 'BlockComment',
  pattern: /\/\*[\s\S]*?\*\//,
  group: Lexer.SKIPPED,
});

// Delimiters
export const MetaDelimiter = createToken({
  name: 'MetaDelimiter',
  pattern: /---/,
});

export const LBracket = createToken({
  name: 'LBracket',
  pattern: /\[/,
});

export const RBracket = createToken({
  name: 'RBracket',
  pattern: /]/,
});

export const LBrace = createToken({
  name: 'LBrace',
  pattern: /\{/,
});

export const RBrace = createToken({
  name: 'RBrace',
  pattern: /}/,
});

export const LParen = createToken({
  name: 'LParen',
  pattern: /\(/,
});

export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,
});

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
});

export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
});

export const Dot = createToken({
  name: 'Dot',
  pattern: /\./,
});

// Arrows (order matters - longer patterns first)
export const BoldBiArrow = createToken({
  name: 'BoldBiArrow',
  pattern: /<=>/,
});

export const BoldArrow = createToken({
  name: 'BoldArrow',
  pattern: /==>/,
});

export const DashedBiArrow = createToken({
  name: 'DashedBiArrow',
  pattern: /<-->/,
});

export const DashedArrow = createToken({
  name: 'DashedArrow',
  pattern: /-->/,
});

export const BiArrow = createToken({
  name: 'BiArrow',
  pattern: /<->/,
});

export const Arrow = createToken({
  name: 'Arrow',
  pattern: /->/,
});

// Document types
export const AtDiagram = createToken({
  name: 'AtDiagram',
  pattern: /@diagram/,
});

export const AtInfographic = createToken({
  name: 'AtInfographic',
  pattern: /@infographic/,
});

export const AtPage = createToken({
  name: 'AtPage',
  pattern: /@page/,
});

// Keywords
export const Group = createToken({
  name: 'Group',
  pattern: /group/,
});

export const Place = createToken({
  name: 'Place',
  pattern: /place/,
});

export const True = createToken({
  name: 'True',
  pattern: /true/,
});

export const False = createToken({
  name: 'False',
  pattern: /false/,
});

// Infographic keywords
export const Item = createToken({
  name: 'Item',
  pattern: /item/,
});

export const Data = createToken({
  name: 'Data',
  pattern: /data/,
});

export const Series = createToken({
  name: 'Series',
  pattern: /series/,
});

export const Point = createToken({
  name: 'Point',
  pattern: /point/,
});

export const Step = createToken({
  name: 'Step',
  pattern: /step/,
});

export const Stage = createToken({
  name: 'Stage',
  pattern: /stage/,
});

export const Level = createToken({
  name: 'Level',
  pattern: /level/,
});

export const Cell = createToken({
  name: 'Cell',
  pattern: /cell/,
});

export const Ring = createToken({
  name: 'Ring',
  pattern: /ring/,
});

export const Layer = createToken({
  name: 'Layer',
  pattern: /layer/,
});

export const Phase = createToken({
  name: 'Phase',
  pattern: /phase/,
});

export const Member = createToken({
  name: 'Member',
  pattern: /member/,
});

// C4 keywords
export const Actor = createToken({
  name: 'Actor',
  pattern: /actor/,
});

export const System = createToken({
  name: 'System',
  pattern: /system/,
});

export const Container = createToken({
  name: 'Container',
  pattern: /container/,
});

export const Component = createToken({
  name: 'Component',
  pattern: /component/,
});

// Pipeline keywords
export const Source = createToken({
  name: 'Source',
  pattern: /source/,
});

export const Transform = createToken({
  name: 'Transform',
  pattern: /transform/,
});

export const Sink = createToken({
  name: 'Sink',
  pattern: /sink/,
});

// Cloud keywords
export const Region = createToken({
  name: 'Region',
  pattern: /region/,
});

export const Vpc = createToken({
  name: 'Vpc',
  pattern: /vpc/,
});

export const Subnet = createToken({
  name: 'Subnet',
  pattern: /subnet/,
});

export const Resource = createToken({
  name: 'Resource',
  pattern: /resource/,
});

export const External = createToken({
  name: 'External',
  pattern: /external/,
});

// Neural network keyword
export const NLayer = createToken({
  name: 'NLayer',
  pattern: /nlayer/,
});

// Literals
export const Color = createToken({
  name: 'Color',
  pattern: /#[0-9a-fA-F]{6}/,
});

export const Percent = createToken({
  name: 'Percent',
  pattern: /[+-]?\d+%/,
});

export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /-?\d+(\.\d+)?/,
});

export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"(?:[^"\\]|\\.)*"/,
});

export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_][a-zA-Z0-9_-]*/,
});

// All tokens in order (order matters for lexer)
export const allTokens = [
  // Whitespace and comments first
  WhiteSpace,
  Newline,
  LineComment,
  BlockComment,

  // Delimiters
  MetaDelimiter,

  // Arrows (longer patterns first)
  BoldBiArrow,
  BoldArrow,
  DashedBiArrow,
  DashedArrow,
  BiArrow,
  Arrow,

  // Brackets
  LBracket,
  RBracket,
  LBrace,
  RBrace,
  LParen,
  RParen,

  // Punctuation
  Comma,
  Colon,
  Dot,

  // Document types
  AtDiagram,
  AtInfographic,
  AtPage,

  // Keywords (before Identifier)
  Group,
  Place,
  True,
  False,

  // Infographic keywords
  Item,
  Data,
  Series,
  Point,
  Step,
  Stage,
  Level,
  Cell,
  Ring,
  Layer,
  Phase,
  Member,

  // C4 keywords
  Actor,
  System,
  Container,
  Component,

  // Pipeline keywords
  Source,
  Transform,
  Sink,

  // Cloud keywords
  Region,
  Vpc,
  Subnet,
  Resource,
  External,

  // Neural network
  NLayer,

  // Literals (order matters)
  Color,
  Percent,
  NumberLiteral,
  StringLiteral,
  Identifier,
];

export const DiagenLexer = new Lexer(allTokens);
