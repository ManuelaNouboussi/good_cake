// src/infrastructure/api/supabase/categoryAdapter.js
import { supabase } from './client';

export class SupabaseCategoryAdapter {
  async findAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data.map(this.toDomainEntity);
    } catch (error) {
      console.error('Erreur findAll categories:', error);
      throw error;
    }
  }

  async findBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return this.toDomainEntity(data);
    } catch (error) {
      console.error('Erreur findBySlug categories:', error);
      throw error;
    }
  }

  async findByName(name) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', name)
        .single();
      
      if (error) throw error;
      return this.toDomainEntity(data);
    } catch (error) {
      console.error('Erreur findByName categories:', error);
      throw error;
    }
  }

  async create(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
          description: categoryData.description
        }])
        .select()
        .single();
      
      if (error) throw error;
      return this.toDomainEntity(data);
    } catch (error) {
      console.error('Erreur create category:', error);
      throw error;
    }
  }

  toDomainEntity(supabaseData) {
    if (!supabaseData) return null;
    
    return {
      id: supabaseData.id,
      name: supabaseData.name,
      slug: supabaseData.slug,
      description: supabaseData.description,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };
  }
}
