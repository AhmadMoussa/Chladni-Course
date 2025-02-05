// Create global variables for sliders and labels
let sliderA, sliderN, sliderM;
let labelA, labelN, labelM;

// Create sketch objects
let leftSketch = new p5(function(p) {
    // Update local variables
    let detail = 22;  // Number of radial divisions
    let radius = 200;
    let time = 0;

    // Control parameters
    let amplitude = 50;
    let n = 5;  // mode number x
    let m = 3;  // mode number y
    let omega = 1;  // angular frequency
    let phase = 0;

    p.setup = function() {
        p.createCanvas(1200, 800, p.WEBGL);
        p.frameRate(60);
        
        // Create sliders in global scope
        sliderA = p.createSlider(10, 80, 30);
        sliderA.position(20, 20);
        labelA = p.createDiv()
            .position(200, 20)
            .style('color', '#000')
            .style('font-family', 'Arial')
            .style('background-color', 'rgba(255, 255, 255, 0.8)')
            .style('padding', '3px 8px')
            .style('border-radius', '3px')
            .style('width', '180px');
        
        sliderN = p.createSlider(1, 8, 7, 1);
        sliderN.position(20, 50);
        labelN = p.createDiv()
            .position(200, 50)
            .style('color', '#000')
            .style('font-family', 'Arial')
            .style('background-color', 'rgba(255, 255, 255, 0.8)')
            .style('padding', '3px 8px')
            .style('border-radius', '3px')
            .style('width', '180px');
        
        sliderM = p.createSlider(1, 8, 3, 1);
        sliderM.position(20, 80);
        labelM = p.createDiv()
            .position(200, 80)
            .style('color', '#000')
            .style('font-family', 'Arial')
            .style('background-color', 'rgba(255, 255, 255, 0.8)')
            .style('padding', '3px 8px')
            .style('border-radius', '3px')
            .style('width', '180px');
            
        
        // Add mouseOver and mouseOut handlers to sliders
        [sliderA, sliderN, sliderM].forEach(slider => {
            slider.mouseOver(() => p.disableOrbitControl = true);
            slider.mouseOut(() => p.disableOrbitControl = false);
        });
    };

    p.draw = function() {
        p.background(220);
        
        if (!p.disableOrbitControl) {
            p.orbitControl();
        }
        
        // Update parameters from sliders
        amplitude = sliderA.value();
        n = sliderN.value();
        m = sliderM.value();
    
        
        // Update labels
        labelA.html(`Amplitude: ${amplitude}`);

        labelN.html(`Radial Mode (n): ${n}`);
        labelM.html(`Angular Mode (m): ${m}`);

  
        
        p.scale(1.2);
        p.rotateX(p.PI/2.6);
        p.translate(0, 0);

        // Draw circular membrane
        for (let i = 0; i < detail; i++) {
            let angle1 = p.map(i, 0, detail, 0, p.TWO_PI);
            let angle2 = p.map(i + 1, 0, detail, 0, p.TWO_PI);

            p.stroke(0);
            p.beginShape(p.QUADS);
            for (let j = 0; j < detail; j++) {
                let r1 = p.map(j, 0, detail, 0, radius);
                let r2 = p.map(j + 1, 0, detail, 0, radius);

                let x1 = r1 * p.cos(angle1);
                let y1 = r1 * p.sin(angle1);
                let z11 = amplitude * p.sin(n * p.PI * r1 / radius) * p.cos(m * angle1) * p.cos(omega * time + phase);
                let z12 = amplitude * p.sin(m * p.PI * r1 / radius) * p.cos(n * angle1) * p.cos(omega * time + phase);
                let z1 = z11 + z12;
                
                let x2 = r2 * p.cos(angle1);
                let y2 = r2 * p.sin(angle1);
                let z21 = amplitude * p.sin(n * p.PI * r2 / radius) * p.cos(m * angle1) * p.cos(omega * time + phase);
                let z22 = amplitude * p.sin(m * p.PI * r2 / radius) * p.cos(n * angle1) * p.cos(omega * time + phase);
                let z2 = z21 + z22;

                let x3 = r2 * p.cos(angle2);
                let y3 = r2 * p.sin(angle2);
                let z31 = amplitude * p.sin(n * p.PI * r2 / radius) * p.cos(m * angle2) * p.cos(omega * time + phase);
                let z32 = amplitude * p.sin(m * p.PI * r2 / radius) * p.cos(n * angle2) * p.cos(omega * time + phase);
                let z3 = z31 + z32;

                let x4 = r1 * p.cos(angle2);
                let y4 = r1 * p.sin(angle2);
                let z41 = amplitude * p.sin(n * p.PI * r1 / radius) * p.cos(m * angle2) * p.cos(omega * time + phase);
                let z42 = amplitude * p.sin(m * p.PI * r1 / radius) * p.cos(n * angle2) * p.cos(omega * time + phase);
                let z4 = z41 + z42;
                
                let colorIntensity = p.map(z1, -amplitude, amplitude, 0.9, 1.3);
                p.fill(255 * colorIntensity, 110 * colorIntensity, 20 * colorIntensity);
                
                p.vertex(x1, y1, z1);
                p.vertex(x2, y2, z2);
                p.vertex(x3, y3, z3);
                p.vertex(x4, y4, z4);
            }
            p.endShape();
        }
        
        time += p.TWO_PI / 120;
    };

    p.keyPressed = function() {
        if (p.key === 's') {
            p.saveGif('chladni_pattern_rectangular_plate ' + n + " " + m, 2);
        }
    };
}, 'left-canvas');

// Create right sketch
let rightSketch = new p5(function(p) {
    let canvasSize = 800;
    let cols = 250;
    let rows = 250;
    let padding = 0;
    
    let rW, rH;

    p.setup = function() {
        p.createCanvas(800, 800);
        rW = (canvasSize - padding*2) / cols;
        rH = (canvasSize - padding*2) / rows;
        p.noLoop();  // Stop continuous drawing

        // Add event listeners to sliders to trigger redraw
        sliderA.input(() => p.redraw());
        sliderN.input(() => p.redraw());
        sliderM.input(() => p.redraw());
    
    };

    p.draw = function() {
        p.background(220);
        
        let n = sliderN.value();
        let m = sliderM.value();
    
        let amplitude = sliderA.value() / 50;
        
        p.translate(p.width/2, p.height/2);
        p.strokeWeight(5);
        
        let radius = p.min(p.width, p.height) * 0.4;
        
        for (let r = 0; r <= radius; r += 2) {
            for (let theta = 0; theta < p.TWO_PI; theta += 0.005) {
                let x = r * p.cos(theta);
                let y = r * p.sin(theta);
                
                // Circular membrane wave equation
                let wave1 = amplitude * p.sin(n * p.PI * r / radius) * p.cos(m * theta);
                let wave2 = amplitude * p.sin(m * p.PI * r / radius) * p.cos(n * theta);
                let wave = wave1 + wave2;
                
                if (p.abs(wave) < 0.1) {
                    p.point(x, y);
                }
            }
        }
    };


}, 'right-canvas');

