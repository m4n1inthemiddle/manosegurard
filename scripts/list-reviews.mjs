/**
 * Uso: node scripts/list-reviews.mjs
 * Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
    break
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Faltan variables SUPABASE en .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)
const { data, error } = await supabase
  .from('reviews')
  .select('id, customer_name, comment, rating, technician_id, created_at')
  .order('created_at', { ascending: false })

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log(JSON.stringify(data, null, 2))
