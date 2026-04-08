import { createClient } from '@/lib/supabase/server';

export async function getActiveOpportunities(limit = 20) {
  const supabase = createClient();
  
  // Filter in the query, not in the index
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, organization, type, category, location, deadline, funding_amount')
    .gte('deadline', new Date().toISOString()) // Greater than or equal to now
    .order('deadline', { ascending: true }) // Soonest deadline first
    .limit(limit);
  
  return { data, error };
}

export async function getAllOpportunities(filters?: {
  type?: string;
  category?: string;
  location?: string;
  includeExpired?: boolean;
}) {
  const supabase = createClient();
  
  let query = supabase
    .from('opportunities')
    .select('*');
  
  // Apply filters
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.location) {
    query = query.eq('location', filters.location);
  }
  
  // Exclude expired opportunities by default
  if (!filters?.includeExpired) {
    query = query.gte('deadline', new Date().toISOString());
  }
  
  return query.order('created_at', { ascending: false });
}
