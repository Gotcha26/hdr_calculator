# 📘 HDR Calculator - Guideline & Roadmap

**Date de création :** Janvier 2025  
**Version actuelle :** 1.0 Web-App  
**Statut :** ✅ Architecture validée pour évolution progressive

---

## 🎯 Vision Long Terme

### Évolution Possible (sans engagement)
```
Phase 1: Web-App Gratuite (ACTUEL)
   ↓
Phase 2: Web-App + Stockage Local (localStorage)
   ↓
Phase 3: PWA Installable (Progressive Web App)
   ↓
Phase 4: App Mobile Hybride (Capacitor/Cordova)
   ↓
Phase 5: App Native + Backend + Compte Utilisateur
   ↓
Phase 6: Modèle Freemium (version Pro)
```

**Principe clé :** Chaque phase **enrichit** la précédente sans tout réécrire.

---

## ✅ Tests de Validation (Janvier 2025)

### Test 1 : Extraction de Logique Métier
**Statut :** ✅ **VALIDÉ**  
**Résultat :** Les fonctions peuvent être externalisées sans problème  
**Fichier test :** `/utils/testCalculation.js`

**Conclusion :**
- ✅ Mécanisme de chargement fonctionne
- ✅ Accès aux variables globales (`photoDatabase`, `cameraTypes`) OK
- ✅ Babel standalone compatible avec architecture modulaire

**Action validée :** On peut procéder au refactoring progressif

---

## 🆕 Évolutions Récentes (Depuis Guide Initial)

### Nouveautés Ajoutées
1. **Section "Plage entière" (RangePleine.jsx)**
   - Calcul amplitude totale entre vitesses min/max
   - Suggestions avancées CAS 1, CAS 2, CAS 3
   - Recommandations basiques + optimisations artistiques

2. **Paramètres artistiques (SettingsPage.jsx)**
   - `artisticApertureMin/Max` - Zone de netteté optimale
   - `artisticIsoMin/Max` - Plage qualité acceptable
   - Intégration dans système de suggestions

3. **Système de versioning automatique**
   - Fichier `version.js` généré au déploiement
   - Affichage Git commit + timestamp dans UI
   - Format : "1.0 dev 260119" (menu) / "v1.0 dev abc1234" (footer)

4. **Migration indexation database**
   - Passage de `stop_third` → `stop_sixth`
   - Support 3 incréments : 1:1, 1:2, 1:3
   - Meilleure précision calculs

5. **Extension Canon EOS R1**
   - ISO jusqu'à 409600 (H2)
   - Vitesses jusqu'à 1/64000 (obturateur électronique)
   - Database photoDatabase.js étendue

6. **Fonction `renderSuggestion` helper**
   - Gestion lien cliquable "(désactiver)" pour limite astrophoto
   - Extraction dans `/utils/helpers.js`
   - Utilisée dans CorrectionISO et CorrectionAperture

### Impact sur Architecture
- **App.jsx** : Toujours ~800+ lignes (besoin refactoring confirmé)
- **Nouvelles fonctions à extraire** :
  - `calculateRangePleine()` (logique complexe CAS 1/2/3)
  - Logique suggestions artistiques
  - Gestion paramètres artistiques dans calculs

---

## 🏗️ Architecture Actuelle (Janvier 2025)

