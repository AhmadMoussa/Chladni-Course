// pages/playground.tsx
import React from 'react';
import { readdir } from 'fs/promises';
import path from 'path';
import SketchSelector from './components/SketchSelector';

// Function to get sketches
async function getSketches() {
  const sketchesDir = path.join(process.cwd(), 'public', 'sketches');
  try {
    const files = await readdir(sketchesDir);
    return files;
  } catch (error) {
    console.error('Error reading sketches directory:', error);
    return [];
  }
}

// Convert to async component
const PlaygroundPage = async () => {
  const sketches = await getSketches();
  
  return (
    <div className="flex h-screen">
      <SketchSelector initialSketches={sketches} />
    </div>
  );
};

export default PlaygroundPage;
