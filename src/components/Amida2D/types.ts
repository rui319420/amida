export type VerticalLine = {
  id: string;
  lineIndex: number;
  x: number;
  name: string;
  color: string;
}

export type HorizontalLine = {
  id: string;
  index1: number;
  index2: number;
  y: number;
}

export type Point = {
  x: number;
  y: number;
}

export type WalkerPath = {
  lineId: string;
  color: string;
  points: Point[];
}