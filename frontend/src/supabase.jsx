import { createClient } from '@supabase/supabase-js';

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseURL || !supabaseKey) {
  throw new Error('환경변수를 설정되지 않았습니다');
}

const supabase = createClient(supabaseURL, supabaseKey);

export default supabase;
