'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prism-themes/themes/prism-gruvbox-light.css';
import { defaultHtml, defaultCss } from './defaultHtml';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ConfigControls from '../components/ConfigControls';
import P5Playground from '../components/Playground';

// Create a dynamic import for the Editor with SSR disabled
const CodeEditor = dynamic(
  () => import('react-simple-code-editor').then((mod) => mod.default),
  { ssr: false }
);

const highlightWithLineNumbers = (code: string) => {
  return highlight(code, languages.javascript, 'javascript')
    .split('\n')
    .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
    .join('\n');
};

interface SliderConfig {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}

interface ToggleConfig {
  name: string;
  label: string;
  initial: boolean;
}

export default function SubmitSketch() {
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState(defaultHtml);
  const [jsContent, setJsContent] = useState('');
  const [cssContent, setCssContent] = useState(defaultCss);
  const [mdxContent, setMdxContent] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [controlsOrientation, setControlsOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // State for sliders and toggles
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [toggles, setToggles] = useState<ToggleConfig[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Create a temporary sketch path for preview
  const previewSketchPath = '/preview';

  const addSlider = () => {
    setSliders([...sliders, {
      name: `slider${sliders.length + 1}`,
      label: `Slider ${sliders.length + 1}`,
      min: 0,
      max: 100,
      step: 1,
      initial: 50
    }]);
  };

  const updateSlider = (index: number, field: keyof SliderConfig, value: string | number) => {
    const newSliders = [...sliders];
    newSliders[index] = {
      ...newSliders[index],
      [field]: typeof value === 'string' && field !== 'name' && field !== 'label' ? parseFloat(value) : value
    };
    setSliders(newSliders);
  };

  const removeSlider = (index: number) => {
    setSliders(sliders.filter((_, i) => i !== index));
  };

  const addToggle = () => {
    setToggles([...toggles, {
      name: `toggle${toggles.length + 1}`,
      label: `Toggle ${toggles.length + 1}`,
      initial: false
    }]);
  };

  const updateToggle = (index: number, field: keyof ToggleConfig, value: string | boolean) => {
    const newToggles = [...toggles];
    newToggles[index] = {
      ...newToggles[index],
      [field]: field === 'initial' ? Boolean(value) : value
    };
    setToggles(newToggles);
  };

  const removeToggle = (index: number) => {
    setToggles(toggles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const config = {
        title,
        annotation: annotation || undefined,
        controlsOrientation,
        sliders,
        toggles
      };

      const { error: submitError } = await supabase
        .from('sketches')
        .insert({
          title,
          html_content: htmlContent,
          js_content: jsContent,
          css_content: cssContent,
          mdx_content: mdxContent || null,
          config
        });

      if (submitError) throw submitError;

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a function to handle code updates from the editor
  const handleCodeChange = (code: string) => {
    setJsContent(code);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black bg-white flex items-center justify-between">
        <h2 className="text-m font-bold text-black">
          {title || 'New Sketch'}
        </h2>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-white border border-black text-black px-2 py-1 hover:bg-[#16DF81] hover:text-white"
        >
          {isSubmitting ? 'Submitting...' : 'Save Sketch'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0"> {/* min-h-0 is crucial for nested flex containers */}
        {/* Left Panel - Scrollable Form */}
        <div className="w-[40%] border-r border-black bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-black text-black"
                placeholder="Enter sketch title"
              />
            </div>

            {/* HTML Content */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                HTML
              </label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full h-32 p-2 font-mono text-sm border border-black"
                placeholder="Enter HTML content"
              />
            </div>

            {/* CSS Content */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                CSS
              </label>
              <textarea
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                className="w-full h-32 p-2 font-mono text-sm border border-black"
                placeholder="Enter CSS content"
              />
            </div>

            {/* Code Editor */}
            <div>
              <label className="block text-sm font-medium text-black">JavaScript Code</label>
              <div className="mt-1 border border-black">
                <CodeEditor
                  value={jsContent}
                  onValueChange={handleCodeChange}
                  highlight={highlightWithLineNumbers}
                  padding={10}
                  className="w-full font-mono text-sm editor min-h-[300px]"
                  style={{
                    fontFamily: '"Fira Code", monospace',
                    fontSize: 14,
                    backgroundColor: 'white',
                    borderRadius: 0
                  }}
                />
              </div>
            </div>

            {/* MDX Content */}
            <div>
              <label className="block text-sm font-medium text-black">Documentation (MDX)</label>
              <textarea
                value={mdxContent}
                onChange={(e) => setMdxContent(e.target.value)}
                className="mt-1 block w-full border border-black px-3 py-2 font-mono text-sm"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Annotation</label>
              <textarea
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                className="mt-1 block w-full border border-black px-3 py-2 font-mono text-sm"
                rows={3}
              />
            </div>

            {/* Controls Configuration */}
            <div className="border-t border-black pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-black">Controls</h3>
                <select
                  value={controlsOrientation}
                  onChange={(e) => setControlsOrientation(e.target.value as 'horizontal' | 'vertical')}
                  className="border border-black px-2 py-1 text-sm"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-black">Sliders</h4>
                  <button
                    type="button"
                    onClick={addSlider}
                    className="px-2 py-1 bg-black text-white text-sm"
                  >
                    Add Slider
                  </button>
                </div>
                {sliders.map((slider, index) => (
                  <div key={index} className="space-y-2 border border-black p-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Slider {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeSlider(index)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slider.name}
                      onChange={(e) => updateSlider(index, 'name', e.target.value)}
                      placeholder="Variable name"
                      className="block w-full border border-black px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={slider.label}
                      onChange={(e) => updateSlider(index, 'label', e.target.value)}
                      placeholder="Display label"
                      className="block w-full border border-black px-2 py-1 text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={slider.min}
                        onChange={(e) => updateSlider(index, 'min', e.target.value)}
                        placeholder="Min"
                        className="border border-black px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        value={slider.max}
                        onChange={(e) => updateSlider(index, 'max', e.target.value)}
                        placeholder="Max"
                        className="border border-black px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        value={slider.step}
                        onChange={(e) => updateSlider(index, 'step', e.target.value)}
                        placeholder="Step"
                        className="border border-black px-2 py-1 text-sm"
                      />
                    </div>
                    <input
                      type="number"
                      value={slider.initial}
                      onChange={(e) => updateSlider(index, 'initial', e.target.value)}
                      placeholder="Initial value"
                      className="block w-full border border-black px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-black">Toggles</h4>
                  <button
                    type="button"
                    onClick={addToggle}
                    className="px-2 py-1 bg-black text-white text-sm"
                  >
                    Add Toggle
                  </button>
                </div>
                {toggles.map((toggle, index) => (
                  <div key={index} className="space-y-2 border border-black p-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Toggle {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeToggle(index)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={toggle.name}
                      onChange={(e) => updateToggle(index, 'name', e.target.value)}
                      placeholder="Variable name"
                      className="block w-full border border-black px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={toggle.label}
                      onChange={(e) => updateToggle(index, 'label', e.target.value)}
                      placeholder="Display label"
                      className="block w-full border border-black px-2 py-1 text-sm"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={toggle.initial}
                        onChange={(e) => updateToggle(index, 'initial', e.target.checked)}
                        className="border border-black"
                      />
                      <span className="text-sm">Initial value</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Contained Preview */}
        <div className="flex-1 p-8 bg-gray-50">
          <div className="h-full bg-white border border-black">
            <P5Playground 
              sketchPath={previewSketchPath}
              isEmbedded={true}
              isPreview={true}
              previewData={{
                html_content: htmlContent,
                js_content: jsContent,
                css_content: cssContent,
                mdx_content: mdxContent,
                config: {
                  title,
                  annotation,
                  controlsOrientation,
                  sliders,
                  toggles
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 