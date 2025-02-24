// pages/playground.tsx
import React from 'react';
import SketchSelector from './components/SketchSelector';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Function to get sketches
async function getSketches() {
  const supabase = createServerComponentClient({ cookies });
  const { data: sketches, error } = await supabase
    .from('sketches')
    .select('id, title')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sketches:', error);
    return [];
  }

  if (!sketches || sketches.length === 0) {
    return [{
      id: 'demo',
      title: 'Demo Sketch (No sketches in database)'
    }];
  }

  return sketches.map(sketch => ({
    id: sketch.id,
    title: sketch.title
  }));
}

// Convert to async component
const PlaygroundPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  const sketches = await getSketches();
  
  return (
    <div className="flex h-screen">
      <SketchSelector initialSketches={sketches} />
    </div>
  );
};

export default PlaygroundPage;
