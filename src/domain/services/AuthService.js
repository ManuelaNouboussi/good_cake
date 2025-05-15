import { User } from '../entities/User';

export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async signUp({ email, password, username }) {
    const user = await this.authRepository.signUp({ email, password, username });
    return new User(user);
  }

  async signIn({ email, password }) {
    const user = await this.authRepository.signIn({ email, password });
    return new User(user);
  }

  async signOut() {
    await this.authRepository.signOut();
  }

  async getCurrentUser() {
    const user = await this.authRepository.getCurrentUser();
    return user ? new User(user) : null;
  }

  onAuthStateChange(callback) {
    return this.authRepository.onAuthStateChange(callback);
  }
}
