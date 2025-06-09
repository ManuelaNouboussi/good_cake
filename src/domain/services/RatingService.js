export class RatingService {
  constructor(ratingRepository) {
    this.ratingRepository = ratingRepository;
  }
  
  async rateRecipe(recipeId, userId, gavels, comment = null) {
    if (gavels < 1 || gavels > 5) {
      throw new Error('Le nombre de marteaux doit être entre 1 et 5');
    }
    
    // Générer un verdict automatique basé sur les marteaux
    const verdict = this.generateVerdict(gavels);
    
    return await this.ratingRepository.addRating(recipeId, userId, gavels, comment, verdict);
  }
  
  async getUserRatingForRecipe(recipeId, userId) {
    return await this.ratingRepository.getUserRatingForRecipe(recipeId, userId);
  }
  
  generateVerdict(gavels) {
    const verdicts = {
      1: "Coupable de mauvais goût!",
      2: "Insuffisant pour l'acquittement",
      3: "En procédure...",
      4: "Proche de l'acquittement",
      5: "Mérite d'être acquitté!"
    };
    return verdicts[gavels] || "Verdict rendu";
  }
}
