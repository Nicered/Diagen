import type {
  DiagramIR,
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  NodeStyle,
  EdgeStyle,
  Direction,
} from '../types';

/**
 * Diagram model class for managing diagram elements
 */
export class DiagramModel {
  private _nodes: Map<string, DiagramNode> = new Map();
  private _edges: Map<string, DiagramEdge> = new Map();
  private _groups: Map<string, DiagramGroup> = new Map();
  private _direction: Direction = 'TB';
  private _title?: string;
  private _theme?: string;

  constructor(ir?: DiagramIR) {
    if (ir) {
      this.loadFromIR(ir);
    }
  }

  /**
   * Load diagram from IR
   */
  loadFromIR(ir: DiagramIR): void {
    this._direction = (ir.meta.direction as Direction) || 'TB';
    this._title = ir.meta.title as string | undefined;
    this._theme = ir.meta.theme as string | undefined;

    // Load nodes
    for (const node of ir.content.nodes) {
      this._nodes.set(node.id, { ...node });
    }

    // Load edges
    for (const edge of ir.content.edges) {
      this._edges.set(edge.id, { ...edge });
    }

    // Load groups
    for (const group of ir.content.groups) {
      this._groups.set(group.id, { ...group });
    }
  }

  /**
   * Export diagram to IR
   */
  toIR(): DiagramIR {
    return {
      type: 'diagram',
      subtype: null,
      meta: {
        title: this._title,
        theme: this._theme,
        direction: this._direction,
      },
      content: {
        nodes: Array.from(this._nodes.values()),
        edges: Array.from(this._edges.values()),
        groups: Array.from(this._groups.values()),
      },
    };
  }

  // --- Node operations ---

  /**
   * Add a node to the diagram
   */
  addNode(node: DiagramNode): void {
    if (this._nodes.has(node.id)) {
      throw new Error(`Node with id "${node.id}" already exists`);
    }
    this._nodes.set(node.id, node);

    // If node has a parent group, add to group's children
    if (node.parentId && this._groups.has(node.parentId)) {
      const group = this._groups.get(node.parentId)!;
      if (!group.children.includes(node.id)) {
        group.children.push(node.id);
      }
    }
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): DiagramNode | undefined {
    return this._nodes.get(id);
  }

  /**
   * Update a node
   */
  updateNode(id: string, updates: Partial<DiagramNode>): void {
    const node = this._nodes.get(id);
    if (!node) {
      throw new Error(`Node with id "${id}" not found`);
    }
    this._nodes.set(id, { ...node, ...updates });
  }

  /**
   * Remove a node
   */
  removeNode(id: string): void {
    if (!this._nodes.has(id)) {
      throw new Error(`Node with id "${id}" not found`);
    }

    // Remove edges connected to this node
    for (const [edgeId, edge] of this._edges) {
      if (edge.source === id || edge.target === id) {
        this._edges.delete(edgeId);
      }
    }

    // Remove from parent group
    const node = this._nodes.get(id)!;
    if (node.parentId && this._groups.has(node.parentId)) {
      const group = this._groups.get(node.parentId)!;
      group.children = group.children.filter((childId) => childId !== id);
    }

    this._nodes.delete(id);
  }

  /**
   * Get all nodes
   */
  get nodes(): DiagramNode[] {
    return Array.from(this._nodes.values());
  }

  /**
   * Get nodes in a group
   */
  getNodesInGroup(groupId: string): DiagramNode[] {
    return this.nodes.filter((node) => node.parentId === groupId);
  }

  /**
   * Get root nodes (nodes without parent)
   */
  getRootNodes(): DiagramNode[] {
    return this.nodes.filter((node) => !node.parentId);
  }

  // --- Edge operations ---

  /**
   * Add an edge to the diagram
   */
  addEdge(edge: DiagramEdge): void {
    if (this._edges.has(edge.id)) {
      throw new Error(`Edge with id "${edge.id}" already exists`);
    }
    this.validateEdge(edge);
    this._edges.set(edge.id, edge);
  }

  /**
   * Validate edge references
   */
  private validateEdge(edge: DiagramEdge): void {
    const sourceId = edge.source.split('.').pop()!;
    const targetId = edge.target.split('.').pop()!;

    // Check if source and target exist (either as nodes or groups)
    const sourceExists = this._nodes.has(sourceId) || this._groups.has(sourceId) ||
      this.findNodeByPath(edge.source);
    const targetExists = this._nodes.has(targetId) || this._groups.has(targetId) ||
      this.findNodeByPath(edge.target);

    if (!sourceExists) {
      console.warn(`Edge source "${edge.source}" not found`);
    }
    if (!targetExists) {
      console.warn(`Edge target "${edge.target}" not found`);
    }
  }

  /**
   * Find a node by path (e.g., "Group.node")
   */
  private findNodeByPath(path: string): DiagramNode | undefined {
    const parts = path.split('.');
    if (parts.length === 1) {
      return this._nodes.get(path);
    }

    // For paths like "Group.node", we look for node with that full ID
    return this._nodes.get(path);
  }

  /**
   * Get an edge by ID
   */
  getEdge(id: string): DiagramEdge | undefined {
    return this._edges.get(id);
  }

