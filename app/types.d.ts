type SliderConfig = {
  name: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  type: 'number' | 'boolean';
}

type Config = {
  sliders: SliderConfig[];
} 