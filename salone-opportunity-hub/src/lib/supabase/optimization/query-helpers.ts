import { createClient } from '@/lib/supabase/server';

// Always specify exactly which columns you need
export async function getOpportunities(limit = 20, offset = 0) {
	const supabase = createClient();
  
	// ✅ GOOD - Only fetch needed columns
	const { data, error } = await supabase
		.from('opportunities')
		.select('id, title, organization, type, category, location, deadline, funding_amount')
		.range(offset, offset + limit - 1)
		.order('created_at', { ascending: false });
  
	// ❌ BAD - Fetches all columns
	// .select('*')
  
	return { data, error };
}
