import { describe, it, expect } from 'vitest';
import { parse } from '../index';

describe('Diagen Parser', () => {
  describe('Basic diagram parsing', () => {
    it('should parse a simple diagram', () => {
      const input = `@diagram
A -> B
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir).toBeDefined();
      expect(result.ir?.type).toBe('diagram');
      expect(result.ir?.content.nodes).toHaveLength(2);
      expect(result.ir?.content.edges).toHaveLength(1);
    });

    it('should parse nodes with labels', () => {
      const input = `@diagram
client: "Client Application"
server: "API Server"
client -> server
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.nodes).toHaveLength(2);

      const client = result.ir?.content.nodes.find(n => n.id === 'client');
      expect(client?.label).toBe('Client Application');
    });

    it('should parse nodes with attributes', () => {
      const input = `@diagram
db: "Database" [cylinder, fill: #4A90D9]
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.nodes).toHaveLength(1);

      const db = result.ir?.content.nodes[0];
      expect(db?.shape).toBe('cylinder');
      expect(db?.style?.fill).toBe('#4A90D9');
    });

    it('should parse multiple edge types', () => {
      const input = `@diagram
A -> B
B --> C
C ==> D
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.edges).toHaveLength(3);

      const edges = result.ir?.content.edges;
      expect(edges?.[0].style?.lineType).toBe('solid');
      expect(edges?.[1].style?.lineType).toBe('dashed');
      expect(edges?.[2].style?.lineType).toBe('bold');
    });

    it('should parse edge labels', () => {
      const input = `@diagram
A -> B: "HTTPS"
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.edges[0].label).toBe('HTTPS');
    });

    it('should parse chained edges', () => {
      const input = `@diagram
A -> B -> C -> D
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.nodes).toHaveLength(4);
      expect(result.ir?.content.edges).toHaveLength(3);
    });

    it('should parse multi-target edges', () => {
      const input = `@diagram
A -> (B, C, D)
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.edges).toHaveLength(3);

      const targets = result.ir?.content.edges.map(e => e.target);
      expect(targets).toContain('B');
      expect(targets).toContain('C');
      expect(targets).toContain('D');
    });
  });

  describe('Metadata parsing', () => {
    it('should parse metadata block', () => {
      const input = `@diagram
---
title: "System Architecture"
theme: professional
direction: TB
---
A -> B
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.meta.title).toBe('System Architecture');
      expect(result.ir?.meta.theme).toBe('professional');
      expect(result.ir?.meta.direction).toBe('TB');
    });
  });

  describe('Group parsing', () => {
    it('should parse groups', () => {
      const input = `@diagram
group Backend {
  api: "API Server"
  worker: "Worker"
}
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.groups).toHaveLength(1);

      const group = result.ir?.content.groups[0];
      expect(group?.id).toBe('Backend');
      expect(group?.children).toContain('api');
      expect(group?.children).toContain('worker');
    });

    it('should parse group references in edges', () => {
      const input = `@diagram
group Backend {
  api: "API"
}
client -> Backend.api
`;
      const result = parse(input);

      expect(result.success).toBe(true);
      expect(result.ir?.content.edges).toHaveLength(1);
      // Backend.api should resolve to the 'api' node inside the Backend group
      expect(result.ir?.content.edges[0].target).toBe('api');
    });
  });

  describe('Error handling', () => {
    it('should report syntax errors', () => {
      const input = `@diagram
A ->
`;
      const result = parse(input);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
