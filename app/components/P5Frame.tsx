import React, { useEffect, forwardRef } from 'react';

interface P5FrameProps {
  htmlContent: string;
  sketchPath: string;
  activeCode: string;
  cssContent?: string;
}

const P5Frame = forwardRef<HTMLIFrameElement, P5FrameProps>(
  ({ htmlContent, sketchPath, activeCode, cssContent }, ref) => {
    useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        const iframe = ref.current;
        
        // Create a complete HTML document
        const doc = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>${cssContent || ''}</style>
            </head>
            <body>
              ${htmlContent}
              <script>
                ${activeCode}
              </script>
            </body>
          </html>
        `;
        
        // Set the content
        iframe.srcdoc = doc;
      }
    }, [htmlContent, cssContent, activeCode, ref]);

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