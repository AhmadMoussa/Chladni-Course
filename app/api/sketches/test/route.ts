import { supabase } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // First, let's check if we can connect at all
    const { data: tables, error: listError } = await supabase
      .from('sketches')
      .select('count');

    if (listError) {
      console.error('Error accessing sketches table:', listError);
      return NextResponse.json({
        error: 'Database access error',
        details: listError,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        // Don't log the actual key, just check if it exists
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }, { status: 500 });
    }

    // Try to fetch all sketches with more details
    const { data: sketches, error } = await supabase
      .from('sketches')
      .select(`
        id,
        title,
        created_at,
        config,
        html_content,
        js_content,
        css_content,
        mdx_content
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error }, 
        { status: 500 }
      );
    }

    // Log successful connection with formatted output
    console.log('Successfully connected to database');
    console.log('Found sketches:', sketches?.length || 0);

    return NextResponse.json({
      message: 'Database connection successful',
      count: sketches?.length || 0,
      connectionInfo: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasCredentials: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      sketches: sketches?.map(sketch => ({
        id: sketch.id,
        title: sketch.title,
        created: new Date(sketch.created_at).toLocaleString(),
        hasConfig: !!sketch.config,
        hasHTML: !!sketch.html_content,
        hasJS: !!sketch.js_content,
        hasCSS: !!sketch.css_content,
        hasMDX: !!sketch.mdx_content,
      })) || []
    });

  } catch (e) {
    console.error('Unexpected error:', e);
    return NextResponse.json(
      { error: 'Internal server error', details: e }, 
      { status: 500 }
    );
  }
} 