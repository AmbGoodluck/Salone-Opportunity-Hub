import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testQueries() {
  console.log('Testing opportunity queries...\n');
  
  // Test 1: Get active opportunities (deadline > now)
  console.log('1. Active opportunities:');
  const { data: active, error: activeError } = await supabase
    .from('opportunities')
    .select('id, title, deadline')
    .gte('deadline', new Date().toISOString())
    .limit(5);
  
  console.log('   Count:', active?.length);
  console.log('   Error:', activeError || 'None');
  
  // Test 2: Filter by type
  console.log('\n2. Scholarships only:');
  const { data: scholarships, error: schError } = await supabase
    .from('opportunities')
    .select('id, title, type')
    .eq('type', 'scholarship')
    .limit(5);
  
  console.log('   Count:', scholarships?.length);
  console.log('   Error:', schError || 'None');
  
  // Test 3: Full-text search
  console.log('\n3. Search for "Mastercard":');
  const { data: search, error: searchError } = await supabase
    .from('opportunities')
    .select('id, title')
    .textSearch('title', 'Mastercard', { 
      type: 'websearch',
      config: 'english'
    })
    .limit(5);
  
  console.log('   Count:', search?.length);
  console.log('   Error:', searchError || 'None');
  
  console.log('\n✅ All queries completed!');
}

testQueries();
