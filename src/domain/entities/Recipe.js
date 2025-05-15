export class Recipe {
    constructor({
      id,
      title,
      description,
      ingredients,
      steps,
      categoryId,
      categoryName,
      categorySlug,
      userId,
      authorName,
      authorAvatar,
      imageUrl,
      preparationTime,
      cookingTime,
      difficulty,
      servings,
      isFeatured,
      averageGavels,
      totalRatings,
      createdAt,
      updatedAt
    }) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.ingredients = ingredients;
      this.steps = steps;
      this.categoryId = categoryId;
      this.categoryName = categoryName;
      this.categorySlug = categorySlug;
      this.userId = userId;
      this.authorName = authorName;
      this.authorAvatar = authorAvatar;
      this.imageUrl = imageUrl;
      this.preparationTime = preparationTime;
      this.cookingTime = cookingTime;
      this.difficulty = difficulty;
      this.servings = servings;
      this.isFeatured = isFeatured;
      this.averageGavels = averageGavels;
      this.totalRatings = totalRatings;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    getTotalTime() {
      return this.preparationTime + this.cookingTime;
    }
  
    isHighlyRated() {
      return this.averageGavels >= 4;
    }
  }
  