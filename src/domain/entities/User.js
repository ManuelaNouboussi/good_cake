export class User {
    constructor({
      id,
      email,
      username,
      avatarUrl,
      createdAt,
      updatedAt
    }) {
      this.id = id;
      this.email = email;
      this.username = username;
      this.avatarUrl = avatarUrl;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  }
  