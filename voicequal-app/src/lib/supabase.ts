import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cmttaieyuweyjxjjtrel.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdHRhaWV5dXdleWp4amp0cmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTQyMDMsImV4cCI6MjA5MTk3MDIwM30.bY0n010Nu6Ml6vZvSk9DCia8XamIowi5gdL0Q5C9XuE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ElevenLabs recording URL is always derivable from call_id
export function recordingUrl(callId: string, stored?: string | null): string {
  return stored || `https://api.elevenlabs.io/v1/convai/conversations/${callId}/audio`
}

// Matches actual n8n → Supabase columns
export interface CallResult {
  call_id: string
  status: string        // "done" from n8n
  transcript?: string
  score?: number
  called_at: string
  summary?: string
  recording_url?: string
  lead_name?: string
  phone?: string
  company?: string
  outcome?: string
}
