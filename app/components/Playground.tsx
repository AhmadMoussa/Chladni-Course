'use client'

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prism-themes/themes/prism-gruvbox-light.css';
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

  // New state to manage MDX panel visibility
  const [isMdxCollapsed, setIsMdxCollapsed] = useState(false);

  // Add new state for config controls
  const [configOrientation, setConfigOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

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
    
    // Create a new iframe when sketch changes
    const newIframe = document.createElement('iframe');
    newIframe.className = 'w-full h-full';
    newIframe.src = `${sketchPath}/index.html`;

    // Replace the old iframe with the new one
    if (iframeRef.current?.parentNode) {
      iframeRef.current.parentNode.replaceChild(newIframe, iframeRef.current);
      iframeRef.current = newIframe;
    }
    
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
        if (config.controlsOrientation) {
          setConfigOrientation(config.controlsOrientation);
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
          // Wait for the new iframe to load before sending code
          newIframe.onload = () => {
            setTimeout(() => {
              iframeRef.current?.contentWindow?.postMessage({
                type: 'codeUpdate',
                code: jsData
              }, '*');
            }, 50);
          };
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

      // Create a new iframe element
      const newIframe = document.createElement('iframe');
      newIframe.className = 'w-full h-full';
      newIframe.src = `${sketchPath}/index.html`;

      // Replace the old iframe with the new one
      if (iframeRef.current?.parentNode) {
        iframeRef.current.parentNode.replaceChild(newIframe, iframeRef.current);
        iframeRef.current = newIframe;

        // Wait for the new iframe to load before sending the code
        newIframe.onload = () => {
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: 'codeUpdate',
              code: pendingCode
            }, '*');

            // Reapply config variables
            configVars.forEach(({ name, value }) => {
              iframeRef.current?.contentWindow?.postMessage({
                type: 'configUpdate',
                name: `fx.${name}`,
                value
              }, '*');
            });
          }, 50);
        };
      }
      
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

  // Replace the highlight function in the CodeEditor component with this:
  const highlightWithLineNumbers = (code: string) => {
    return highlight(code, languages.javascript, 'javascript')
      .split('\n')
      .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
      .join('\n');
  };

  return (
    <div className={`${isEmbedded ? 'h-screen' : 'h-full'} flex flex-col overflow-hidden`}
         style={{
           backgroundColor: 'var(--bg-color)',
           color: 'var(--font-color)',
           border: `1px solid var(--border-color)`
         }}>
      {/* Title Div: Spans full width */}
      <div className="p-4 border-b border-black bg-white flex items-center justify-between">
        <h2 className="text-m font-bold text-black">
          {sketchTitle}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={copyEmbedCode}
            className="bg-white border border-black text-black px-2 py-1 hover:bg-[#16DF81] hover:text-white"
          >
            {copied ? 'Copied!' : 'Copy Embed Code'}
          </button>
        </div>
      </div>

      {/* Main Content: Horizontal layout with MDX on left */}
      <div className="flex-1 flex overflow-hidden">
        {/* MDX Documentation Panel - Only show if mdxContent exists */}
        {mdxContent && (
          <div className={`${isMdxCollapsed ? 'w-8' : 'w-[25%]'} transition-all duration-300 flex`}>
            <div className={`flex-1 border-r border-black overflow-hidden ${isMdxCollapsed ? 'bg-white' : ''}`}>
              {isMdxCollapsed ? (
                <div 
                  className="h-full flex items-center justify-center cursor-pointer"
                  onClick={() => setIsMdxCollapsed(false)}
                >
                  <span className="rotate-180 whitespace-nowrap text-black text-sm"
                        style={{ writingMode: 'vertical-rl' }}>
                    Explanation
                  </span>
                </div>
              ) : (
                <div className="h-full flex">
                  <div className="flex-1 relative">
                    <div className="p-4 text-black prose max-w-none text-sm h-full overflow-y-auto">
                      <MDXRemote {...mdxContent} />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMdxCollapsed(true)}
                    className="w-4 h-full border-l border-black bg-white hover:bg-gray-50 flex items-center justify-center"
                  >
                    ←
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Editor, Sketch, and Controls container */}
        <div className="flex-1 flex flex-col">
          {/* Editor and Sketch container */}
          <div className="flex-1 flex">
            {/* Editor Panel */}
            <div className="w-[47%] flex flex-col">
              {error && (
                <div className="px-4 py-2 bg-red text-black text-sm">
                  <p className="font-mono">{error}</p>
                </div>
              )}
              <div className="flex-1 px-4 relative">
                <div className="absolute inset-0 overflow-auto">
                  <CodeEditor
                    value={pendingCode}
                    onValueChange={handleCodeChange}
                    highlight={highlightWithLineNumbers}
                    padding={10}
                    className="w-full min-h-full font-mono text-sm editor"
                    style={{
                      fontFamily: '"Fira Code", monospace',
                      fontSize: 14,
                      backgroundColor: 'white',
                      borderRadius: 0,
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Sketch Panel */}
            <div className="w-[53%] flex flex-col border-l border-black">
              <div className="flex-1 flex">
                {/* Sketch Container */}
                <div className="flex-1 bg-white flex flex-col">
                  {annotation && (
                    <div className="p-4 bg-white border-b border-black">
                      <p 
                        className="text-sm text-black"
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

                {/* Vertical Config Controls */}
                {configOrientation === 'vertical' && (
                  <div className="border-l border-black">
                    <ConfigControls 
                      configVars={configVars}
                      onConfigChange={handleConfigChange}
                      orientation="vertical"
                      isCollapsed={isConfigCollapsed}
                      onCollapse={() => setIsConfigCollapsed(!isConfigCollapsed)}
                      autoRun={autoRun}
                      onAutoRunChange={(checked) => setAutoRun(checked)}
                      onRunSketch={runSketch}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Config Controls */}
          {configOrientation === 'horizontal' && (
            <div className="bg-white border-t border-black px-0 py-0">
              <div className="flex items-center h-full">
                <div className="flex items-center gap-4 h-full">
                  <button
                    onClick={runSketch}
                    className="bg-white border border-r-black text-black px-4 py-2 hover:bg-[#814EF9] hover:text-white transition-colors font-medium text-sm m-0 h-full"
                  >
                    Run Sketch
                  </button>
                  <label className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={autoRun}
                      onChange={(e) => setAutoRun(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-black"
                    />
                    <span>Auto-run</span>
                  </label>
                </div>
                <div className="ml-auto">
                  <ConfigControls 
                    configVars={configVars}
                    onConfigChange={handleConfigChange}
                    orientation="horizontal"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default P5Playground;
