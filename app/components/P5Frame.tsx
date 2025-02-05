import React, { useEffect, forwardRef } from 'react';

interface P5FrameProps {
  htmlContent: string;
  sketchPath: string;
  activeCode: string;
}

const P5Frame = forwardRef<HTMLIFrameElement, P5FrameProps>(
  ({ htmlContent, sketchPath, activeCode }, ref) => {
    // Effect to initialize the iframe with HTML content
    useEffect(() => {
      if (ref && 'current' in ref && ref.current && htmlContent) {
        const iframe = ref.current;
        
        // Modify HTML content to use absolute paths
        const modifiedHtml = htmlContent
          .replace(/src="libraries\//g, `src="${sketchPath}/libraries/`)
          .replace(/href="style.css"/g, `href="${sketchPath}/style.css"`);
        
        // Set the initial HTML content
        iframe.srcdoc = modifiedHtml;

        const handleLoad = () => {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) return;

          // Remove the original script if it exists
          const oldScript = iframeDoc.querySelector('script[src="index.js"]');
          oldScript?.parentNode?.removeChild(oldScript);

          // Create and append the message handler script
          const messageScript = iframeDoc.createElement('script');
          messageScript.textContent = `
            window.addEventListener('message', function(event) {
              if (event.data.type === 'codeUpdate') {
                // Remove existing sketch script if any
                const oldSketch = document.getElementById('sketch-script');
                if (oldSketch) oldSketch.remove();
                
                // Create and append new sketch script
                const sketchScript = document.createElement('script');
                sketchScript.id = 'sketch-script';
                sketchScript.textContent = event.data.code;
                document.body.appendChild(sketchScript);
              }
            });
          `;
          iframeDoc.body.appendChild(messageScript);

          // Create and append the initial sketch script
          if (activeCode) {
            const sketchScript = iframeDoc.createElement('script');
            sketchScript.id = 'sketch-script';
            sketchScript.textContent = activeCode;
            iframeDoc.body.appendChild(sketchScript);
          }
        };
        
        iframe.addEventListener('load', handleLoad);
        return () => iframe.removeEventListener('load', handleLoad);
      }
    }, [htmlContent, sketchPath, activeCode, ref]);

    return (
      <iframe
        ref={ref}
        className="w-full h-full border-2 border-gray-200"
        title="p5-sketch"
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
);

P5Frame.displayName = 'P5Frame';

export default P5Frame; 