### Structure des Fichiers
```
hdr_calculator/
├── index.html                 # Point d'entrée
├── version.js                 # 🆕 Versioning auto (généré au déploiement)
├── App.jsx                    # ⚠️ 800+ lignes (à réduire)
├── data/
│   └── photoDatabase.js       # 🆕 Base données étendue (EOS R1, stop_sixth)
├── utils/
│   ├── utils.js               # Fonctions filtrage/options
│   ├── helpers.js             # 🆕 renderSuggestion (lien désactiver astrophoto)
│   └── testCalculation.js     # 🧪 Tests validation (à supprimer après refactoring)
├── components/
│   ├── Header.jsx             # En-tête + menu burger
│   ├── Menu.jsx               # 🆕 Navigation + affichage version
│   ├── MainSection.jsx        # Vue centrée (calcul principal)
│   ├── CorrectionISO.jsx      # Correction avec ISO variable
│   ├── CorrectionAperture.jsx # Correction avec ouverture variable
│   ├── RangePleine.jsx        # 🆕 Amplitude totale + suggestions CAS 1/2/3
│   ├── SettingsPage.jsx       # 🆕 Config matériel + paramètres artistiques
│   └── Footer.jsx             # 🆕 Pied de page + version Git
└── styles.js                  # Styles centralisés (variable globale)
```

### Dépendances Actuelles
- **React 18** (CDN unpkg)
- **ReactDOM 18** (CDN unpkg)
- **Babel Standalone** (transpilation navigateur)
- **Pas de build step** (fichiers chargés directement)

---

## 🚀 Refactoring Progressif (Phase 2)

### Objectif
Améliorer la maintenabilité **sans changer d'outils** ni impacter l'utilisateur.

### Étape 1 : Extraction Logique Métier (Priorité 1)
**Fichier à créer :** `/utils/calculationEngine.js`

**Fonctions à extraire de `App.jsx` :**
```javascript
// Calculs HDR
- calculateHDRSequence()        // Calcul séquence bracketing
- calculateCorrection1()        // Correction ISO + suggestions optimisées
- calculateCorrection2()        // Correction Ouverture + suggestions optimisées
- calculateRangePleine()        // 🆕 Amplitude totale + CAS 1/2/3

// Filtres et validations
- getValidIsos()                // ISO compatibles
- getValidApertures()           // Ouvertures compatibles

// 🆕 Helpers suggestions
- Logique CAS_1 (priorité ISO)
- Logique CAS_2 (priorité ouverture)
- Logique CAS_3 (qualité +)
```

**Bénéfices :**
- App.jsx réduit de 800 → ~300 lignes
- Fonctions réutilisables facilement
- Tests unitaires possibles
- Logique séparée de l'interface

**Estimation :** 1-2h de travail

---

### Étape 2 : Stockage Préférences Utilisateur (Priorité 2)
**Fichier à créer :** `/services/storageService.js`

**Fonctionnalités :**
```javascript
// Sauvegarder paramètres
- saveSettings(settings)        // Enregistre dans localStorage
- loadSettings()                // Charge au démarrage
- clearSettings()               // Réinitialisation

// Historique calculs (optionnel)
- saveLastCalculation()
- getCalculationHistory()
```

**Stockage localStorage :**
```javascript
{
  "hdr_settings": {
    "cameraType": "reflex_mechanical",
    "increment": "1:3",
    "isoMin": 3,
    "isoMax": 21,
    // ... tous les paramètres settings
  },
  "last_calculation": {
    "aperture": 9,
    "shutter": 34,
    // ... valeurs mainValues
  }
}
```

**Bénéfices :**
- ✅ Utilisateur ne perd plus ses réglages
- ✅ Reprise là où il s'est arrêté
- ✅ Base pour sync cloud future

**Estimation :** 30min de travail

---

### Étape 3 : Mode Expert (Priorité 3)
**Fichier à modifier :** `App.jsx` + composants concernés

**⚠️ STATUT : Partiellement implémenté**
- ✅ Paramètres artistiques ajoutés dans SettingsPage
- ⏸️ Toggle ON/OFF Mode Expert reste à faire

**Fonctionnalité :**
```javascript
// Nouveau state
const [expertMode, setExpertMode] = useState(false);

// Toggle dans Menu.jsx
<div onClick={() => setExpertMode(!expertMode)}>
  <span>🔬</span>
  <span>Mode Expert {expertMode ? 'ON' : 'OFF'}</span>
</div>
```

