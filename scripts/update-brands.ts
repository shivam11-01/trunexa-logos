/**
 * Update script to sync brand descriptions in Supabase.
 * Run with: npx ts-node -e "require('dotenv').config({ path: '.env.local' })" scripts/update-brands.ts
 * Or use: npx tsx --env-file=.env.local scripts/update-brands.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const updates = [
  { slug: 'trunexa',  description: 'Our own technology house' },
  { slug: 'trucrux',  description: 'High performance boards' },
  { slug: 'chargnex', description: 'EV charging solutions' },
  { slug: 'flownex',  description: 'Payment ready transit solutions' },
  { slug: 'paynex',   description: 'Payments and financial infrastructure' },
  { slug: 'others',   description: 'Miscellaneous and umbrella brand assets' },
]

async function run() {
  for (const { slug, description } of updates) {
    const { error } = await supabase
      .from('brands')
      .update({ description })
      .eq('slug', slug)

    if (error) {
      console.error(`✗ Failed to update "${slug}":`, error.message)
    } else {
      console.log(`✓ Updated "${slug}" → "${description}"`)
    }
  }
  console.log('\nDone!')
  process.exit(0)
}

run().catch((err) => {
  console.error('Update failed:', err)
  process.exit(1)
})