  /**
   * Update an edge
   */
  updateEdge(id: string, updates: Partial<DiagramEdge>): void {
    const edge = this._edges.get(id);
    if (!edge) {
      throw new Error(`Edge with id "${id}" not found`);
    }
    this._edges.set(id, { ...edge, ...updates });
  }

  /**
   * Remove an edge
   */
  removeEdge(id: string): void {
    if (!this._edges.has(id)) {
      throw new Error(`Edge with id "${id}" not found`);
    }
    this._edges.delete(id);
  }

  /**
   * Get all edges
   */
  get edges(): DiagramEdge[] {
    return Array.from(this._edges.values());
  }

  /**
   * Get edges connected to a node
   */
  getEdgesForNode(nodeId: string): DiagramEdge[] {
    return this.edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
  }

  // --- Group operations ---

  /**
   * Add a group to the diagram
   */
  addGroup(group: DiagramGroup): void {
    if (this._groups.has(group.id)) {
      throw new Error(`Group with id "${group.id}" already exists`);
    }
    this._groups.set(group.id, group);
  }

  /**
   * Get a group by ID
   */
  getGroup(id: string): DiagramGroup | undefined {
    return this._groups.get(id);
  }

  /**
   * Update a group
   */
  updateGroup(id: string, updates: Partial<DiagramGroup>): void {
    const group = this._groups.get(id);
    if (!group) {
      throw new Error(`Group with id "${id}" not found`);
    }
    this._groups.set(id, { ...group, ...updates });
  }

  /**
   * Remove a group
   */
  removeGroup(id: string, removeChildren = false): void {
    const group = this._groups.get(id);
    if (!group) {
      throw new Error(`Group with id "${id}" not found`);
    }

    if (removeChildren) {
      // Remove all children
      for (const childId of group.children) {
        if (this._nodes.has(childId)) {
          this.removeNode(childId);
        } else if (this._groups.has(childId)) {
          this.removeGroup(childId, true);
        }
      }
    } else {
      // Move children to root
      for (const childId of group.children) {
        if (this._nodes.has(childId)) {
          const node = this._nodes.get(childId)!;
          node.parentId = group.parentId;
        } else if (this._groups.has(childId)) {
          const childGroup = this._groups.get(childId)!;
          childGroup.parentId = group.parentId;
        }
      }
    }

    this._groups.delete(id);
  }

  /**
   * Get all groups
   */
  get groups(): DiagramGroup[] {
    return Array.from(this._groups.values());
  }

  /**
   * Get root groups (groups without parent)
   */
  getRootGroups(): DiagramGroup[] {
    return this.groups.filter((group) => !group.parentId);
  }

  // --- Style operations ---

  /**
   * Apply style to a node
   */
  applyNodeStyle(nodeId: string, style: Partial<NodeStyle>): void {
    const node = this._nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node with id "${nodeId}" not found`);
    }
    node.style = { ...node.style, ...style };
  }

  /**
   * Apply style to an edge
   */
  applyEdgeStyle(edgeId: string, style: Partial<EdgeStyle>): void {
    const edge = this._edges.get(edgeId);
    if (!edge) {
      throw new Error(`Edge with id "${edgeId}" not found`);
    }
    edge.style = { ...edge.style, ...style };
  }

  /**
   * Apply style to all nodes
   */
  applyGlobalNodeStyle(style: Partial<NodeStyle>): void {
    for (const node of this._nodes.values()) {
      node.style = { ...node.style, ...style };
    }
  }

  /**
   * Apply style to all edges
   */
  applyGlobalEdgeStyle(style: Partial<EdgeStyle>): void {
    for (const edge of this._edges.values()) {
      edge.style = { ...edge.style, ...style };
    }
  }

  // --- Properties ---

  get direction(): Direction {
    return this._direction;
  }

  set direction(value: Direction) {
    this._direction = value;
  }

  get title(): string | undefined {
    return this._title;
  }

  set title(value: string | undefined) {
    this._title = value;
  }

  get theme(): string | undefined {
    return this._theme;
  }

  set theme(value: string | undefined) {
    this._theme = value;
  }

  // --- Validation ---

  /**
   * Validate the diagram
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate IDs across nodes and groups
    const allIds = new Set<string>();

    for (const node of this._nodes.values()) {
      if (allIds.has(node.id)) {
        errors.push(`Duplicate ID: "${node.id}"`);
      }
      allIds.add(node.id);
    }

    for (const group of this._groups.values()) {
      if (allIds.has(group.id)) {
        errors.push(`Duplicate ID: "${group.id}"`);
      }
      allIds.add(group.id);
    }

    // Check edge references
    for (const edge of this._edges.values()) {
      if (!this.findNodeByPath(edge.source) && !this._groups.has(edge.source)) {
        errors.push(`Edge "${edge.id}" references non-existent source: "${edge.source}"`);
      }
      if (!this.findNodeByPath(edge.target) && !this._groups.has(edge.target)) {
        errors.push(`Edge "${edge.id}" references non-existent target: "${edge.target}"`);
      }
    }

    // Check group children references
    for (const group of this._groups.values()) {
      for (const childId of group.children) {
        if (!this._nodes.has(childId) && !this._groups.has(childId)) {
          errors.push(`Group "${group.id}" references non-existent child: "${childId}"`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