**Sections à masquer/afficher :**
- 🟣 **Plage entière** (RangePleine.jsx) - ✅ Déjà créée
- 🎨 **Paramètres artistiques** (dans SettingsPage.jsx) - ✅ Déjà créés
- 📊 **Statistiques avancées** (durée détaillée, stop_sixth) - ⏸️ À faire

**Interface Simplifiée (Mode Normal) :**
- Vue centrée
- Correction ISO
- Correction Ouverture
- Paramètres techniques de base

**Interface Complète (Mode Expert) :**
- Tout ci-dessus
- + Plage entière ✅
- + Paramètres artistiques ✅
- + Affichage stop_sixth ⏸️
- + Specs Canon EOS R1 ✅

**Bénéfices :**
- ✅ Débutants pas submergés
- ✅ Experts gardent contrôle total
- ✅ Interface plus claire par défaut

**Estimation :** 30min de travail (juste le toggle, contenu déjà fait)

---

### Étape 4 : Amélioration HTML/CSS (Priorité 4)
**Fichiers à modifier :** `styles.js` + tous composants

**Objectif :** Ajouter IDs/classes uniques pour :
- SEO amélioré
- Tests automatisés
- Intégration analytics future

**Exemple :**
```javascript
// Avant
<div style={appStyles.resultCard('success')}>

// Après
<div 
  id="main-result-card"
  className="result-card result-card--success"
  style={appStyles.resultCard('success')}
>
```

**Convention de nommage :**
```
BEM (Block Element Modifier)
- Block: .result-card
- Element: .result-card__header
- Modifier: .result-card--success, .result-card--error
```

**Bénéfices :**
- ✅ Code plus lisible
- ✅ Debug facilité
- ✅ Préparation PWA/SEO

**Estimation :** 30min de travail

---

## 📱 Optimisation Mobile (En cours)

### Points Forts Actuels ✅
- Grid CSS responsive (`repeat(auto-fit, minmax(200px, 1fr))`)
- Tailles de police adaptatives (`rem`, `vw`)
- Menu hamburger pour petit écran
- Pas d'images lourdes (emojis Unicode)

### Améliorations à Envisager
```javascript
// Détection taille écran
const isMobile = window.innerWidth <= 768;
const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

// Ajustements UI mobiles
select: {
  fontSize: isMobile ? '16px' : '14px', // Évite zoom auto iOS
  padding: isMobile ? '14px' : '12px',
  minHeight: isMobile ? '44px' : 'auto' // Touch target iOS
}
```

### Touch Gestures (optionnel futur)
- Swipe gauche/droite pour sections
- Pinch to zoom sur résultats
- Long press pour infos détaillées

**Estimation :** 1h si nécessaire

---

## 🔮 Évolutions Futures (Non Prioritaires)

### Phase 3 : PWA (Progressive Web App)
**Quand :** Si demande utilisateurs OU besoin mode hors-ligne

**Fichiers à ajouter :**
```
├── manifest.json              # Config PWA
├── service-worker.js          # Cache offline
└── icons/                     # Icônes app (144x144, 512x512)
```

**Bénéfices :**
- ✅ Installable sur mobile (comme une app)
- ✅ Fonctionne hors-ligne
- ✅ Icône écran d'accueil
- ✅ Notifications push (si besoin)

**Effort :** 2-3h (avec outils comme Workbox)

---

### Phase 4 : App Mobile Hybride (Capacitor/Cordova)
**Quand :** Si besoin accès fonctions natives (appareil photo, GPS, etc.)

**Outils :**
- **Capacitor** (recommandé, moderne)
- **Cordova** (plus ancien mais stable)

**Fonctionnalités natives possibles :**
- Accès EXIF photos (lecture paramètres réels)
- Géolocalisation (conditions lumineuses selon lieu)
- Stockage fichiers local

**Effort :** 1 semaine (si déjà PWA fait)

---

### Phase 5 : Backend + Comptes Utilisateurs
**Quand :** Si besoin sync multi-devices OU modèle freemium

