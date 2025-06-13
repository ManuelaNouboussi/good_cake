import React, { useState, useEffect, useRef, useReducer, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, MeshTransmissionMaterial, Environment, Lightformer } from '@react-three/drei';
import { CuboidCollider, BallCollider, Physics, RigidBody } from '@react-three/rapier';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import { easing } from 'maath';
import './App.css';
import { recipeFacade } from '../application/facades/recipeFacade';
import { authFacade } from '../application/facades/authFacade';
import { AuthProvider } from '../presentation/context/AuthContext';
import Header from '../presentation/components/Header/header.js';
import HeroSection from '../presentation/components/HeroSection/HeroSection';
import CategorySection from '../presentation/components/CategorySection/CategorySection';
import FeaturedSection from '../presentation/components/FeaturedSection/FeaturedSection';
import RecipeSearch from '../presentation/components/RecipeSearch/RecipeSearch';
import RecipeForm from '../presentation/components/RecipeForm/RecipeForm';
import RecipeDetailModal from '../presentation/components/RecipeDetailModal/RecipeDetailModal';
import Footer from '../presentation/components/Footer/Footer';

import Patisserie from '../presentation/pages/Patisserie/Patisserie';
import Chocolat from '../presentation/pages/Chocolat/Chocolat';
import Glaces from '../presentation/pages/Glaces/Glaces';
import Confiserie from '../presentation/pages/Confiserie/Confiserie';
import Contact from '../presentation/pages/Contact/Contact';
import ResetPasswordPage from '../presentation/pages/ResetPasswordPage/ResetPasswordPage.js';

const accents = ['#4060ff', '#20ffa0', '#ff4060', '#ffcc00'];
const shuffle = (accent = 0) => [
 { color: '#444', roughness: 0.1 },
 { color: '#444', roughness: 0.75 },
 { color: '#444', roughness: 0.75 },
 { color: 'white', roughness: 0.1 },
 { color: 'white', roughness: 0.75 },
 { color: 'white', roughness: 0.1 },
 { color: accents[accent], roughness: 0.1, accent: true },
 { color: accents[accent], roughness: 0.75, accent: true },
 { color: accents[accent], roughness: 0.1, accent: true }
];

const Home = ({ 
 showScene, 
 setShowScene, 
 showRecipeForm, 
 setShowRecipeForm, 
 recipes, 
 selectedCategory, 
 setSelectedCategory,
 searchTerm, 
 setSearchTerm,
 sortOption,
 setSortOption, 
 filteredRecipes, 
 rateRecipe,
 addRecipe,
 selectedRecipe,
 setSelectedRecipe
}) => {
 return (
   <main className="main-content">
     <HeroSection onExplore={() => setShowScene(true)} />
     <CategorySection 
       selectedCategory={selectedCategory} 
       onCategoryChange={setSelectedCategory} 
     />
     
     <RecipeSearch 
       searchTerm={searchTerm}
       onSearchChange={setSearchTerm}
       sortOption={sortOption}
       onSortChange={setSortOption}
       onAddRecipeClick={() => setShowRecipeForm(true)}
     />
     
     <FeaturedSection 
       recipes={filteredRecipes} 
       onRateRecipe={rateRecipe}
       onViewDetails={(recipe) => setSelectedRecipe(recipe)}
     />
     
     {showRecipeForm && (
       <div className="modal-overlay">
         <RecipeForm 
           onAddRecipe={addRecipe} 
           onCancel={() => setShowRecipeForm(false)} 
         />
       </div>
     )}

     {selectedRecipe && (
       <RecipeDetailModal
         recipe={selectedRecipe}
         isOpen={!!selectedRecipe}
         onClose={() => setSelectedRecipe(null)}
         onRateRecipe={rateRecipe}
       />
     )}
   </main>
 );
};

