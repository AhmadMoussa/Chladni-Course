'use client';
import React, { useState } from 'react';
import P5Playground from './Playground';
import { useRouter } from 'next/navigation';

interface SketchSelectorProps {
  initialSketches: {
    id: string;
    title: string;
  }[];
}

const SketchSelector: React.FC<SketchSelectorProps> = ({ initialSketches }) => {
  const [selectedSketch, setSelectedSketch] = useState(initialSketches[0]?.id || 'demo');
  const router = useRouter();

  return (
    <>
      <div className="w-[200px] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sketches
            </h3>
            <button
              onClick={() => router.push('/submit')}
              className="text-sm px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
            >
              New
            </button>
          </div>
          {initialSketches.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-3">
              No sketches available. Add some sketches to get started!
            </p>
          ) : (
            <ul className="space-y-1">
              {initialSketches.map((sketch) => (
                <li key={sketch.id}>
                  <button
                    onClick={() => setSelectedSketch(sketch.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                      selectedSketch === sketch.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {sketch.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 m-8">
        {selectedSketch === 'demo' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-xl font-bold mb-4">Welcome to P5.js Playground!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There are no sketches in the database yet. Add your first sketch to get started.
              </p>
            </div>
          </div>
        ) : (
          <P5Playground sketchPath={`/sketches/${selectedSketch}`} />
        )}
      </div>
    </>
  );
};

export default SketchSelector; 