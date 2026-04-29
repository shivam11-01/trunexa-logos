/**
 * One-time seed script to populate Supabase with initial brand data.
 * Run with: npx ts-node scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const brands = [
  { name: 'Trunexa', slug: 'trunexa', description: 'Our own technology house', category: 'Parent Brand', order: 1 },
  { name: 'Trucrux', slug: 'trucrux', description: 'High performance boards', category: 'Infrastructure', order: 2 },
  { name: 'Chargnex', slug: 'chargnex', description: 'EV charging solutions', category: 'EV Charging', order: 3 },
  { name: 'Flownex', slug: 'flownex', description: 'Payment ready transit solutions', category: 'Operations', order: 4 },
  { name: 'Paynex', slug: 'paynex', description: 'Payments and financial infrastructure', category: 'Payments', order: 5 },
  { name: 'Others', slug: 'others', description: 'Miscellaneous and umbrella brand assets', category: 'Miscellaneous', order: 6 },
]

async function seed() {
  for (const brand of brands) {
    const { data, error } = await supabase.from('brands').insert([brand]).select('id').single()
    if (error) {
      console.error(`Error adding ${brand.name}:`, error)
    } else {
      console.log(`✓ Added brand: ${brand.name} → ${data.id}`)
    }
  }
  console.log('\nSeeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