const AppContent = () => {
 const [showScene, setShowScene] = useState(false);
 const [showRecipeForm, setShowRecipeForm] = useState(false);
 const [selectedRecipe, setSelectedRecipe] = useState(null);
 const [recipes, setRecipes] = useState([]); // Initialisation avec un tableau vide
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [searchTerm, setSearchTerm] = useState('');
 const [sortOption, setSortOption] = useState('newest');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [user, setUser] = useState(null);

 useEffect(() => {
   async function fetchRecipes() {
     try {
       setLoading(true);
       setError(null);
       
       console.log('🎭 App: Récupération des recettes...');
       const result = await recipeFacade.getAllRecipes({
         category: selectedCategory === 'all' ? null : selectedCategory,
         sortBy: sortOption === 'newest' ? 'created_at' : 
                sortOption === 'highest' ? 'rating' : 'created_at',
         order: 'desc'
       });
       
       console.log('🎭 App: Résultat facade:', result);
       
       // Vérifier que result.data existe et est un tableau
       if (result && Array.isArray(result.data)) {
         console.log('🎭 App: Utilisation de result.data');
         setRecipes(result.data);
       } else if (Array.isArray(result)) {
         console.log('🎭 App: Utilisation de result direct');
         setRecipes(result);
       } else {
         console.warn('🎭 App: Format de données inattendu:', result);
         setRecipes([]);
       }
     } catch (err) {
       console.error('🎭 App: Erreur lors du chargement des recettes:', err);
       setError(err.message);
       setRecipes([]); // S'assurer que recipes reste un tableau
     } finally {
       setLoading(false);
     }
   }

   fetchRecipes();
 }, [selectedCategory, sortOption]);

 useEffect(() => {
   authFacade.getCurrentUser().then(setUser).catch(console.error);
   
   const { data: authListener } = authFacade.onAuthStateChange((event, session) => {
     setUser(session?.user ?? null);
   });

   return () => {
     authListener?.subscription?.unsubscribe();
   };
 }, []);

 const addRecipe = async (newRecipe) => {
   if (!user) {
     alert('Vous devez être connecté pour ajouter une recette');
     return;
   }

   try {
     console.log('🎭 App: Création d\'une nouvelle recette');
     const createdRecipe = await recipeFacade.createRecipe({
       title: newRecipe.title,
       description: newRecipe.description,
       ingredients: newRecipe.ingredients,
       steps: newRecipe.steps,
       categoryId: newRecipe.category,
       imageUrl: newRecipe.image,
       preparationTime: newRecipe.prepTime,
       cookingTime: newRecipe.cookTime,
       difficulty: newRecipe.difficulty,
       servings: newRecipe.servings
     }, user.id);

     setRecipes(prev => [createdRecipe, ...prev]);
     setShowRecipeForm(false);
     console.log('🎭 App: Recette créée avec succès');
   } catch (err) {
     console.error('🎭 App: Erreur création recette:', err);
     alert('Erreur lors de la création de la recette: ' + err.message);
   }
 };

 const rateRecipe = async (recipeId, rating) => {
   if (!user) {
     alert('Vous devez être connecté pour noter une recette');
     return;
   }

   try {
     console.log('🎭 App: Notation de la recette:', recipeId, 'avec', rating, 'marteaux');
     await recipeFacade.rateRecipe(recipeId, user.id, {
       gavels: rating,
       comment: 'Notation via le site',
       verdict: rating >= 4 ? 'Acquitté !' : 'À améliorer'
     });

     // Recharger les recettes après notation
     const result = await recipeFacade.getAllRecipes();
     if (result && Array.isArray(result.data)) {
       setRecipes(result.data);
     } else if (Array.isArray(result)) {
       setRecipes(result);
     }
     console.log('🎭 App: Notation effectuée avec succès');
   } catch (err) {
     console.error('🎭 App: Erreur notation:', err);
     alert('Erreur lors de la notation: ' + err.message);
   }
 };

 // S'assurer que recipes est toujours un tableau avant d'appeler filter
 const filteredRecipes = useMemo(() => {
   if (!Array.isArray(recipes)) {
     console.warn('🎭 App: recipes n\'est pas un tableau:', recipes);
     return [];
   }
   
   return recipes.filter(recipe => {
     if (!recipe) return false;
     
     const matchesSearch = !searchTerm || 
       recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
     
     return matchesSearch;
   });
 }, [recipes, searchTerm]);

 // Fermer le modal quand on appuie sur Escape
 useEffect(() => {
   const handleEscape = (event) => {
     if (event.key === 'Escape') {
       if (selectedRecipe) {
         setSelectedRecipe(null);
       } else if (showRecipeForm) {
         setShowRecipeForm(false);
       }
     }
   };

   document.addEventListener('keydown', handleEscape);
   return () => document.removeEventListener('keydown', handleEscape);
 }, [selectedRecipe, showRecipeForm]);

 if (loading) {
   return (
     <div className="loading-container">
       <div className="loading-spinner"></div>
       <p>Chargement des recettes...</p>
     </div>
   );
 }
 
 if (error) {
   return (
     <div className="error-container">
       <h2>Erreur</h2>
       <p>{error}</p>
       <button onClick={() => window.location.reload()}>
         Recharger la page
       </button>
     </div>
   );
 }
 
 return (
   <Router>
     <div className="app-container">
       {showScene ? (
         <div className="scene-container">
           <Scene style={{ borderRadius: 20 }} />
           <button className="toggle-scene" onClick={() => setShowScene(false)}>
             Retour au site
           </button>
         </div>
       ) : (
         <>
           <Header />
           
           <Routes>
             <Route path="/" element={
               <Home 
                 showScene={showScene}
                 setShowScene={setShowScene}
                 showRecipeForm={showRecipeForm}
                 setShowRecipeForm={setShowRecipeForm}
                 recipes={recipes}
                 selectedCategory={selectedCategory}
                 setSelectedCategory={setSelectedCategory}
                 searchTerm={searchTerm}
                 setSearchTerm={setSearchTerm}
                 sortOption={sortOption}
                 setSortOption={setSortOption}
                 filteredRecipes={filteredRecipes}
                 rateRecipe={rateRecipe}
                 addRecipe={addRecipe}
                 selectedRecipe={selectedRecipe}
                 setSelectedRecipe={setSelectedRecipe}
               />
             } />
             <Route path="/patisserie" element={<Patisserie />} />
             <Route path="/chocolat" element={<Chocolat />} />
             <Route path="/glaces" element={<Glaces />} />
             <Route path="/confiserie" element={<Confiserie />} />
             <Route path="/contact" element={<Contact />} />
             <Route path="/reset-password" element={<ResetPasswordPage />} />
           </Routes>
           
           <Footer />
         </>
       )}
     </div>
   </Router>
 );
};

