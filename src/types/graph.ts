export interface ExportData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  viewport: { x: number; y: number; zoom: number };
}

export const COLORS = [
  '#9CA3AF', // gray (default)
  '#EF4444', // red
  '#F59E0B', // orange
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
] as const;

export type ColorType = typeof COLORS[number];
