const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mgktfynomgpzrjniotls.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na3RmeW5vbWdwenJqbmlvdGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzIxNTAsImV4cCI6MjEwNTE0ODE1MH0.T3-6-OecermYj497kXqHFyCWH_-ijfrGa7sZ8gDtCPM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing signup...');
  const testEmail = `tushartest_${Date.now()}@gmail.com`;
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
  });

  if (signUpError) {
    console.error('Signup Error:', signUpError);
    return;
  }
  
  console.log('Signup User Confirmed At:', signUpData.user?.email_confirmed_at);

  console.log('\nTesting login immediately...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'password123',
  });

  if (loginError) {
    console.error('Login Error:', loginError);
  } else {
    console.log('Login successful!', loginData.user.id);
  }
}

testAuth();
