export const defaultHtml = `<!DOCTYPE html>
<html lang="en">
    <head>
        <script src="/libraries/p5.min.js"></script>
    </head>
    <body>
        <script>
            window.fx = {};
            let sketch;

            window.addEventListener('message', function(event) {
                if (event.data.type === 'cleanup') {
                    if (sketch) {
                        sketch.remove();
                        sketch = null; 
                    }
                }
                else if (event.data.type === 'codeUpdate') {
                    try {
                        const sketchFunction = new Function(event.data.code);
                        sketch = new p5(sketchFunction);
                        document.getElementById("defaultCanvas1").remove();
                    } catch (error) {
                        console.error('Error running sketch:', error);
                    }
                }
                else if (event.data.type === 'configUpdate') {
                    const parts = event.data.name.split('.');
                    if (parts[0] === 'fx') {
                        window[parts[0]] = window[parts[0]] || {};
                        window[parts[0]][parts[1]] = event.data.value;
                    }
                }
            });
        </script>
    </body>
</html>`;

export const defaultCss = `html, body {
  margin: 0;
  padding: 0;
  background: #000;
  overflow: hidden;
}

main {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #DDD;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

canvas {
  display: block !important;
  margin: 0 auto !important;
  object-fit: contain;
  max-height: 100%;
  max-width: 100%;
}`; 