export interface Config {
  title?: string;  // Optional title for the sketch
  annotation?: string;
  sliders?: SliderConfig[];
  toggles?: ToggleConfig[];
}

export interface SliderConfig {
  name: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}

export interface ToggleConfig {
  name: string;
  initial: boolean;
  label: string;
}

export interface ConfigVariable {
  name: string;
  value: number | boolean;
  type: 'number' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  label?: string;
} 