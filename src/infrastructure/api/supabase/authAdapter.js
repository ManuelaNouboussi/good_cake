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

  // ✨ NOUVELLES MÉTHODES POUR LA RÉINITIALISATION DU MOT DE PASSE ✨
  async resetPassword({ email }) {
    try {
      console.log('AuthAdapter: Sending reset password email to:', email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // ✨ Page dédiée
      });
      
      if (error) {
        console.error('AuthAdapter: Reset password error:', error);
        throw error;
      }
      
      console.log('AuthAdapter: Reset password email sent successfully');
      return { success: true, data };
    } catch (error) {
      console.error('AuthAdapter: Reset password failed:', error);
      handleSupabaseError(error);
    }
  }

  async updatePassword({ password, confirmPassword }) {
    try {
      console.log('AuthAdapter: Updating password');
      
      // Vérification côté client
      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // ✨ NOUVEAU: Vérifier qu'on a bien une session avant de continuer
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('AuthAdapter: No valid session for password update:', userError);
        throw new Error('Session expirée ou invalide. Veuillez cliquer à nouveau sur le lien de réinitialisation.');
      }

      console.log('AuthAdapter: Valid session found for user:', user.id);
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('AuthAdapter: Update password error:', error);
        throw error;
      }
      
      console.log('AuthAdapter: Password updated successfully');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('AuthAdapter: Update password failed:', error);
      handleSupabaseError(error);
    }
  }

  // ✨ NOUVELLE MÉTHODE pour échanger un code contre une session
  async exchangeCodeForSession(code) {
    try {
      console.log('AuthAdapter: Exchanging code for session:', code);
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('AuthAdapter: Code exchange error:', error);
        throw error;
      }
      
      console.log('AuthAdapter: Code exchange successful');
      return { success: true, data };
    } catch (error) {
      console.error('AuthAdapter: Code exchange failed:', error);
      handleSupabaseError(error);
    }
  }

  // Méthode pour vérifier si les fonctionnalités de reset sont disponibles
  isResetPasswordAvailable() {
    return typeof this.resetPassword === 'function' && typeof this.updatePassword === 'function';
  }
}
