import React, { useState, useRef, useReducer, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, MeshTransmissionMaterial, Environment, Lightformer } from '@react-three/drei';
import { CuboidCollider, BallCollider, Physics, RigidBody } from '@react-three/rapier';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import { easing } from 'maath';
import './App.css';
import Header from '../components/Header/header';
import HeroSection from '../components/HeroSection/HeroSection';
import CategorySection from '../components/CategorySection/CategorySection';
import FeaturedSection from '../components/FeaturedSection/FeaturedSection';
import RecipeSearch from '../components/RecipeSearch/RecipeSearch';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import Footer from '../components/Footer/Footer';

// Données des recettes préenregistrées
import { recipeData } from '../components/data/recipeData';

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

const App = () => {
  const [showScene, setShowScene] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipes, setRecipes] = useState(recipeData);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  
  // Fonction pour ajouter une nouvelle recette
  const addRecipe = (newRecipe) => {
    // Génération d'un ID unique
    const newId = `recipe_${Date.now()}`;
    const recipeWithId = {
      ...newRecipe,
      id: newId,
      date: new Date().toISOString(),
      ratings: [],
      averageRating: 0,
      voteCount: 0
    };
    
    setRecipes(prev => [...prev, recipeWithId]);
    setShowRecipeForm(false);
  };
  
  // Fonction pour noter une recette
  const rateRecipe = (recipeId, rating) => {
    setRecipes(prev => 
      prev.map(recipe => {
        if (recipe.id === recipeId) {
          const newRatings = [...recipe.ratings, rating];
          const sum = newRatings.reduce((acc, curr) => acc + curr, 0);
          const average = sum / newRatings.length;
          
          return {
            ...recipe,
            ratings: newRatings,
            averageRating: average,
            voteCount: newRatings.length
          };
        }
        return recipe;
      })
    );
  };
  
  // Filtrer les recettes par catégorie et terme de recherche
  const filteredRecipes = recipes
    .filter(recipe => 
      (selectedCategory === 'all' || recipe.category === selectedCategory) &&
      (recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === 'highest') {
        return b.averageRating - a.averageRating;
      } else if (sortOption === 'popular') {
        return b.voteCount - a.voteCount;
      }
      return 0;
    });
  
  return (
    <div className="app-container">
      <Header />
      
      {showScene ? (
        <div className="scene-container">
          <Scene style={{ borderRadius: 20 }} />
          <button className="toggle-scene" onClick={() => setShowScene(false)}>
            Retour au site
          </button>
        </div>
      ) : (
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
          />
          
          {showRecipeForm && (
            <div className="modal-overlay">
              <RecipeForm 
                onAddRecipe={addRecipe} 
                onCancel={() => setShowRecipeForm(false)} 
              />
            </div>
          )}
          
          <Footer />
        </main>
      )}
    </div>
  );
};

// Components Scene, Connector, Pointer, Model (inchangés)
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
