export type ConfigVariable = {
  name: string;
  value: number | boolean;
  type: 'number' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
};

export interface Config {
  title?: string;  // Optional title for the sketch
  sliders: {
    name: string;
    initial: number;
    min: number;
    max: number;
    step: number;
  }[];
} 