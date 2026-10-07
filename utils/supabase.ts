import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://znczyfkpcpkmhutlmenh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_uNLo2PVuzxyirMCKKKRSEA_m_19YrCQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
