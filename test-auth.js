require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.log('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkUser() {
  const userId = 'eeb5245f-95b4-4e4d-bdbd-e8ca51cda6f3';

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(userId);
}

checkUser();
