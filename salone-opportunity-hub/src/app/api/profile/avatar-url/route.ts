import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');
  if (!user_id) return NextResponse.json({ avatar_url: null });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user_id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ avatar_url: null });
  return NextResponse.json({ avatar_url: data.avatar_url });
}
