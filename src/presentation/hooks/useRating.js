// src/presentation/hooks/useRating.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../infrastructure/api/supabase/client';

export function useRating(recipeId) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && recipeId) {
      fetchUserRating();
    }
  }, [user, recipeId]);

  const fetchUserRating = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .rpc('get_user_rating_for_recipe', {
          recipe_uuid: recipeId,
          user_uuid: user.id
        });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserRating(data?.[0] || null);
    } catch (err) {
      console.error('Erreur fetch rating:', err);
      setError('Erreur lors de la récupération de votre note');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (gavels, comment = null) => {
    if (!user) {
      setError('Vous devez être connecté pour noter une recette');
      throw new Error('Non connecté');
    }

    if (gavels < 1 || gavels > 5) {
      setError('Le nombre de marteaux doit être entre 1 et 5');
      throw new Error('Nombre de marteaux invalide');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Générer un verdict automatique
      const verdict = generateVerdict(gavels);
      
      const { data, error } = await supabase
        .rpc('rate_recipe', {
          recipe_uuid: recipeId,
          user_uuid: user.id,
          user_gavels: gavels,
          user_comment: comment,
          user_verdict: verdict
        });

      if (error) {
        throw error;
      }

      const newRating = data?.[0];
      if (newRating) {
        setUserRating({
          id: newRating.rating_id,
          gavels: newRating.gavels,
          rating: newRating.gavels, // Pour compatibilité
          comment: newRating.comment,
          verdict: newRating.verdict,
          createdAt: newRating.created_at
        });
      }
      
      return newRating;
    } catch (err) {
      console.error('Erreur submit rating:', err);
      const errorMessage = err.message || 'Erreur lors de la notation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateVerdict = (gavels) => {
    const verdicts = {
      1: "Coupable de mauvais goût!",
      2: "Insuffisant pour l'acquittement",
      3: "En procédure...",
      4: "Proche de l'acquittement",
      5: "Mérite d'être acquitté!"
    };
    return verdicts[gavels] || "Verdict rendu";
  };

  const clearError = () => {
    setError(null);
  };

  return {
    userRating,
    loading,
    error,
    submitRating,
    clearError,
    hasVoted: !!userRating,
    gavels: userRating?.gavels || userRating?.rating || 0
  };
}
