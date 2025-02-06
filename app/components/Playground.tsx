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
  const [sketchTitle, setSketchTitle] = useState('Sketch');
  const [autoRun, setAutoRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [annotation, setAnnotation] = useState<string | null>(null);

  // New state to manage copy feedback
  const [copied, setCopied] = useState(false);

  // Function to copy the embed code snippet into the clipboard
  const copyEmbedCode = () => {
    // Safely get the host if available
    const host = typeof window !== 'undefined' ? window.location.origin : '';
    const embedCode = `<iframe src="${host}/embed${sketchPath}" width="600" height="400" frameborder="0" allowfullscreen></iframe>`;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        setCopied(true);
        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error("Failed to copy embed code:", err));
  };

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
          step: slider.step,
          label: slider.label
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
        setConfigVars([]);
        setAnnotation(null);
      });

    fetch(`${sketchPath}/index.js`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch index.js: ${response.statusText}`);
        }
        return response.text();
      })
      .then((jsData) => {
        setPendingCode(jsData);
        if (autoRun) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'codeUpdate',
            code: jsData
          }, '*');
        }
      })
      .catch((err) => console.error(err));

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

  useEffect(() => {
    configVars.forEach(({ name, value }) => {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'configUpdate',
        name: `fx.${name}`,
        value
      }, '*');
    });
  }, [configVars]);

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

  const handleConfigChange = (name: string, value: number | boolean) => {
    setConfigVars((prev) =>
      prev.map((config) =>
        config.name === name ? { ...config, value } : config
      )
    );

    iframeRef.current?.contentWindow?.postMessage({
      type: 'configUpdate',
      name: `fx.${name}`,
      value
    }, '*');
  };

  const runSketch = () => {
    console.log('Playground: Running sketch');
    
    try {
      setError(null);
      new Function(pendingCode);
      iframeRef.current?.contentWindow?.postMessage({
        type: 'cleanup'
      }, '*');

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

  const handleCodeChange = (code: string) => {
    setPendingCode(code);
    if (autoRun) {
      const timeoutId = setTimeout(() => {
        try {
          new Function(code);
          
          iframeRef.current?.contentWindow?.postMessage({
            type: 'cleanup'
          }, '*');

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
    <div className={`${isEmbedded ? 'h-screen' : 'h-full'} flex flex-col bg-white dark:bg-gray-800 shadow-lg overflow-hidden`}>
      {/* Title Div: Spans full width */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-m font-bold text-gray-700 dark:text-gray-300">
          {sketchTitle}
        </h2>
        {/* Updated Copy Embed Code button */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyEmbedCode}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md"
          >
            {copied ? 'Copied!' : 'Copy Embed Code'}
          </button>
        </div>
      </div>

      {/* Main Content: Non-responsive (always horizontal) */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* MDX Documentation Panel - Always visible */}
        <div className="w-[25%] border-r border-gray-200 dark:border-gray-700 overflow-auto">
          <div className="p-4 prose dark:prose-invert prose-sm max-w-none text-sm">
            {mdxContent ? (
              <MDXRemote {...mdxContent} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No documentation available</p>
            )}
          </div>
        </div>
        
        {/* Editor Panel - Always visible */}
        <div className="w-[35%] flex flex-col border-l border-r border-gray-200 dark:border-gray-700">
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
                  fontFamily: 'var(--font-fira-code)',
                  fontSize: '14px',
                }}
                preClassName="line-numbers"
              />
            </div>
          </div>
        </div>
        
        {/* Sketch Panel - Always visible */}
        <div className="w-[40%] bg-white dark:bg-gray-950 flex flex-col">
          {annotation && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30">
              <p 
                className="text-sm text-yellow-800 dark:text-yellow-200"
                dangerouslySetInnerHTML={{ __html: annotation }}
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-center">
            <iframe 
              ref={iframeRef}
              className="w-full h-full" 
              src={`${sketchPath}/index.html`} 
            />
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-0 py-0">
        <div className="flex items-center gap-4 h-full">
          <button
            onClick={runSketch}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors font-medium text-sm m-0 h-full"
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
