import P5Playground from '@/app/components/Playground';

interface Params {
  sketch: string[];
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface Props {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

export default async function EmbedPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  await searchParams; // intentionally awaited without assignment
  
  const sketchPath = '/' + resolvedParams.sketch.join('/');
  
  return (
    <div className="w-full h-screen">
      <P5Playground sketchPath={sketchPath} isEmbedded={true} />
    </div>
  );
} 