**Stack Backend Possible :**
```
Option A (Simple) : Supabase
- Auth intégré
- Base données PostgreSQL
- Stockage fichiers
- Gratuit jusqu'à 50k utilisateurs

Option B (Flexible) : Firebase
- Auth Google/Apple/Email
- Firestore (NoSQL)
- Gratuit jusqu'à 10k utilisateurs

Option C (Full Control) : Node.js + MongoDB
- Hébergement perso
- Total contrôle
- Plus complexe
```

**Fonctionnalités Backend :**
- Sync paramètres entre devices
- Historique calculs
- Partage configurations
- Statistiques d'usage

**Effort :** 2-3 semaines

---

### Phase 6 : Modèle Freemium
**Quand :** Si monétisation souhaitée

**Version Gratuite (toujours accessible) :**
- ✅ Vue centrée
- ✅ Corrections ISO/Ouverture
- ✅ Paramètres techniques de base
- ✅ 3 configurations sauvegardées

**Version Pro (payante) :**
- 🔓 Plage entière + suggestions avancées
- 🔓 Paramètres artistiques
- 🔓 Specs appareils haut de gamme (EOS R1, etc.)
- 🔓 Historique illimité
- 🔓 Export PDF des calculs
- 🔓 Mode hors-ligne garanti
- 🔓 Sync cloud multi-devices

**Prix suggéré :**
- 2,99€ one-time purchase
- OU 0,99€/mois abonnement

**Plateforme de paiement :**
- Stripe (web)
- Apple/Google Pay (app mobile)

**Effort :** 1 semaine (intégration paiement)

---

## 🛠️ Migration Outils (Optionnel)

### Passer à Vite + React
**Quand :** Si projet dépasse 20 composants OU besoin TypeScript

**Avantages :**
- Hot Module Replacement (dev ultra-rapide)
- Build optimisé (app plus légère)
- TypeScript natif
- Meilleurs outils debug

**Inconvénients :**
- Courbe apprentissage
- Build step nécessaire
- Node.js requis

**Effort migration :** 1-2 jours (avec code actuel bien structuré)

**Décision :** ⏸️ PAS URGENT pour l'instant

---

## 📊 Métriques de Décision

### Quand Refactorer ? (Phase 2)
✅ **OUI maintenant** si :
- Difficulté à ajouter nouvelle fonctionnalité
- Bugs fréquents
- App.jsx dépasse 1000 lignes

### Quand PWA ? (Phase 3)
✅ **OUI** si :
- >100 utilisateurs actifs
- Demandes "installer l'app"
- Besoin mode hors-ligne

### Quand Backend ? (Phase 5)
✅ **OUI** si :
- Besoin sync devices
- Statistiques d'usage nécessaires
- Modèle freemium envisagé

### Quand Vite ? (Migration outils)
✅ **OUI** si :
- >30 composants
- Temps de dev frustrant
- Collaboration avec devs

---

## 🎯 Recommandations Immédiates

### À Faire Maintenant (Court Terme)
1. ✅ **Nettoyer** : Supprimer `/utils/testCalculation.js` (tests validés)
2. ✅ **Refactorer** : Extraire logique → `/utils/calculationEngine.js`
3. ✅ **Stocker** : Implémenter localStorage → `/services/storageService.js`
4. ✅ **Simplifier** : Ajouter Mode Expert toggle

**Estimation totale :** 1 journée de travail

### À Planifier (Moyen Terme)
- IDs/classes uniques HTML
- Tests unitaires basiques
- Documentation JSDoc

**Estimation :** 2-3h

### À Surveiller (Long Terme)
- Feedback utilisateurs
- Demandes fonctionnalités
- Performance mobile

---

## 📝 Checklist Évolution

