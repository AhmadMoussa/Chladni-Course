'use client';
import React, { useState } from 'react';
import P5Playground from './Playground';

interface SketchSelectorProps {
  initialSketches: string[];
}

const SketchSelector: React.FC<SketchSelectorProps> = ({ initialSketches }) => {
  const [selectedSketch, setSelectedSketch] = useState(initialSketches[0]);

  return (
    <>
      <div className="w-[200px] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sketches
          </h3>
          <ul className="space-y-1">
            {initialSketches.map((sketch) => (
              <li key={sketch}>
                <button
                  onClick={() => setSelectedSketch(sketch)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    selectedSketch === sketch
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {sketch}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 m-8">
        <P5Playground sketchPath={`/sketches/${selectedSketch}`} />
      </div>
    </>
  );
};

export default SketchSelector; 