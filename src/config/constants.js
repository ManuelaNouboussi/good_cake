export const DIFFICULTY_LEVELS = {
    EASY: 'facile',
    MEDIUM: 'moyen',
    HARD: 'difficile'
  };
  
  export const VERDICT_EXAMPLES = [
    'Acquitté à l\'unanimité des papilles !',
    'Coupable de gourmandise excessive !',
    'Condamné à être refait !',
    'Non-lieu pour goûter extraordinaire',
    'Délicieux délit de saveurs'
  ];
  
  export const ROUTES = {
    HOME: '/',
    RECIPES: '/recipes',
    RECIPE_DETAIL: '/recipes/:id',
    CREATE_RECIPE: '/recipes/new',
    EDIT_RECIPE: '/recipes/:id/edit',
    CATEGORIES: '/categories',
    CATEGORY_DETAIL: '/categories/:slug',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile'
  };
  
  export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
  };
  