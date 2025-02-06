'use client'

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prism-themes/themes/prism-shades-of-purple.css';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

import { ConfigVariable, Config } from './types';
import ConfigControls from './ConfigControls';

// Create a dynamic import for the Editor with SSR disabled
const CodeEditor = dynamic(
  () => import('react-simple-code-editor').then((mod) => mod.default),
  { ssr: false }
);

interface P5PlaygroundProps {
  sketchPath: string;
  isEmbedded?: boolean;
}

const P5Playground: React.FC<P5PlaygroundProps> = ({ sketchPath, isEmbedded = false }) => {
  const [pendingCode, setPendingCode] = useState('');
  const [configVars, setConfigVars] = useState<ConfigVariable[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mdxContent, setMdxContent] = useState<MDXRemoteSerializeResult | null>(null);
  const [sketchTitle, setSketchTitle] = useState('Sketch'); // Add state for title

  const [autoRun, setAutoRun] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [annotation, setAnnotation] = useState<string | null>(null);

  useEffect(() => {
    setConfigVars([]);
    
    fetch(`${sketchPath}/config.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Config file not found');
        }
        return response.json();
      })
      .then((config: Config) => {
        if (config.title) {
          setSketchTitle(config.title);
        }
        if (config.annotation) {
          setAnnotation(config.annotation);
        }
        
        const sliderVars = config.sliders?.map(slider => ({
          name: slider.name,
          value: slider.initial,
          type: 'number' as const,
          min: slider.min,
          max: slider.max,
          step: slider.step
        })) || [];

        const toggleVars = config.toggles?.map(toggle => ({
          name: toggle.name,
          value: toggle.initial,
          type: 'boolean' as const,
          label: toggle.label
        })) || [];

        setConfigVars([...sliderVars, ...toggleVars]);
      })
      .catch(() => {
        console.log('No config file found or invalid JSON - continuing without config');
        setConfigVars([]); // Ensure configVars is empty array if no config
        setAnnotation(null);  // Reset annotation on error
      });

    // Fetch the index.js file for the editor
    fetch(`${sketchPath}/index.js`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch index.js: ${response.statusText}`);
        }
        return response.text();
      })
      .then((jsData) => {
        setPendingCode(jsData);
        // Remove the activeCode setting
        if (autoRun) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'codeUpdate',
            code: jsData
          }, '*');
        }
      })
      .catch((err) => console.error(err));

    // Add MDX fetch
    fetch(`${sketchPath}/content.mdx`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch content.mdx: ${response.statusText}`);
        }
        return response.text();
      })
      .then(async (mdxText) => {
        const serialized = await serialize(mdxText, {
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }
        });
        setMdxContent(serialized);
      })
      .catch(() => {
        console.log('No content.mdx file found - continuing without documentation');
        setMdxContent(null);
      });
  }, [sketchPath, autoRun]);

  // Effect to update the global config variables when slider/toggle values change.
  useEffect(() => {
    configVars.forEach(({ name, value }) => {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'configUpdate',
        name: `fx.${name}`,
        value
      }, '*');
    });
  }, [configVars]);

  // Add new effect to inject variables when iframe loads
  useEffect(() => {
    const handleIframeLoad = () => {
      configVars.forEach(({ name, value }) => {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'configUpdate',
          name: `fx.${name}`,
          value
        }, '*');
      });
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      return () => iframe.removeEventListener('load', handleIframeLoad);
    }
  }, [configVars]);

  // Update the config change handler to post messages to iframe
  const handleConfigChange = (name: string, value: number | boolean) => {
    setConfigVars((prev) =>
      prev.map((config) =>
        config.name === name ? { ...config, value } : config
      )
    );
    
    // Send message to iframe instead of setting window variable directly
    iframeRef.current?.contentWindow?.postMessage({
      type: 'configUpdate',
      name: `fx.${name}`,
      value
    }, '*');
  };

  // Update runSketch to properly clean up and reinitialize
  const runSketch = () => {
    console.log('Playground: Running sketch');
    
    try {
      setError(null);
      new Function(pendingCode); // Syntax check
      
      // Send message to remove existing sketch first
      iframeRef.current?.contentWindow?.postMessage({
        type: 'cleanup'
      }, '*');

      // Small delay to allow cleanup before rerunning
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'codeUpdate',
          code: pendingCode
        }, '*');
      }, 50);
      
    } catch (error) {
      console.error('Syntax error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Update handleCodeChange to include cleanup
  const handleCodeChange = (code: string) => {
    setPendingCode(code);
    if (autoRun) {
      const timeoutId = setTimeout(() => {
        try {
          new Function(code); // Syntax check
          
          // Send cleanup message first
          iframeRef.current?.contentWindow?.postMessage({
            type: 'cleanup'
          }, '*');

          // Small delay to allow cleanup
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: 'codeUpdate',
              code: code
            }, '*');
          }, 50);
          
          setError(null);
        } catch (error) {
          console.error('Syntax error:', error);
          setError(error instanceof Error ? error.message : 'Unknown error');
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <div className={`${isEmbedded ? 'h-screen' : 'h-full'} flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden`}>
      {/* Title Div: Spans full width */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">
          {sketchTitle}
        </h2>
      </div>

      {/* Main Content: Modified to include MDX and Code panels conditionally */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* MDX Documentation Panel - Hide on screens smaller than lg */}
        <div className="hidden lg:block lg:w-[25%] border-r border-gray-200 dark:border-gray-700 overflow-auto">
          <div className="p-4 prose dark:prose-invert prose-sm md:prose-base max-w-none">
            {mdxContent ? (
              <MDXRemote {...mdxContent} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No documentation available</p>
            )}
          </div>
        </div>
        
        {/* Editor Panel - Hide on screens smaller than md */}
        <div className="hidden md:flex flex-1 lg:w-[35%] border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Add error display */}
          {error && (
            <div className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 text-sm">
              <p className="font-mono">{error}</p>
            </div>
          )}
          <div className="flex-1 px-4 relative">
            <div className="absolute inset-0 overflow-auto">
              <CodeEditor
                value={pendingCode}
                onValueChange={handleCodeChange}
                highlight={(code) =>
                  highlight(code, languages.javascript, 'javascript')
                }
                padding={10}
                className="w-full min-h-full font-mono text-sm bg-editor-bg text-gray-200 border border-editor-border line-numbers"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '14px',
                }}
                preClassName="line-numbers"
              />
            </div>
          </div>
        </div>
        
        {/* Sketch Panel - Always visible */}
        <div className="h-[400px] lg:h-auto lg:w-[40%] bg-white dark:bg-gray-950 flex flex-col">
          {annotation && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30">
              <p 
                className="text-sm text-yellow-800 dark:text-yellow-200"
                dangerouslySetInnerHTML={{ __html: annotation }}
              />
            </div>
          )}
          <div className="w-full flex-1 flex items-center justify-center">
            <iframe 
              ref={iframeRef}
              className="w-full h-full" 
              src={`${sketchPath}/index.html`} 
            />
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={runSketch}
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Run Sketch
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 rounded"
            />
            <span>Auto-run</span>
          </label>
          <ConfigControls 
            configVars={configVars}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>
    </div>
  );
};

export default P5Playground;
