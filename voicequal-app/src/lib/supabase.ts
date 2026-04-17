import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cmttaieyuweyjxjjtrel.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdHRhaWV5dXdleWp4amp0cmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTQyMDMsImV4cCI6MjA5MTk3MDIwM30.bY0n010Nu6Ml6vZvSk9DCia8XamIowi5gdL0Q5C9XuE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface CallResult {
  id: string
  lead_name: string
  phone: string
  company?: string
  duration?: string
  called_at: string
  status: 'COMPLETED' | 'CALLING' | 'FAILED' | 'PENDING'
  score?: number
  outcome?: 'HOT' | 'WARM' | 'COLD'
  transcript?: string
  summary?: string
}
