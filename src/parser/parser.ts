import { CstParser } from 'chevrotain';
import {
  allTokens,
  Newline,
  MetaDelimiter,
  LBracket,
  RBracket,
  LBrace,
  RBrace,
  LParen,
  RParen,
  Comma,
  Colon,
  Dot,
  Arrow,
  BiArrow,
  DashedArrow,
  DashedBiArrow,
  BoldArrow,
  BoldBiArrow,
  AtDiagram,
  AtInfographic,
  AtPage,
  Group,
  Place,
  True,
  False,
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
  Actor,
  System,
  Container,
  Component,
  Source,
  Transform,
  Sink,
  Region,
  Vpc,
  Subnet,
  Resource,
  External,
  NLayer,
  Color,
  Percent,
  NumberLiteral,
  StringLiteral,
  Identifier,
} from './lexer';

class DiagenParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  // Document entry point
  public document = this.RULE('document', () => {
    // Allow leading newlines before document header
    this.MANY(() => {
      this.CONSUME(Newline);
    });
    this.SUBRULE(this.documentHeader);
    this.OPTION(() => {
      this.SUBRULE(this.metaBlock);
    });
    this.SUBRULE(this.body);
  });

  // Document header: @diagram, @infographic, or @page
  private documentHeader = this.RULE('documentHeader', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(AtDiagram);
          this.OPTION(() => {
            this.CONSUME(Identifier, { LABEL: 'subtype' });
          });
        },
      },
      {
        ALT: () => {
          this.CONSUME(AtInfographic);
          this.OPTION2(() => {
            this.CONSUME2(Identifier, { LABEL: 'subtype' });
          });
        },
      },
      { ALT: () => this.CONSUME(AtPage) },
    ]);
    this.CONSUME(Newline);
  });

  // Meta block: --- ... ---
  private metaBlock = this.RULE('metaBlock', () => {
    this.CONSUME(MetaDelimiter);
    this.CONSUME(Newline);
    this.MANY(() => {
      this.SUBRULE(this.metaProperty);
    });
    this.CONSUME2(MetaDelimiter);
    this.CONSUME2(Newline);
  });

  // Meta property: key: value
  private metaProperty = this.RULE('metaProperty', () => {
    this.CONSUME(Identifier, { LABEL: 'key' });
    this.CONSUME(Colon);
    this.SUBRULE(this.value);
    this.CONSUME(Newline);
  });

  // Body: statements
  private body = this.RULE('body', () => {
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
  });

  // Statement types
  private statement = this.RULE('statement', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.emptyLine) },
      { ALT: () => this.SUBRULE(this.groupDef) },
      { ALT: () => this.SUBRULE(this.placeDef) },
      { ALT: () => this.SUBRULE(this.elementDef) },
      { ALT: () => this.SUBRULE(this.nodeOrEdgeStatement) },
    ]);
  });

  // Empty line
  private emptyLine = this.RULE('emptyLine', () => {
    this.CONSUME(Newline);
  });

  // Node definition or edge statement
  private nodeOrEdgeStatement = this.RULE('nodeOrEdgeStatement', () => {
    this.SUBRULE(this.nodeSet);
    this.OPTION(() => {
      this.SUBRULE(this.edgeChain);
    });
    this.OPTION2(() => {
      this.CONSUME(Newline);
    });
  });

  // Edge chain: -> B -> C
  private edgeChain = this.RULE('edgeChain', () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.arrowOp);
      this.SUBRULE(this.nodeSet);
      this.OPTION(() => {
        this.CONSUME(Colon);
        this.CONSUME(StringLiteral, { LABEL: 'edgeLabel' });
      });
    });
  });

  // Arrow operators
  private arrowOp = this.RULE('arrowOp', () => {
    this.OR([
      { ALT: () => this.CONSUME(BoldBiArrow) },
      { ALT: () => this.CONSUME(BoldArrow) },
      { ALT: () => this.CONSUME(DashedBiArrow) },
      { ALT: () => this.CONSUME(DashedArrow) },
      { ALT: () => this.CONSUME(BiArrow) },
      { ALT: () => this.CONSUME(Arrow) },
    ]);
  });

  // Node set: single node or (A, B, C)
  private nodeSet = this.RULE('nodeSet', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.nodeRef);
          this.MANY(() => {
            this.CONSUME(Comma);
            this.SUBRULE2(this.nodeRef);
          });
          this.CONSUME(RParen);
        },
      },
      { ALT: () => this.SUBRULE3(this.nodeDef) },
    ]);
  });

  // Node reference: id or Group.id or id:port
  private nodeRef = this.RULE('nodeRef', () => {
    this.CONSUME(Identifier, { LABEL: 'nodeId' });
    this.MANY(() => {
      this.CONSUME(Dot);
      this.CONSUME2(Identifier, { LABEL: 'nestedId' });
    });
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.CONSUME3(Identifier, { LABEL: 'portId' });
    });
  });

  // Node definition: id: "label" [attrs]
  private nodeDef = this.RULE('nodeDef', () => {
    this.CONSUME(Identifier, { LABEL: 'nodeId' });
    this.MANY(() => {
      this.CONSUME(Dot);
      this.CONSUME2(Identifier, { LABEL: 'nestedId' });
    });
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.OR([
        { ALT: () => this.CONSUME(StringLiteral, { LABEL: 'label' }) },
        { ALT: () => this.CONSUME3(Identifier, { LABEL: 'portId' }) },
      ]);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.attributes);
    });
  });

  // Attributes: [attr1, attr2: value]
  private attributes = this.RULE('attributes', () => {
    this.CONSUME(LBracket);
    this.OPTION(() => {
      this.SUBRULE(this.attribute);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.attribute);
      });
      this.OPTION2(() => {
        this.CONSUME2(Comma);
      });
    });
    this.CONSUME(RBracket);
  });

  // Single attribute
  private attribute = this.RULE('attribute', () => {
    this.CONSUME(Identifier, { LABEL: 'attrName' });
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.SUBRULE(this.value);
    });
  });

  // Group definition
  private groupDef = this.RULE('groupDef', () => {
    this.CONSUME(Group);
    this.CONSUME(Identifier, { LABEL: 'groupId' });
    this.OPTION(() => {
      this.SUBRULE(this.attributes);
    });
    this.CONSUME(LBrace);
    this.OPTION2(() => {
      this.CONSUME(Newline);
    });
    this.SUBRULE(this.body);
    this.CONSUME(RBrace);
    this.OPTION3(() => {
      this.CONSUME2(Newline);
    });
  });

  // Place definition (for @page)
  private placeDef = this.RULE('placeDef', () => {
    this.CONSUME(Place);
    this.SUBRULE(this.position);
    this.CONSUME(LBrace);
    this.OPTION(() => {
      this.CONSUME(Newline);
    });
    this.SUBRULE(this.document);
    this.CONSUME(RBrace);
    this.OPTION2(() => {
      this.CONSUME2(Newline);
    });
  });

  // Position: [x, y, width, height]
  private position = this.RULE('position', () => {
    this.CONSUME(LBracket);
    this.CONSUME(NumberLiteral, { LABEL: 'x' });
    this.CONSUME(Comma);
    this.CONSUME2(NumberLiteral, { LABEL: 'y' });
    this.CONSUME2(Comma);
    this.CONSUME3(NumberLiteral, { LABEL: 'width' });
    this.CONSUME3(Comma);
    this.CONSUME4(NumberLiteral, { LABEL: 'height' });
    this.CONSUME(RBracket);
  });

  // Element definition (for infographics)
  private elementDef = this.RULE('elementDef', () => {
    this.SUBRULE(this.elementKeyword);
    this.CONSUME(StringLiteral, { LABEL: 'elementId' });
    this.OPTION(() => {
      this.SUBRULE(this.attributes);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.elementBlock);
    });
    this.OPTION3(() => {
      this.CONSUME(Newline);
    });
  });

  // Element keywords
  private elementKeyword = this.RULE('elementKeyword', () => {
    this.OR([
      { ALT: () => this.CONSUME(Item) },
      { ALT: () => this.CONSUME(Data) },
      { ALT: () => this.CONSUME(Series) },
      { ALT: () => this.CONSUME(Point) },
      { ALT: () => this.CONSUME(Step) },
      { ALT: () => this.CONSUME(Stage) },
      { ALT: () => this.CONSUME(Level) },
      { ALT: () => this.CONSUME(Cell) },
      { ALT: () => this.CONSUME(Ring) },
      { ALT: () => this.CONSUME(Layer) },
      { ALT: () => this.CONSUME(Phase) },
      { ALT: () => this.CONSUME(Member) },
      { ALT: () => this.CONSUME(Actor) },
      { ALT: () => this.CONSUME(System) },
      { ALT: () => this.CONSUME(Container) },
      { ALT: () => this.CONSUME(Component) },
      { ALT: () => this.CONSUME(Source) },
      { ALT: () => this.CONSUME(Transform) },
      { ALT: () => this.CONSUME(Sink) },
      { ALT: () => this.CONSUME(Region) },
      { ALT: () => this.CONSUME(Vpc) },
      { ALT: () => this.CONSUME(Subnet) },
      { ALT: () => this.CONSUME(Resource) },
      { ALT: () => this.CONSUME(External) },
      { ALT: () => this.CONSUME(NLayer) },
    ]);
  });

  // Element block: { properties }
  private elementBlock = this.RULE('elementBlock', () => {
    this.CONSUME(LBrace);
    this.OPTION(() => {
      this.CONSUME(Newline);
    });
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.elementDef) },
        {
          // Block property must have: key: value Newline (where value is not an arrow)
          // Use GATE to check if it looks like a property (has colon followed by non-arrow)
          GATE: () => this.isBlockProperty(),
          ALT: () => this.SUBRULE(this.blockProperty),
        },
        { ALT: () => this.SUBRULE(this.nodeOrEdgeStatement) },
      ]);
    });
    this.CONSUME(RBrace);
  });

  // Check if current position looks like a block property
  // Block property: (Identifier|String) : value Newline
  // vs nodeOrEdgeStatement: Identifier (with optional stuff) -> ...
  private isBlockProperty(): boolean {
    // Look ahead to see if we have: (Identifier|String) Colon (non-arrow-value)
    const tokens = this.LA(1);
    if (tokens.tokenType === StringLiteral) {
      // String literal key is always a block property
      return true;
    }
    if (tokens.tokenType === Identifier) {
      // Check if next token is Colon
      const next = this.LA(2);
      if (next.tokenType === Colon) {
        // Check if the token after colon is a value (not an identifier that could be a port)
        const afterColon = this.LA(3);
        // If it's a value literal (string, number, color, etc.) it's a property
        // If it's an identifier followed by Newline, it's a property
        // If it's an identifier followed by arrow, it's a node statement
        if (
          afterColon.tokenType === StringLiteral ||
          afterColon.tokenType === NumberLiteral ||
          afterColon.tokenType === Color ||
          afterColon.tokenType === Percent ||
          afterColon.tokenType === True ||
          afterColon.tokenType === False ||
          afterColon.tokenType === LParen
        ) {
          return true;
        }
        // If it's an identifier, check what follows
        if (afterColon.tokenType === Identifier) {
          const afterValue = this.LA(4);
          // If followed by Newline or LBracket (attributes), it's a property
          if (afterValue.tokenType === Newline || afterValue.tokenType === LBracket) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Block property: key: value or "key": value
  private blockProperty = this.RULE('blockProperty', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral, { LABEL: 'key' }) },
      { ALT: () => this.CONSUME(Identifier, { LABEL: 'key' }) },
    ]);
    this.CONSUME(Colon);
    this.SUBRULE(this.value);
    this.OPTION(() => {
      this.SUBRULE(this.attributes);
    });
    this.CONSUME(Newline);
  });

  // Value types
  private value = this.RULE('value', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      { ALT: () => this.CONSUME(Color) },
      { ALT: () => this.CONSUME(Percent) },
      { ALT: () => this.SUBRULE(this.gradient) },
      { ALT: () => this.SUBRULE(this.array) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  // Gradient: gradient(#from, #to)
  private gradient = this.RULE('gradient', () => {
    this.CONSUME(Identifier, { LABEL: 'gradientKeyword' });
    this.CONSUME(LParen);
    this.CONSUME(Color, { LABEL: 'fromColor' });
    this.CONSUME(Comma);
    this.CONSUME2(Color, { LABEL: 'toColor' });
    this.CONSUME(RParen);
  });

  // Array: (item1, item2, ...)
  private array = this.RULE('array', () => {
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.arrayItem);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.arrayItem);
      });
    });
    this.CONSUME(RParen);
  });

  // Array item: value with optional attributes
  private arrayItem = this.RULE('arrayItem', () => {
    this.SUBRULE(this.value);
    this.OPTION(() => {
      this.SUBRULE(this.attributes);
    });
  });
}

export const parser = new DiagenParser();
