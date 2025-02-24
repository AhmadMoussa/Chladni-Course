import { supabase } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the ID and clean it from any path segments
    const rawId = context.params.id;
    const cleanId = rawId.split('/').pop() || rawId;
    console.log('API Route - Processing ID:', cleanId);

    // Simple UUID format validation using regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!cleanId || !uuidRegex.test(cleanId)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format',
        requestedId: cleanId
      }, { status: 400 });
    }

    const { data: sketch, error } = await supabase
      .from('sketches')
      .select('*')
      .eq('id', cleanId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error,
        requestedId: cleanId
      }, { status: 500 });
    }

    if (!sketch) {
      console.log('No sketch found for id:', cleanId);
      return NextResponse.json({ 
        error: 'Sketch not found',
        requestedId: cleanId
      }, { status: 404 });
    }

    return NextResponse.json(sketch);
  } catch (e) {
    console.error('Unexpected error:', e);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
} 