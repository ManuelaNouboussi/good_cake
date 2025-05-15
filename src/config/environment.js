export const config = {
    supabase: {
      url: process.env.REACT_APP_SUPABASE_URL,
      anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY
    },
    app: {
      name: 'Cake Lawyer',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  };
  