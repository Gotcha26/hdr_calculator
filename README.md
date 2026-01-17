# HDR Calculator - Architecture refactorisée

## 📁 Structure du projet

```
hdr-calculator/
├── index.html              # Point d'entrée HTML
├── App.jsx                 # Composant principal
├── components/             # Composants React
│   ├── Header.jsx         # En-tête de l'application
│   ├── Menu.jsx           # Menu latéral
│   ├── MainSection.jsx    # Section Vue centrée
│   ├── CorrectionISO.jsx  # Section Correction ISO
│   ├── CorrectionAperture.jsx # Section Correction Ouverture
│   ├── SettingsPage.jsx   # Page paramètres
│   └── Footer.jsx         # Pied de page
├── hooks/                  # React Hooks personnalisés
│   └── useCorrections.js  # Logique calculs corrections
├── utils/                  # Fonctions utilitaires
│   ├── utils.js           # Utilitaires généraux
│   └── hdrCalculations.js # Calculs séquences HDR
├── data/                   # Données de l'application
│   └── photoDatabase.js   # Base de données photo
└── styles/                 # (Optionnel) Styles séparés

```

## 🔧 Principes d'architecture

### Séparation des responsabilités
- **Components/** : UI uniquement, affichage et interactions utilisateur
- **Hooks/** : Logique métier réutilisable
- **Utils/** : Fonctions pures, calculs, transformations
- **Data/** : Données statiques et constantes

### Avantages
1. **Maintenabilité** : Chaque fichier a une responsabilité unique
2. **Testabilité** : Les utils/hooks peuvent être testés indépendamment
3. **Réutilisabilité** : Composants et hooks réutilisables
4. **Lisibilité** : Code organisé et facile à naviguer

## 🚀 Utilisation

1. Ouvrir `index.html` dans un navigateur
2. Tous les modules sont chargés via ES6 imports
3. Pas de build nécessaire pour le développement

## 📝 Modifications futures

Pour ajouter une nouvelle fonctionnalité :
1. Créer un composant dans `components/`
2. Ajouter la logique dans `hooks/` ou `utils/` si nécessaire
3. Importer et utiliser dans `App.jsx`

## 🔄 Migration depuis l'ancienne version

L'ancien fichier `App.jsx` monolithique a été divisé en :
- Calculs → `utils/hdrCalculations.js` + `hooks/useCorrections.js`
- UI → `components/*.jsx`
- Données → `data/photoDatabase.js`
