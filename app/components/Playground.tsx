'use client'

import React, { useEffect, useRef, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prism-themes/themes/prism-shades-of-purple.css';


import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

import { ConfigVariable, Config } from './types';
import ConfigControls from './ConfigControls';


interface P5PlaygroundProps {
  // The path to the sketch directory (e.g. '/sketches/mySketch/')
  sketchPath: string;
}

const P5Playground: React.FC<P5PlaygroundProps> = ({ sketchPath }) => {
  // mounted flag to avoid hydration mismatch.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // pendingCode is what you edit, activeCode is what is
  // currently running in the sketch.
  const [pendingCode, setPendingCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [configVars, setConfigVars] = useState<ConfigVariable[]>([]);
  const [htmlContent, setHtmlContent] = useState(''); // New state for HTML content
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Add autoRun state
  const [autoRun, setAutoRun] = useState(false);


  // Modify the fetch effect to also load the config file
  useEffect(() => {

    // Fetch config.json first
    fetch(`${sketchPath}/config.json`)
      .then(response => response.json())
      .then((config: Config) => {
        // Initialize configVars only if they haven't been set yet
        setConfigVars(prevVars => {
          if (prevVars.length === 0) {
            return config.sliders.map(slider => ({
              name: slider.name,
              value: slider.initial,
              type: 'number',
              min: slider.min,
              max: slider.max,
              step: slider.step
            }));
          }
          return prevVars;
        });
      })
      .catch(err => console.error('Error loading config:', err));

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
        setActiveCode(jsData);
      })
      .catch((err) => console.error(err));

    // Fetch the index.html file for the iframe
    fetch(`${sketchPath}/index.html`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch index.html: ${response.statusText}`);
        }
        return response.text();
      })
      .then((html) => {
        setHtmlContent(html);
      })
      .catch((err) => console.error(err));
  }, [sketchPath]);

  // Effect to update the global config variables when slider/toggle values change.
  useEffect(() => {
    configVars.forEach(({ name, value }) => {
      // Update the global variable so that the draw function sees the new value.
      // @ts-expect-error - Dynamic window property assignment with variable name
      window[name] = value;
    });
  }, [configVars]);

  // Modify the iframe update effect to only run when code or HTML content changes
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      
      const modifiedCode = activeCode.replace(
        /const\s+(\w+)\s*=\s*(\d+(\.\d+)?|true|false)/g,
        (match, name) => {
          // Use the current value from configVars
          const configVar = configVars.find(v => v.name === name);
          return `window.${name} = ${configVar?.value ?? match};`
        }
      );

      // Insert the modified code into the HTML content
      const modifiedHtml = htmlContent.replace(
        /<script src="index.js"><\/script>/,
        `<script>
          // Setup message listener for config updates
          window.addEventListener('message', (event) => {
            if (event.data.type === 'configUpdate') {
              window[event.data.name] = event.data.value;
            } else if (event.data.type === 'initConfig') {
              Object.entries(event.data.values).forEach(([name, value]) => {
                window[name] = value;
              });
            }
          });

          ${modifiedCode}
        </script>`
      );

      // Update all other resource paths to be relative to the sketch directory
      const finalHtml = modifiedHtml.replace(
        /(src|href)="(?!http|\/\/|data:)([^"]+)"/g,
        `$1="${sketchPath}/$2"`
      );

      iframe.srcdoc = finalHtml;

      // Send initial values after a short delay to ensure the iframe is ready
      setTimeout(() => {
        const initialMessage = {
          type: 'initConfig',
          values: configVars.reduce((acc, {name, value}) => {
            acc[name] = value;
            return acc;
          }, {} as Record<string, number | boolean>)
        };
        iframe.contentWindow?.postMessage(initialMessage, '*');
      }, 100);
    }
  }, [activeCode, htmlContent]); // Remove configVars from dependencies

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
      name,
      value
    }, '*');
  };

  // Handler for "Run Sketch" button.
  // This updates the active code (and re-extracts config variables) to re-run the sketch.
  const runSketch = () => {
    setActiveCode(pendingCode);
    
  };

  // Modify the Editor's onValueChange handler
  const handleCodeChange = (code: string) => {
    setPendingCode(code);
    if (autoRun) {
      setActiveCode(code);
    }
  };

  // Only render after the component is mounted.
  if (!isMounted) return null;

  return (
    <div className="h-full m-12 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Title Div: Spans full width */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">
          Sketch
        </h2>
      </div>

      {/* Main Content: Switches between row and column based on screen size */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      
        
        {/* Editor Panel - Full width on small screens, 45% on large */}
        <div className="flex-1 lg:w-[45%] border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex-1 px-4 relative">
            <div className="absolute inset-0 overflow-auto">
              <div className="relative" style={{ minHeight: '300px' }}>
                <Editor
                  value={pendingCode}
                  onValueChange={handleCodeChange}
                  highlight={(code) =>
                    highlight(code, languages.javascript, 'javascript')
                  }
                  padding={10}
                  className="w-full font-mono text-sm bg-editor-bg text-gray-200 border border-editor-border line-numbers"
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: '16px',
                    minHeight: '300px'
                  }}
                  preClassName="line-numbers"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Sketch Panel - Full width on small screens, 55% on large */}
        <div className="h-[400px] lg:h-auto lg:w-[55%] bg-white dark:bg-gray-950 flex items-center justify-center">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="p5-sketch"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
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
