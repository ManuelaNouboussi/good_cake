import { supabase, handleSupabaseError } from './client';

export class SupabaseRatingAdapter {
  async createRating(rating) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert(rating)
        .select()
        .single();

      if (error) throw error;

      return this._formatRating(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async updateRating(id, rating) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .update(rating)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this._formatRating(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async deleteRating(id, userId) {
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getRatingsByRecipe(recipeId) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          profiles!inner(username, avatar_url)
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this._formatRating);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getUserRating(recipeId, userId) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ? this._formatRating(data) : null;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  _formatRating(rating) {
    return {
      id: rating.id,
      recipeId: rating.recipe_id,
      userId: rating.user_id,
      gavels: rating.gavels,
      comment: rating.comment,
      verdict: rating.verdict,
      username: rating.profiles?.username,
      userAvatar: rating.profiles?.avatar_url,
      createdAt: rating.created_at,
      updatedAt: rating.updated_at
    };
  }
}