// Composant App principal avec AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

function Scene(props) {
 const [accent, click] = useReducer((state) => ++state % accents.length, 0);
 const connectors = useMemo(() => shuffle(accent), [accent]);
 
 return (
   <Canvas 
     onClick={click} 
     shadows 
     dpr={[1, 1.5]} 
     gl={{ antialias: false }} 
     camera={{ position: [0, 0, 15], fov: 17.5, near: 1, far: 20 }} 
     {...props}
   >
     <color attach="background" args={['#141622']} />
     <ambientLight intensity={0.4} />
     <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
     <Physics gravity={[0, 0, 0]}>
       <Pointer />
       {connectors.map((props, i) => <Connector key={i} {...props} />)}
       <Connector position={[10, 10, 5]} />
       <Model position={[0, 0, 0]} />
     </Physics>
     <EffectComposer disableNormalPass multisampling={8}>
       <N8AO distanceFalloff={1} aoRadius={1} intensity={4} />
     </EffectComposer>
     <Environment resolution={256}>
       <group rotation={[-Math.PI / 3, 0, 1]}>
         <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
         <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
         <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
         <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
       </group>
     </Environment>
   </Canvas>
 );
}

function Connector({ position, children, vec = new THREE.Vector3(), scale, r = THREE.MathUtils.randFloatSpread, accent, ...props }) {
 const api = useRef();
 const pos = useMemo(() => position || [r(10), r(10), r(10)], []);
 
 useFrame((state, delta) => {
   delta = Math.min(0.1, delta);
   api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.2));
 });
 
 return (
   <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
     <CuboidCollider args={[0.38, 1.27, 0.38]} />
     <CuboidCollider args={[1.27, 0.38, 0.38]} />
     <CuboidCollider args={[0.38, 0.38, 1.27]} />
     {accent && <pointLight intensity={4} distance={2.5} color={props.color} />}
   </RigidBody>
 );
}

function Pointer({ vec = new THREE.Vector3() }) {
 const ref = useRef();
 
 useFrame(({ mouse, viewport }) => {
   ref.current?.setNextKinematicTranslation(vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0));
 });
 
 return (
   <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
     <BallCollider args={[1]} />
   </RigidBody>
 );
}

function Model(props) {
 const gltf = useGLTF('/texture3D.glb');
 return <primitive object={gltf.scene} {...props} />;
}

export default App;
