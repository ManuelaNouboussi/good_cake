import { supabase } from './client';

export class SupabaseRatingAdapter {
  async addRating(recipeId, userId, gavels, comment = null, verdict = null) {
    const { data, error } = await supabase
      .rpc('rate_recipe', {
        recipe_uuid: recipeId,
        user_uuid: userId,
        user_gavels: gavels,
        user_comment: comment,
        user_verdict: verdict
      });
    
    if (error) {
      console.error('Erreur rating:', error);
      throw new Error(error.message);
    }
    
    return data?.[0] ? this.toDomainEntity(data[0]) : null;
  }
  
  async getUserRatingForRecipe(recipeId, userId) {
    const { data, error } = await supabase
      .rpc('get_user_rating_for_recipe', {
        recipe_uuid: recipeId,
        user_uuid: userId
      });
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data?.[0] ? this.toDomainEntity(data[0]) : null;
  }
  
  async updateRating(recipeId, userId, gavels, comment = null, verdict = null) {
    // La fonction rate_recipe gère déjà l'update
    return this.addRating(recipeId, userId, gavels, comment, verdict);
  }
  
  toDomainEntity(supabaseData) {
    return {
      id: supabaseData.rating_id,
      recipeId: null, // Pas retourné par la fonction
      userId: null,   // Pas retourné par la fonction
      rating: supabaseData.gavels, // Conversion gavels -> rating pour compatibilité
      gavels: supabaseData.gavels,
      comment: supabaseData.comment,
      verdict: supabaseData.verdict,
      createdAt: supabaseData.created_at
    };
  }
}
