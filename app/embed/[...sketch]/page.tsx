'use client'

import P5Playground from '@/app/components/Playground';

export default function EmbedPage({
  params
}: {
  params: { sketch: string[] }
}) {
  const sketchPath = '/' + params.sketch.join('/');
  
  return (
    <div className="w-full h-screen">
      <P5Playground sketchPath={sketchPath} isEmbedded={true} />
    </div>
  );
} 