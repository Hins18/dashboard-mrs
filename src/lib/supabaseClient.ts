// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types' // Akan error sementara, diperbaiki di langkah 6

// Ambil URL dan Key dari Supabase Dashboard Anda
const supabaseUrl = 'https://drzsqgrlmrgizgjfdtch.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyenNxZ3JsbXJnaXpnamZkdGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzE5ODIsImV4cCI6MjA2NjI0Nzk4Mn0.rN4x7F8XZqAsrgI6y2FnwOO-wPISKJr1vDWzPLBjACY'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)