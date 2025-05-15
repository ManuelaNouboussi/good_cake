import { supabase, handleSupabaseError } from './client';

export class SupabaseAuthAdapter {
  async signUp({ email, password, username }) {
    try {
      console.log('Starting signup process for:', email);
      
      // 1. Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      console.log('User created:', authData.user?.id);

      // 2. Se connecter immédiatement après l'inscription
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('Login after signup error:', loginError);
        throw loginError;
      }

      console.log('User logged in:', loginData.user?.id);

      // 3. Maintenant créer le profil (l'utilisateur est authentifié)
      if (loginData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: loginData.user.id,
            username: username
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Si le profil existe déjà, ce n'est pas grave
          if (profileError.code !== '23505') {
            throw profileError;
          }
        }
      }

      return loginData.user;
    } catch (error) {
      console.error('SignUp error:', error);
      handleSupabaseError(error);
    }
  }

  async signIn({ email, password }) {
    try {
      console.log('Attempting to sign in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('SignIn error:', error);
        throw error;
      }

      console.log('Sign in successful:', data.user?.id);
      return data.user;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Sign out successful');
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return null;
      }
      
      if (!user) return null;

      console.log('Current user:', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single

      if (profileError) {
        console.error('Get profile error:', profileError);
      }

      return {
        ...user,
        username: profile?.username,
        avatarUrl: profile?.avatar_url
      };
    } catch (error) {
      console.error('GetCurrentUser error:', error);
      return null;
    }
  }

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      callback(event, session);
    });
  }
}
