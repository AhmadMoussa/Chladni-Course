type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      sketches: {
        Row: {
          id: string
          title: string
          created_at: string
          html_content: string
          js_content: string
          css_content: string
          config: Json
          mdx_content: string | null
        }
        Insert: {
          id?: string
          title: string
          created_at?: string
          html_content: string
          js_content: string
          css_content: string
          config: Json
          mdx_content?: string | null
        }
      }
    }
  }
} 