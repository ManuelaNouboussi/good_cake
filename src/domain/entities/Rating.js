export class Rating {
    constructor({
      id,
      recipeId,
      userId,
      gavels,
      comment,
      verdict,
      username,
      userAvatar,
      createdAt,
      updatedAt
    }) {
      this.id = id;
      this.recipeId = recipeId;
      this.userId = userId;
      this.gavels = gavels;
      this.comment = comment;
      this.verdict = verdict;
      this.username = username;
      this.userAvatar = userAvatar;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    isPositive() {
      return this.gavels >= 4;
    }
  }
  