export type ConfigVariable = {
  name: string;
  value: number | boolean;
  type: 'number' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
};

export type Config = {
  sliders: {
    name: string;
    min: number;
    max: number;
    step: number;
    initial: number;
  }[];
} 