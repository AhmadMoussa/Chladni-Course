export interface Config {
  title?: string;  // Optional title for the sketch
  annotation?: string;
  sliders?: SliderConfig[];
  toggles?: ToggleConfig[];
  controlsOrientation?: 'horizontal' | 'vertical';  // new field
}

export interface SliderConfig {
  name: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  label: string;
}

export interface ToggleConfig {
  name: string;
  initial: boolean;
  label: string;
}

export interface ConfigVariable {
  name: string;
  type: 'number' | 'boolean';
  value: number | boolean;
  min?: number;
  max?: number;
  step?: number;
  label: string;
} 