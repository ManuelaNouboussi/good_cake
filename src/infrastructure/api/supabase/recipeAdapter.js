// src/infrastructure/api/supabase/recipeAdapter.js
import { supabase, handleSupabaseError } from './client';

export class SupabaseRecipeAdapter {
  async getAllRecipes({ category, sortBy = 'created_at', order = 'desc', limit = 10, offset = 0 }) {
    try {
      let query = supabase
        .from('recipes_with_ratings')
        .select('*', { count: 'exact' });

      if (category) {
        query = query.eq('category_slug', category);
      }

      // Gestion du tri
      if (sortBy === 'rating') {
        query = query.order('average_gavels', { ascending: order === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: order === 'asc' });
      }

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data.map(this._formatRecipe),
        total: count,
        limit,
        offset
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getRecipeById(id) {
    try {
      const { data, error } = await supabase
        .from('recipes_with_ratings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return this._formatRecipe(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async createRecipe(recipeData, userId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps,
          category_id: recipeData.categoryId,
          user_id: userId,
          image_url: recipeData.imageUrl,
          preparation_time: recipeData.preparationTime,
          cooking_time: recipeData.cookingTime,
          difficulty: recipeData.difficulty,
          servings: recipeData.servings
        })
        .select()
        .single();

      if (error) throw error;

      return this._formatRecipe(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async updateRecipe(id, recipeData, userId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update({
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps,
          category_id: recipeData.categoryId,
          image_url: recipeData.imageUrl,
          preparation_time: recipeData.preparationTime,
          cooking_time: recipeData.cookingTime,
          difficulty: recipeData.difficulty,
          servings: recipeData.servings
        })
        .eq('id', id)
        .eq('user_id', userId) // Vérifie que l'utilisateur est le propriétaire
        .select()
        .single();

      if (error) throw error;

      return this._formatRecipe(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async deleteRecipe(id, userId) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Vérifie que l'utilisateur est le propriétaire

      if (error) throw error;

      return true;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async rateRecipe(recipeId, userId, rating) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .upsert({
          recipe_id: recipeId,
          user_id: userId,
          gavels: rating.gavels,
          comment: rating.comment,
          verdict: rating.verdict
        }, {
          onConflict: 'recipe_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;

      return this._formatRating(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getRecipeRatings(recipeId) {
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

  _formatRecipe(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      categoryId: recipe.category_id,
      categoryName: recipe.category_name,
      categorySlug: recipe.category_slug,
      userId: recipe.user_id,
      authorName: recipe.author_name,
      authorAvatar: recipe.author_avatar,
      imageUrl: recipe.image_url,
      preparationTime: recipe.preparation_time,
      cookingTime: recipe.cooking_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      isFeatured: recipe.is_featured,
      averageGavels: recipe.average_gavels,
      totalRatings: recipe.total_ratings,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at
    };
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