### Phase 2 - Refactoring (EN COURS)
- [ ] Extraire `calculateHDRSequence()` → `/utils/calculationEngine.js`
- [ ] Extraire `calculateCorrection1()` → `/utils/calculationEngine.js`
- [ ] Extraire `calculateCorrection2()` → `/utils/calculationEngine.js`
- [ ] Extraire `calculateRangePleine()` → `/utils/calculationEngine.js` 🆕
- [ ] Extraire logique suggestions CAS 1/2/3 → `/utils/suggestionEngine.js` 🆕
- [ ] Créer `/services/storageService.js`
- [ ] Implémenter `saveSettings()` / `loadSettings()`
- [ ] Ajouter toggle Mode Expert (déjà partiellement fait)
- [ ] Tester sur mobile (iOS + Android)
- [ ] Supprimer fichiers de test (`testCalculation.js`)
- [ ] 🆕 Documenter paramètres artistiques
- [ ] 🆕 Valider compatibilité stop_sixth dans tous calculs

### Phase 3 - PWA (SI BESOIN)
- [ ] Créer `manifest.json`
- [ ] Créer `service-worker.js`
- [ ] Générer icônes app
- [ ] Tester installation mobile
- [ ] Valider mode hors-ligne

### Phase 5 - Backend (SI BESOIN)
- [ ] Choisir stack (Supabase/Firebase/Custom)
- [ ] Configurer auth utilisateurs
- [ ] Migrer stockage local → cloud
- [ ] Implémenter sync devices
- [ ] Tester avec vrais users

### Phase 6 - Freemium (SI BESOIN)
- [ ] Définir frontière gratuit/payant
- [ ] Intégrer Stripe/Apple Pay
- [ ] Créer page pricing
- [ ] Implémenter restrictions fonctionnalités
- [ ] Tests paiement (sandbox puis prod)

---

## 🚫 Portes à NE PAS Fermer

### Architecture
✅ **Garder** : Structure modulaire (composants séparés)  
✅ **Garder** : Variables globales bien nommées (`photoDatabase`, `cameraTypes`)  
✅ **Garder** : Logique métier séparée de l'UI (après refactoring)

### Données
✅ **Format JSON** pour database (compatible backend futur)  
✅ **Système stop_sixth** extensible (nouveaux appareils)

### UI/UX
✅ **Mobile-first** : toujours tester sur smartphone  
✅ **Progressive disclosure** : commencer simple, enrichir si besoin

---

## 🎓 Ressources Apprentissage (Si Migration Futur)

### PWA
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google Workbox](https://developers.google.com/web/tools/workbox) (service worker facile)

### Vite + React
- [Vite Official Guide](https://vitejs.dev/guide/)
- [Vite React Template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react)

### Backend
- [Supabase Docs](https://supabase.com/docs) (le plus simple)
- [Firebase Docs](https://firebase.google.com/docs)

### Freemium
- [Stripe Documentation](https://stripe.com/docs)
- [RevenueCat](https://www.revenuecat.com/) (gestion abonnements simplifiée)

---

## 💬 Notes Personnelles

### Pourquoi Cette Architecture ?
- ✅ Simple à maintenir seul
- ✅ Déploiement gratuit (GitHub Pages, Netlify)
- ✅ Pas de dépendances complexes
- ✅ Évolutive sans tout réécrire

### Philosophie Projet
> "Commencer simple, évoluer progressivement, ne rien casser"

### Prochaine Revue
📅 **Février 2025** : Valider Phase 2 terminée + décider Phase 3

---

**Dernière mise à jour :** Janvier 2025  
**Créé par :** Claude (Assistant IA)  
**Maintenu par :** Julien (Propriétaire projet)

---

## 📞 Contacts / Liens Utiles

- **GitHub Repo :** https://github.com/Gotcha26/hdr_calculator/tree/dev
- **Hébergement :** (À définir)
- **Feedback :** (À définir)

---

> 💡 **Règle d'or :** Si une décision te bloque, c'est qu'elle est prématurée. Reviens sur ce document et demande-toi "Ai-je vraiment besoin de ça MAINTENANT ?"