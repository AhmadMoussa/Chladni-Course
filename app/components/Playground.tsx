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

import { ConfigVariable, SliderConfig, ToggleConfig, Config } from './types';
import ConfigControls from './ConfigControls';
import VerticalCollapseButton from './VerticalCollapseButton';
import P5Frame from './P5Frame';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faCode } from '@fortawesome/free-solid-svg-icons'


// Create a dynamic import for the Editor with SSR disabled
const CodeEditor = dynamic(
  () => import('react-simple-code-editor').then((mod) => mod.default),
  { ssr: false }
);

interface P5PlaygroundProps {
  sketchPath: string;
  isEmbedded?: boolean;
  isPreview?: boolean;
  previewData?: {
    html_content: string;
    js_content: string;
    css_content: string;
    mdx_content?: string;
    config?: Config;
  };
}

const P5Playground: React.FC<P5PlaygroundProps> = ({ 
  sketchPath, 
  isEmbedded = false, 
  isPreview = false,
  previewData 
}) => {
  const [pendingCode, setPendingCode] = useState('');
  const [configVars, setConfigVars] = useState<ConfigVariable[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mdxContent, setMdxContent] = useState<MDXRemoteSerializeResult | null>(null);
  const [sketchTitle, setSketchTitle] = useState('Sketch');
  const [autoRun, setAutoRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [annotation, setAnnotation] = useState<string | null>(null);

  // New state to manage copy feedback
  const [copiedURL, setCopiedURL] = useState(false);
  const [copiedEmbedCode, setCopiedEmbedCode] = useState(false);

  // New state to manage MDX panel visibility
  const [isMdxCollapsed, setIsMdxCollapsed] = useState(false);

  // Add new state for config controls
  const [configOrientation, setConfigOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const copyURL = () => {
    const host = typeof window !== 'undefined' ? window.location.origin : '';
    const embedCode = `${host}/embed${sketchPath}`;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => { setCopiedURL(true); setTimeout(() => setCopiedURL(false), 2000); })
  };
  
  const copyEmbedCode = () => {
    const host = typeof window !== 'undefined' ? window.location.origin : '';
    const embedCode = `<iframe src="${host}/embed${sketchPath}" width="600" height="400" frameborder="0" allowfullscreen></iframe>`;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => { setCopiedEmbedCode(true); setTimeout(() => setCopiedEmbedCode(false), 2000); })
  };

  useEffect(() => {
    setConfigVars([]);
    
    // If preview data is provided, use it directly instead of fetching
    if (previewData) {
      const sketch = previewData;
      
      if (sketch.config) {
        const configData = sketch.config;
        
        if (configData.title) {
          setSketchTitle(configData.title);
        }
        if (configData.annotation) {
          setAnnotation(configData.annotation);
        }
        if (configData.controlsOrientation) {
          setConfigOrientation(configData.controlsOrientation);
        }
        
        const sliderVars = configData.sliders?.map(slider => ({
          name: slider.name,
          value: slider.initial,
          type: 'number' as const,
          min: slider.min,
          max: slider.max,
          step: slider.step,
          label: slider.label
        })) || [];

        const toggleVars = configData.toggles?.map(toggle => ({
          name: toggle.name,
          value: toggle.initial,
          type: 'boolean' as const,
          label: toggle.label
        })) || [];

        setConfigVars([...sliderVars, ...toggleVars]);
      }

      // Set up preview content
      setPendingCode(sketch.js_content);
      
      if (sketch.mdx_content) {
        serialize(sketch.mdx_content, {
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }
        }).then(setMdxContent);
      }
      
      return;
    }

    // Original fetch logic for non-preview mode
    fetch(`/api/${sketchPath}`)
      .then(response => {

        return response.text().then(text => {

          try {
            return JSON.parse(text);
          } catch (e) {
  
            throw new Error(`Invalid JSON response: ${text}`);
          }
        });
      })
      .then(sketch => {
        if (sketch.config) {
          let configData;
          try {
           
            // Check if config is already an object
            configData = typeof sketch.config === 'string' 
              ? JSON.parse(sketch.config) 
              : sketch.config;

            if (configData.title) {
              setSketchTitle(configData.title);
            }
            if (configData.annotation) {
              setAnnotation(configData.annotation);
            }
            if (configData.controlsOrientation) {
              setConfigOrientation(configData.controlsOrientation);
            }
            
            const sliderVars = configData.sliders?.map((slider: SliderConfig) => ({
              name: slider.name,
              value: slider.initial,
              type: 'number' as const,
              min: slider.min,
              max: slider.max,
              step: slider.step,
              label: slider.label
            })) || [];

            const toggleVars = configData.toggles?.map((toggle: ToggleConfig) => ({
              name: toggle.name,
              value: toggle.initial,
              type: 'boolean' as const,
              label: toggle.label
            })) || [];

            setConfigVars([...sliderVars, ...toggleVars]);
          } catch (error) {
            console.error('Error parsing config:', error);
            setError('Invalid sketch configuration');
          }
        }

        // Set up HTML content
        const htmlDoc = new DOMParser().parseFromString(sketch.html_content, 'text/html');
        const scriptElement = htmlDoc.createElement('script');
        scriptElement.setAttribute('id', 'sketchCode');
        scriptElement.textContent = sketch.js_content;
        htmlDoc.body.appendChild(scriptElement);
        
        // Set up CSS
        const styleElement = htmlDoc.createElement('style');
        styleElement.textContent = sketch.css_content;
        htmlDoc.head.appendChild(styleElement);
        
        const newIframe = document.createElement('iframe');
        newIframe.className = 'w-full h-full';
        newIframe.srcdoc = htmlDoc.documentElement.outerHTML;
        setPendingCode(sketch.js_content);
        
        if (sketch.mdx_content) {
          serialize(sketch.mdx_content, {
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            }
          }).then(setMdxContent);
        }

        // Replace the old iframe with the new one
        if (iframeRef.current?.parentNode) {
          iframeRef.current.parentNode.replaceChild(newIframe, iframeRef.current);
          iframeRef.current = newIframe;
        }
      })
      .catch(error => {
        console.error('Error details:', error);
        setError(error.message || 'Failed to load sketch');
      });
  }, [sketchPath, previewData]);

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
    try {
      console.log("run sketch")
      console.log(pendingCode)
      iframeRef.current?.contentWindow?.postMessage({
        type: 'codeUpdate',
        code: pendingCode
      }, '*');
      
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

  if (isPreview) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Title Bar */}
        <div className="p-4 border-b border-black bg-white flex items-center justify-between">
          <h2 className="text-m font-bold text-black">
            {sketchTitle}
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor and Preview container */}
          <div className="flex-1 flex flex-col">
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
                        borderRadius: 0
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-[53%] flex flex-col border-l border-black">
                <div className="flex-1 flex">
                  <div className="flex-1 bg-white flex flex-col">
                    {annotation && (
                      <div className="p-4 bg-white border-b border-black">
                        <p 
                          className="text-sm text-black"
                          dangerouslySetInnerHTML={{ __html: annotation }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <P5Frame
                        ref={iframeRef}
                        htmlContent={previewData?.html_content || ''}
                        cssContent={previewData?.css_content}
                        sketchPath={sketchPath}
                        activeCode={pendingCode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Controls */}
            {configOrientation === 'horizontal' && (
              <div className="border-t border-black">
                <ConfigControls 
                  configVars={configVars}
                  onConfigChange={handleConfigChange}
                  orientation="horizontal"
                  autoRun={autoRun}
                  onAutoRunChange={(checked) => setAutoRun(checked)}
                  onRunSketch={runSketch}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isEmbedded ? 'h-screen' : 'h-full'} flex flex-col overflow-hidden`}
         style={{
           backgroundColor: 'var(--bg-color)',
           color: 'var(--font-color)',
           border: `1px solid var(--border-color)`
         }}>
      {/* Title Div: Spans full width */}
      <div className=" border-b border-black bg-white flex items-center justify-between">
        <h2 className="text-m font-bold text-black mx-2 my-1">
          {sketchTitle}
        </h2>
        <div className="flex items-center">
          <button
            onClick={copyURL}
            className="bg-white border border-l-black text-black px-2 py-1 hover:bg-[#16DF81] hover:text-white"
          >
            {copiedURL ? <FontAwesomeIcon icon={faLink} className="text-green-500" /> : <FontAwesomeIcon icon={faLink} />}
          </button>
          <button
            onClick={copyEmbedCode}
            className="bg-white border border-l-black text-black px-2 py-1 hover:bg-[#16DF81] hover:text-white"
          >
            {copiedEmbedCode ? <FontAwesomeIcon icon={faCode} className="text-green-500" /> : <FontAwesomeIcon icon={faCode} />}
          </button>
        </div>
      </div>

      {/* Main Content: Horizontal layout with MDX on left */}
      <div className="flex-1 flex overflow-hidden">
        {/* MDX Documentation Panel - Only show if mdxContent exists */}
        {mdxContent && (
          <div className={`${isMdxCollapsed ? 'w-8' : 'w-[25%]'} transition-all duration-300 flex min-w-0`}>
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
                <div className="h-full flex min-w-0">
                  <div className="flex-1 relative min-w-0">
                    <div className="p-4 text-black prose max-w-none text-sm h-full overflow-y-auto">
                      <div className="overflow-x-auto break-words pr-4 max-w-full">
                        <MDXRemote {...mdxContent} />
                      </div>
                    </div>
                  </div>
                  <VerticalCollapseButton
                    onClick={() => setIsMdxCollapsed(true)}
                    position="right"
                  />
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
                    className="w-full min-h-full font-mono text-sm editor "
                    style={{
                      fontFamily: '"Fira Code", monospace',
                      fontSize: 14,
                      backgroundColor: 'white',
                      borderRadius: 0
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
                <ConfigControls 
                  configVars={configVars}
                  onConfigChange={handleConfigChange}
                  orientation="horizontal"
                  autoRun={autoRun}
                  onAutoRunChange={(checked) => setAutoRun(checked)}
                  onRunSketch={runSketch}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default P5Playground;
