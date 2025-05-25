# Cake Lawyer – La justice du goût

**Cake Lawyer** est une application web innovante qui transforme l'évaluation de recettes sucrées en expérience judiciaire ludique. Découvrez, ajoutez et jugez les meilleures créations pâtissières dans un environnement unique où chaque recette passe au tribunal du goût.

> *"Ce gâteau mérite d'être acquitté !"*

---

## Fonctionnalités principales

### Catalogue de recettes
- **Pâtisseries** : Gâteaux, tartes, viennoiseries
- **Glaces** : Sorbets, crèmes glacées, desserts glacés
- **Confiseries** : Bonbons, caramels, guimauves
- **Chocolats** : Truffes, pralinés, créations chocolatées

### Gestion des recettes
- Ajout de nouvelles recettes via formulaire intuitif
- Champs disponibles : nom, ingrédients, étapes de préparation, image, catégorie
- Interface de modification et suppression

### Système de notation judiciaire
- Notation de 1 à 5 marteaux de justice (au lieu des étoiles traditionnelles)
- Calcul de la note moyenne par recette
- Classement par popularité

### Recherche et filtres
- Filtrage par catégorie de dessert
- Tri par popularité ou note moyenne
- Fonction de recherche par nom ou ingrédients

---

## Technologies utilisées

| Couche | Technologie | Usage |
|--------|-------------|-------|
| **Frontend** | React | Framework UI |
| **Langage** | JavaScript | Développement principal |
| **Styling** | SCSS | Stylisation avancée |
| **Routing** | React Router | Navigation |
| **Backend** | Supabase | Base de données et authentification |
| **Storage** | Supabase Storage | Stockage d'images |
| **Architecture** | Clean Architecture | Structure hexagonale |
| **Build** | Create React App | Configuration et build |

---

## Installation et lancement

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/ManuelaNouboussi/cake-lawyer.git

# Naviguer dans le dossier
cd GOOD_CAKE

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm start
```

L'application sera accessible à l'adresse : `http://localhost:3000`

---

## Scripts disponibles

### Développement
```bash
npm start          # Lance l'application en mode développement
npm test           # Execute les tests en mode interactif
```

### Production
```bash
npm run build      # Génère la version optimisée pour la production
npm run eject      # Ejection de la configuration (irréversible)
```

---

## Structure du projet

Le projet suit une **architecture hexagonale** (Clean Architecture) pour une meilleure maintenabilité et testabilité :

```
GOOD_CAKE/
│
├── public/                        # Fichiers statiques
│
├── src/
│   ├── config/                    # Configuration centralisée
│   │   ├── constants.js           # Constantes de l'application
│   │   └── environment.js         # Gestion des environnements
│   │
│   ├── infrastructure/            # Couche infrastructure (adapters)
│   │   ├── api/                   # Implémentations spécifiques
│   │   │   ├── supabase/          # Intégration Supabase
│   │   │   │   ├── client.js
│   │   │   │   ├── recipeAdapter.js
│   │   │   │   └── authAdapter.js
│   │   │   └── rest/              # Future API REST
│   │   │
│   │   └── storage/               # Gestion du stockage
│   │       ├── supabase/          # Stockage Supabase
│   │       └── cloudinary/        # Future migration Cloudinary
│   │
│   ├── domain/                    # Logique métier pure
│   │   ├── entities/              # Entités métier
│   │   │   ├── Recipe.js
│   │   │   ├── User.js
│   │   │   └── Rating.js
│   │   ├── repositories/          # Interfaces des repositories
│   │   │   ├── IRecipeRepository.js
│   │   │   ├── IUserRepository.js
│   │   │   └── IStorageRepository.js
│   │   └── services/              # Services métier
│   │       ├── RecipeService.js
│   │       ├── AuthService.js
│   │       └── RatingService.js
│   │
│   ├── application/               # Couche application
│   │   ├── providers/             # Injection de dépendances
│   │   │   └── DIProvider.js
│   │   └── facades/               # Façades simplifiées
│   │       ├── recipeFacade.js
│   │       └── authFacade.js
│   │
│   ├── presentation/              # Interface utilisateur
│   │   ├── components/            # Composants React réutilisables
│   │   ├── pages/                 # Pages de l'application
│   │   ├── hooks/                 # Hooks personnalisés
│   │   └── context/               # Contextes React
│   │
│   └── App.js                     # Point d'entrée de l'application
│
├── .env                           # Variables d'environnement
├── package.json
└── README.md
```

### Architecture

Cette structure implémente les principes de la **Clean Architecture** :

- **Domain** : Logique métier indépendante des frameworks
- **Application** : Orchestration et cas d'usage
- **Infrastructure** : Implémentations techniques (base de données, APIs)
- **Presentation** : Interface utilisateur React

---

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

## Roadmap

- [ ] Système d'authentification utilisateur
- [ ] Sauvegarde des recettes favorites
- [ ] Partage de recettes sur les réseaux sociaux
- [ ] API pour l'import/export de recettes
- [ ] Version mobile dédiée

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## Contact

**Auteur** : Manuela Nouboussi  
**Repository** : [github.com/ManuelaNouboussi/cake-lawyer](https://github.com/ManuelaNouboussi/cake-lawyer)

---

*Développé avec passion pour les amateurs de pâtisserie et de justice !*
