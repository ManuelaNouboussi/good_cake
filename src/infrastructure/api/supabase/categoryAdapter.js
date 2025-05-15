import { supabase, handleSupabaseError } from './client';

export class SupabaseCategoryAdapter {
  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return data.map(this._formatCategory);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getCategoryById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return this._formatCategory(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getCategoryBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      return this._formatCategory(data);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  _formatCategory(category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.created_at
    };
  }
}
