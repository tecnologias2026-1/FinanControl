const SUPABASE_URL = "https://tghfkicjfroeadkmsngd.supabase.co";
const SUPABASE_KEY = "sb_publishable_iR-ahEACfZ95TKsG5hmlGw_j-cv-Dzq";


window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);