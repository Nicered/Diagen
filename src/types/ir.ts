import type { DiagramNode } from './node';
import type { DiagramEdge } from './edge';
import type { DiagramGroup } from './group';

/**
 * Layout direction
 */
export type Direction = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * Document type
 */
export type DocumentType = 'diagram' | 'infographic' | 'page';

/**
 * Common metadata for all document types
 */
export interface DocumentMeta {
  title?: string;
  theme?: string;
  direction?: Direction;
  [key: string]: unknown;
}

/**
 * Diagram IR (Intermediate Representation)
 */
export interface DiagramIR {
  type: 'diagram';
  subtype: string | null;
  meta: DocumentMeta;
  content: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    groups: DiagramGroup[];
  };
}

/**
 * Infographic element types
 */
export type InfographicSubtype =
  | 'kpi'
  | 'chart'
  | 'timeline'
  | 'process'
  | 'funnel'
  | 'pyramid'
  | 'matrix'
  | 'concentric'
  | 'stack'
  | 'cycle'
  | 'org';

/**
 * KPI item
 */
export interface KpiItem {
  id: string;
  value: string;
  label: string;
  icon?: string;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  color?: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Chart series
 */
export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Timeline point
 */
export interface TimelinePoint {
  id: string;
  date: string;
  title: string;
  items?: string[];
  status?: 'completed' | 'current' | 'upcoming';
}

/**
 * Process step
 */
export interface ProcessStep {
  id: string;
  title: string;
  icon?: string;
  owner?: string;
  duration?: string;
  status?: 'completed' | 'current' | 'upcoming';
}

/**
 * Funnel stage
 */
export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  rate?: number;
  color?: string;
}

/**
 * Pyramid level
 */
export interface PyramidLevel {
  id: string;
  title: string;
  description?: string;
  color?: string;
}

/**
 * Matrix cell
 */
export interface MatrixCell {
  id: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title: string;
  items?: string[];
  color?: string;
}

/**
 * Concentric ring
 */
export interface ConcentricRing {
  id: string;
  title: string;
  description?: string;
  color?: string;
}

/**
 * Stack layer
 */
export interface StackLayer {
  id: string;
  title: string;
  description?: string;
  color?: string;
}

/**
 * Cycle phase
 */
export interface CyclePhase {
  id: string;
  title: string;
  icon?: string;
  items?: string[];
}

/**
 * Organization member
 */
export interface OrgMember {
  id: string;
  title: string;
  name?: string;
  children?: string[];
}

/**
 * Infographic content by subtype
 */
export interface InfographicContent {
  kpi: { items: KpiItem[] };
  chart: { type: string; data?: ChartDataPoint[]; series?: ChartSeries[]; center?: string };
  timeline: { orientation?: 'horizontal' | 'vertical'; points: TimelinePoint[] };
  process: { style?: 'numbered' | 'icon'; steps: ProcessStep[] };
  funnel: { showPercentage?: boolean; stages: FunnelStage[] };
  pyramid: { direction?: 'up' | 'down'; levels: PyramidLevel[] };
  matrix: {
    xAxis?: string;
    yAxis?: string;
    xLabels?: [string, string];
    yLabels?: [string, string];
    cells: MatrixCell[];
  };
  concentric: { rings: ConcentricRing[] };
  stack: { style?: '2d' | '3d'; layers: StackLayer[] };
  cycle: { center?: string; phases: CyclePhase[] };
  org: { root?: string; members: OrgMember[] };
}

/**
 * Infographic IR
 */
export interface InfographicIR<T extends InfographicSubtype = InfographicSubtype> {
  type: 'infographic';
  subtype: T;
  meta: DocumentMeta;
  content: InfographicContent[T];
}

/**
 * Page placement
 */
export interface PagePlacement {
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  document: DiagramIR | InfographicIR;
}

/**
 * Page IR
 */
export interface PageIR {
  type: 'page';
  meta: DocumentMeta & {
    size?: { width: number; height: number };
    grid?: { columns: number; rows: number };
  };
  content: {
    placements: PagePlacement[];
  };
}

/**
 * Union type for all IR types
 */
export type DocumentIR = DiagramIR | InfographicIR | PageIR;
