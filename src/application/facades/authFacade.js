import { diProvider } from '../providers/DIProvider';

export const authFacade = {
  async signUp({ email, password, username }) {
    const authService = diProvider.get('authService');
    return await authService.signUp({ email, password, username });
  },

  async signIn({ email, password }) {
    const authService = diProvider.get('authService');
    return await authService.signIn({ email, password });
  },

  async signOut() {
    const authService = diProvider.get('authService');
    return await authService.signOut();
  },

  async getCurrentUser() {
    const authService = diProvider.get('authService');
    return await authService.getCurrentUser();
  },

  onAuthStateChange(callback) {
    const authService = diProvider.get('authService');
    return authService.onAuthStateChange(callback);
  }
};
