# 🔧 Plan Technique - Migration Phase 2 : Extraction Logique Métier

**Date :** Janvier 2025  
**Objectif :** Réduire App.jsx de 800+ → ~300 lignes  
**Principe :** Extraction progressive sans casser le fonctionnement  
**Rollback :** Possible à chaque étape via Git

---

## 🎯 Vue d'Ensemble de la Migration

### Situation Actuelle
```
App.jsx (800+ lignes)
├── calculateHDRSequence()          ~100 lignes
├── calculateCorrection1()          ~80 lignes
├── calculateCorrection2()          ~70 lignes
├── calculateRangePleine()          ~200 lignes
├── getValidIsos()                  ~20 lignes
├── getValidApertures()             ~20 lignes
└── Composant React HDRCalculator   ~310 lignes
```

### Situation Cible
```
/utils/calculationEngine.js
├── calculateHDRSequence()
├── calculateCorrection1()
├── calculateCorrection2()
└── calculateRangePleine()

/utils/validationEngine.js
├── getValidIsos()
└── getValidApertures()

App.jsx (~300 lignes)
└── HDRCalculator (orchestration uniquement)
```

---

## ⚙️ Prérequis Techniques

### Variables Globales Requises
Ces variables DOIVENT être accessibles depuis les fonctions extraites :

```javascript
// Depuis data/photoDatabase.js
- photoDatabase.iso_values.values
- photoDatabase.shutter_speeds.values
- photoDatabase.aperture_values.values
- cameraTypes

// Depuis utils/utils.js
- filterByIncrementAndLimits()
- getSpacingOptions()
```

### Dépendances Validées
✅ Test réussi (Janvier 2025) : `/utils/testCalculation.js`
- Fonction externe callable depuis App.jsx ✓
- Accès photoDatabase ✓
- Accès cameraTypes ✓

---

## 📝 Étape 1 : Extraction calculateHDRSequence()

### 1.1 Créer le Fichier
**Fichier :** `/utils/calculationEngine.js`

```javascript
// utils/calculationEngine.js - Moteur de calcul HDR

/**
 * Calcule une séquence HDR avec bracketing
 * @param {number} centerShutterIndex - Index vitesse centrale dans photoDatabase
 * @param {number} centerApertureIndex - Index ouverture dans photoDatabase
 * @param {number} centerIsoIndex - Index ISO dans photoDatabase
 * @param {number} brackets - Nombre d'images (impair: 3, 5, 7, 9)
 * @param {number} spacing - Espacement en EV (0.33, 0.67, 1, 1.33, etc.)
 * @param {object} settings - Objet settings complet de l'app
 * @param {boolean} skipSuggestions - Si true, pas de suggestions générées
 * @returns {object} { sequence, totalDuration, errors, suggestions, speedErrors, durationExceeded, durationWarning }
 */
function calculateHDRSequence(
  centerShutterIndex, 
  centerApertureIndex, 
  centerIsoIndex, 
  brackets, 
  spacing, 
  settings,
  skipSuggestions = false
) {
  const halfBrackets = Math.floor(brackets / 2);
  const sequence = [];
  const errors = [];
  const suggestions = [];
  
  const cameraData = cameraTypes[settings.cameraType];
  const minTimePerShot = cameraData.minTime + cameraData.bufferDelay;
  
  let totalDuration = 0;
  let speedErrors = { min: null, max: null };
  
  for (let i = -halfBrackets; i <= halfBrackets; i++) {
    const evShift = i * spacing;
    const targetStopSixth = photoDatabase.shutter_speeds.values[centerShutterIndex].stop_sixth + (evShift * 6);
    
    let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
      Math.abs(curr.stop_sixth - targetStopSixth) < Math.abs(prev.stop_sixth - targetStopSixth) ? curr : prev
    );
    
    const minSpeed = photoDatabase.shutter_speeds.values[settings.speedMin];
    const maxSpeed = photoDatabase.shutter_speeds.values[settings.speedMax];
    
    if (targetStopSixth < minSpeed.stop_sixth) {
      speedErrors.min = { speed: closestShutter.display, limit: minSpeed.display };
    }
    
    if (targetStopSixth > maxSpeed.stop_sixth) {
      speedErrors.max = { speed: closestShutter.display, limit: maxSpeed.display };
    }
    
    const shotDuration = Math.max(closestShutter.numeric, minTimePerShot);
    totalDuration += shotDuration;
    
    sequence.push({
      ev: evShift,
      shutter: closestShutter,
      duration: shotDuration
    });
  }
  
  if (speedErrors.min) {
    errors.push(`Vitesse ${speedErrors.min.speed} trop lente (limite: ${speedErrors.min.limit})`);
  }
  if (speedErrors.max) {
    errors.push(`Vitesse ${speedErrors.max.speed} trop rapide (limite: ${speedErrors.max.limit})`);
  }
  
  const durationExceeded = settings.durationLimit < 100 && totalDuration > settings.durationLimit;
  const durationWarning = durationExceeded;
  
  const totalDynamicRange = (brackets - 1) * spacing;
  if (totalDynamicRange > settings.sensorDynamicRange) {
    errors.push(`Plage dynamique ${totalDynamicRange} EV dépasse capacité capteur (${settings.sensorDynamicRange} EV)`);
  }
  
  if (errors.length === 0 && !skipSuggestions && !durationWarning) {
    const minIso = photoDatabase.iso_values.values[settings.isoMin];
    const currentIso = photoDatabase.iso_values.values[centerIsoIndex];
    
    if (currentIso.stop_sixth > minIso.stop_sixth) {
      const testIsoIndex = settings.isoMin;
      const isoShift = currentIso.stop_sixth - minIso.stop_sixth;
      const testShutterIndex = centerShutterIndex - isoShift;
      
      const testResult = calculateHDRSequence(testShutterIndex, centerApertureIndex, testIsoIndex, brackets, spacing, settings, true);
      
      if (testResult.errors.length === 0 && !testResult.durationWarning) {
        suggestions.push(`💡 Qualité optimale possible: baissez l'ISO à ${minIso.display}`);
      }
    }
    
    if (settings.durationLimit < 100) {
      const marginTime = settings.durationLimit - totalDuration;
      if (marginTime > 0.5) {
        suggestions.push(`✓ Marge temporelle: ${marginTime.toFixed(2)}s disponibles`);
      }
    }
  }
  
  return { sequence, totalDuration, errors, suggestions, speedErrors, durationExceeded, durationWarning };
}
```

### 1.2 Modifier index.html
**Ajouter APRÈS `utils/utils.js` :**

```html
<!-- 3. Utilitaires -->
<script src="utils/utils.js"></script>
<script src="utils/calculationEngine.js"></script> <!-- NOUVEAU -->
```

### 1.3 Modifier App.jsx
**SUPPRIMER la fonction calculateHDRSequence complète (lignes ~X à ~Y)**

**MODIFIER les appels :**
```javascript
// AVANT
const mainResult = calculateHDRSequence(
  mainValues.shutter,
  mainValues.aperture,
  mainValues.iso,
  mainValues.brackets,
  mainValues.spacing
);

// APRÈS (ajouter settings en paramètre)
const mainResult = calculateHDRSequence(
  mainValues.shutter,
  mainValues.aperture,
  mainValues.iso,
  mainValues.brackets,
  mainValues.spacing,
  settings  // AJOUTER CE PARAMÈTRE
);
```

**⚠️ TOUS les appels à calculateHDRSequence DOIVENT inclure `settings` :**
- Dans `calculateCorrection1()` (appels récursifs)
- Dans `calculateCorrection2()` (appels récursifs)
- Dans `calculateRangePleine()` (appels pour CAS 1/2/3)

### 1.4 Test de Validation
```bash
# 1. Sauvegarder l'état avant modif
git add .
git commit -m "checkpoint: avant extraction calculateHDRSequence"

# 2. Effectuer les modifications

# 3. Tester l'application
# - Ouvrir dans navigateur
# - Tester Vue centrée
# - Tester Correction ISO
# - Tester Correction Ouverture
# - Tester Plage entière
# - Vérifier console (pas d'erreur)

# 4. Si OK : commit
git add .
git commit -m "refactor: extraction calculateHDRSequence → calculationEngine.js"

# 5. Si KO : rollback
git reset --hard HEAD~1
```

---

## 📝 Étape 2 : Extraction calculateCorrection1()

### 2.1 Ajouter dans calculationEngine.js

```javascript
/**
 * Calcule correction ISO avec suggestions optimisées
 * @param {number} newIsoIndex - Index du nouvel ISO
 * @param {object} mainValues - { aperture, shutter, iso, brackets, spacing }
 * @param {object} settings - Paramètres app complets
 * @returns {object} Résultat calcul + suggestions spécifiques ISO
 */
function calculateCorrection1(newIsoIndex, mainValues, settings) {
  const isoShift = photoDatabase.iso_values.values[newIsoIndex].stop_sixth - 
                   photoDatabase.iso_values.values[mainValues.iso].stop_sixth;
  
  const adjustedShutterIndex = mainValues.shutter + isoShift;
  
  const result = calculateHDRSequence(
    adjustedShutterIndex,
    mainValues.aperture,
    newIsoIndex,
    mainValues.brackets,
    mainValues.spacing,
    settings,
    true
  );
  
  const specificSuggestions = [];
  const currentIso = photoDatabase.iso_values.values[newIsoIndex];
  const minIso = photoDatabase.iso_values.values[settings.isoMin];
  
  if (result.errors.length > 0) {
    specificSuggestions.push(`❌ Réglage impossible avec les limites techniques actuelles`);
    
    if (result.speedErrors.max) {
      specificSuggestions.push(`→ Vitesse trop rapide : augmentez l'ISO`);
    }
    if (result.speedErrors.min) {
      specificSuggestions.push(`→ Vitesse trop lente : diminuez l'ISO`);
    }
  } else {
    if (currentIso.stop_sixth > minIso.stop_sixth) {
      let bestIsoIndex = newIsoIndex;
      let bestIso = currentIso;
      
      const filteredIsos = filterByIncrementAndLimits(
        photoDatabase.iso_values.values,
        settings.increment,
        settings.isoMin,
        settings.isoMax
      );
      
      const currentIndexInFiltered = filteredIsos.indexOf(currentIso);
      
      for (let i = currentIndexInFiltered - 1; i >= 0; i--) {
        const testIso = filteredIsos[i];
        const testIsoIndex = photoDatabase.iso_values.values.indexOf(testIso);
        const testIsoShift = testIso.stop_sixth - photoDatabase.iso_values.values[mainValues.iso].stop_sixth;
        const testShutterIndex = mainValues.shutter + testIsoShift;
        
        const testResult = calculateHDRSequence(
          testShutterIndex,
          mainValues.aperture,
          testIsoIndex,
          mainValues.brackets,
          mainValues.spacing,
          settings,
          true
        );
        
        if (testResult.errors.length === 0) {
          bestIsoIndex = testIsoIndex;
          bestIso = testIso;
        } else {
          break;
        }
      }
      
      if (bestIsoIndex !== newIsoIndex) {
        const cransDiff = Math.abs(currentIndexInFiltered - filteredIsos.indexOf(bestIso));
        
        const bestIsoShift = bestIso.stop_sixth - photoDatabase.iso_values.values[mainValues.iso].stop_sixth;
        const bestShutterIndex = mainValues.shutter + bestIsoShift;
        const bestResult = calculateHDRSequence(
          bestShutterIndex,
          mainValues.aperture,
          photoDatabase.iso_values.values.indexOf(bestIso),
          mainValues.brackets,
          mainValues.spacing,
          settings,
          true
        );
        
        specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
        if (result.durationWarning) {
          specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
        } else {
          specificSuggestions.push(`✅ Durée compatible astrophoto`);
        }
        
        specificSuggestions.push(`💡 Optimum technique : ISO ${bestIso.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''} plus bas)`);
        
        const optimalDurationStatus = bestResult.durationWarning ? '⚠️ Dépasse limite' : '✅ Compatible';
        specificSuggestions.push(`🎯 Durée optimale : ${bestResult.totalDuration.toFixed(2)}s - ${optimalDurationStatus}`);
        
      } else if (bestIso.stop_sixth > minIso.stop_sixth) {
        specificSuggestions.push(`⏱️ Durée : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
        if (result.durationWarning) {
          specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
        } else {
          specificSuggestions.push(`✅ Durée compatible astrophoto`);
        }
        specificSuggestions.push(`⚠️ Limite technique atteinte`);
      } else {
        specificSuggestions.push(`⏱️ Durée : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
        if (result.durationWarning) {
          specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
        } else {
          specificSuggestions.push(`✅ Durée compatible astrophoto`);
        }
        specificSuggestions.push(`✅ ISO minimal atteint : qualité optimale`);
      }
    } else {
      specificSuggestions.push(`⏱️ Durée : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
      if (result.durationWarning) {
        specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
      } else {
        specificSuggestions.push(`✅ Durée compatible astrophoto`);
      }
      specificSuggestions.push(`✅ ISO minimal atteint : qualité optimale`);
    }
  }
  
  return { ...result, suggestions: specificSuggestions };
}
```

### 2.2 Modifier App.jsx
**SUPPRIMER la fonction calculateCorrection1**

**MODIFIER l'appel :**
```javascript
// AVANT
const correction1Result = calculateCorrection1();

// APRÈS
const correction1Result = calculateCorrection1(correction1Iso, mainValues, settings);
```

### 2.3 Test de Validation
```bash
git add .
git commit -m "checkpoint: avant extraction calculateCorrection1"
# ... effectuer modifs ...
# ... tester ...
git add .
git commit -m "refactor: extraction calculateCorrection1 → calculationEngine.js"
```

---

## 📝 Étape 3 : Extraction calculateCorrection2()

### 3.1 Ajouter dans calculationEngine.js

```javascript
/**
 * Calcule correction Ouverture avec suggestions optimisées
 * @param {number} newApertureIndex - Index nouvelle ouverture
 * @param {object} mainValues - { aperture, shutter, iso, brackets, spacing }
 * @param {object} settings - Paramètres app complets
 * @returns {object} Résultat calcul + suggestions spécifiques ouverture
 */
function calculateCorrection2(newApertureIndex, mainValues, settings) {
  const apertureShift = photoDatabase.aperture_values.values[newApertureIndex].stop_sixth - 
                        photoDatabase.aperture_values.values[mainValues.aperture].stop_sixth;
  
  const adjustedShutterIndex = mainValues.shutter - apertureShift;
  
  const result = calculateHDRSequence(
    adjustedShutterIndex,
    newApertureIndex,
    mainValues.iso,
    mainValues.brackets,
    mainValues.spacing,
    settings,
    true
  );
  
  const specificSuggestions = [];
  const currentAperture = photoDatabase.aperture_values.values[newApertureIndex];
  const minAperture = photoDatabase.aperture_values.values[settings.apertureMin];
  const maxAperture = photoDatabase.aperture_values.values[settings.apertureMax];
  
  if (result.errors.length > 0) {
    specificSuggestions.push(`❌ Réglage impossible avec les limites techniques actuelles`);
    
    if (result.speedErrors.max) {
      specificSuggestions.push(`→ Vitesse trop rapide : fermez le diaphragme (augmentez f/)`);
      if (currentAperture.stop_sixth >= maxAperture.stop_sixth) {
        specificSuggestions.push(`🎯 Objectif au maximum (${maxAperture.display}) → Filtres ND`);
      }
    }
    if (result.speedErrors.min) {
      specificSuggestions.push(`→ Vitesse trop lente : ouvrez le diaphragme (diminuez f/)`);
      if (currentAperture.stop_sixth <= minAperture.stop_sixth) {
        specificSuggestions.push(`🎯 Objectif au maximum (${minAperture.display}) → Objectif plus lumineux (f/1.4, f/1.8)`);
      }
    }
  } else {
    const filteredApertures = filterByIncrementAndLimits(
      photoDatabase.aperture_values.values,
      settings.increment,
      settings.apertureMin,
      settings.apertureMax
    );
    
    const currentIndexInFiltered = filteredApertures.indexOf(currentAperture);
    
    let bestAperture = null;
    let bestApertureIndex = -1;
    let bestDuration = result.totalDuration;
    let cransDiff = 0;
    
    for (let i = 0; i < filteredApertures.length; i++) {
      const testAperture = filteredApertures[i];
      if (testAperture.numeric >= 5.6 && testAperture.numeric <= 8) {
        const testApertureIndex = photoDatabase.aperture_values.values.indexOf(testAperture);
        const testApertureShift = testAperture.stop_sixth - photoDatabase.aperture_values.values[mainValues.aperture].stop_sixth;
        const testShutterIndex = mainValues.shutter - testApertureShift;
        
        const testResult = calculateHDRSequence(
          testShutterIndex,
          testApertureIndex,
          mainValues.iso,
          mainValues.brackets,
          mainValues.spacing,
          settings,
          true
        );
        
        if (testResult.errors.length === 0 && !testResult.durationWarning) {
          bestAperture = testAperture;
          bestApertureIndex = testApertureIndex;
          bestDuration = testResult.totalDuration;
          cransDiff = Math.abs(i - currentIndexInFiltered);
          break;
        }
      }
    }
    
    specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
    if (result.durationWarning) {
      specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
    } else {
      specificSuggestions.push(`✅ Durée compatible astrophoto`);
    }
    
    if (bestAperture && bestApertureIndex !== newApertureIndex) {
      specificSuggestions.push(`💡 Optimum technique : ${bestAperture.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''})`);
      
      const optimalDurationStatus = bestDuration <= settings.durationLimit || settings.durationLimit >= 100 ? '✅ Compatible' : '⚠️ Dépasse limite';
      specificSuggestions.push(`🎯 Durée optimale : ${bestDuration.toFixed(2)}s - ${optimalDurationStatus}`);
    } else {
      if (currentAperture.numeric >= 5.6 && currentAperture.numeric <= 11) {
        specificSuggestions.push(`✅ Zone de netteté optimale atteinte`);
      } else if (currentAperture.numeric < 2.8) {
        specificSuggestions.push(`⚠️ Ouverture très large : profondeur de champ limitée`);
      } else if (currentAperture.numeric > 16) {
        specificSuggestions.push(`⚠️ Ouverture très fermée : attention à la diffraction`);
      }
    }
  }
  
  return { ...result, suggestions: specificSuggestions };
}
```

### 3.2 Modifier App.jsx
**SUPPRIMER la fonction calculateCorrection2**

**MODIFIER l'appel :**
```javascript
// AVANT
const correction2Result = calculateCorrection2();

// APRÈS
const correction2Result = calculateCorrection2(correction2Aperture, mainValues, settings);
```

### 3.3 Test de Validation
```bash
git add .
git commit -m "checkpoint: avant extraction calculateCorrection2"
# ... effectuer modifs ...
# ... tester ...
git add .
git commit -m "refactor: extraction calculateCorrection2 → calculationEngine.js"
```

---

## 📝 Étape 4 : Extraction calculateRangePleine()

### 4.1 Ajouter dans calculationEngine.js

**⚠️ ATTENTION : Fonction complexe avec logique CAS 1/2/3**

```javascript
/**
 * Calcule l'amplitude totale d'une plage de vitesses + suggestions CAS 1/2/3
 * @param {object} rangeValues - { aperture, iso, speedMin, speedMax }
 * @param {object} settings - Paramètres app complets
 * @returns {object} { totalEV, totalCrans, centerSpeed, totalDuration, possibleSpacings, suggestions, errors }
 */
function calculateRangePleine(rangeValues, settings) {
  const errors = [];
  const suggestions = [];
  
  const minSpeed = photoDatabase.shutter_speeds.values[rangeValues.speedMin];
  const maxSpeed = photoDatabase.shutter_speeds.values[rangeValues.speedMax];
  
  if (maxSpeed.stop_sixth <= minSpeed.stop_sixth) {
    errors.push('La vitesse maximale doit être plus rapide que la vitesse minimale');
    return { 
      totalEV: 0, 
      totalCrans: 0, 
      centerSpeed: minSpeed,
      totalDuration: 0,
      possibleSpacings: [], 
      suggestions: [], 
      errors 
    };
  }
  
  const totalStopSixths = maxSpeed.stop_sixth - minSpeed.stop_sixth;
  const totalEV = totalStopSixths / 6;
  
  let totalCrans;
  if (settings.increment === '1:1') {
    totalCrans = totalStopSixths / 6;
  } else if (settings.increment === '1:2') {
    totalCrans = totalStopSixths / 3;
  } else {
    totalCrans = totalStopSixths / 2;
  }
  
  const centerStopSixth = Math.round((minSpeed.stop_sixth + maxSpeed.stop_sixth) / 2);
  const centerSpeed = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
    Math.abs(curr.stop_sixth - centerStopSixth) < Math.abs(prev.stop_sixth - centerStopSixth) ? curr : prev
  );
  
  const possibleSpacings = [];
  const cameraData = cameraTypes[settings.cameraType];
  const minTimePerShot = cameraData.minTime + cameraData.bufferDelay;
  
  const availableSpacings = getSpacingOptions(settings.increment);
  
  for (let brackets = settings.maxBrackets; brackets >= 3; brackets -= 2) {
    const halfBrackets = Math.floor(brackets / 2);
    
    const distanceToMin = centerSpeed.stop_sixth - minSpeed.stop_sixth;
    const distanceToMax = maxSpeed.stop_sixth - centerSpeed.stop_sixth;
    const maxDistanceEachSide = Math.min(distanceToMin, distanceToMax);
    
    const maxSpacingSixths = maxDistanceEachSide / halfBrackets;
    const maxSpacingEV = maxSpacingSixths / 6;
    
    for (let i = availableSpacings.length - 1; i >= 0; i--) {
      const spacing = availableSpacings[i];
      if (spacing <= maxSpacingEV) {
        possibleSpacings.push({
          value: spacing,
          brackets: brackets
        });
        break;
      }
    }
  }
  
  let totalDuration = 0;
  if (possibleSpacings.length > 0) {
    const optimalConfig = possibleSpacings[0];
    const halfBrackets = Math.floor(optimalConfig.brackets / 2);
    
    for (let i = -halfBrackets; i <= halfBrackets; i++) {
      const evShift = i * optimalConfig.value;
      const targetStopSixth = centerSpeed.stop_sixth + (evShift * 6);
      
      let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
        Math.abs(curr.stop_sixth - targetStopSixth) < Math.abs(prev.stop_sixth - targetStopSixth) ? curr : prev
      );
      
      const shotDuration = Math.max(closestShutter.numeric, minTimePerShot);
      totalDuration += shotDuration;
    }
  }
  
  // SUGGESTIONS ARTISTIQUES
  if (possibleSpacings.length === 0) {
    suggestions.push('⚠️ Amplitude trop faible : augmentez l\'écart entre vitesses min/max');
  } else {
    const optimalConfig = possibleSpacings[0];
    
    const basicRecommendations = [];
    basicRecommendations.push(`${centerSpeed.display}`);
    basicRecommendations.push(`${optimalConfig.brackets} images`);
    basicRecommendations.push(`${optimalConfig.value.toFixed(2)} EV`);
    
    const currentIso = photoDatabase.iso_values.values[rangeValues.iso];
    const currentAperture = photoDatabase.aperture_values.values[rangeValues.aperture];
    
    const artisticMinIso = photoDatabase.iso_values.values[settings.artisticIsoMin];
    const artisticMaxIso = photoDatabase.iso_values.values[settings.artisticIsoMax];
    const artisticMinAperture = photoDatabase.aperture_values.values[settings.artisticApertureMin];
    const artisticMaxAperture = photoDatabase.aperture_values.values[settings.artisticApertureMax];
    
    const halfBrackets = Math.floor(optimalConfig.brackets / 2);
    
    const advancedRecommendations = [];
    
    // CAS 1 : Priorité ISO
    const isoShift_cas1 = artisticMinIso.stop_sixth - currentIso.stop_sixth;
    
    let cas1_data = {
      hasOptimization: isoShift_cas1 < 0,
      isoFrom: currentIso.display,
      isoTo: artisticMinIso.display,
      stopSixth: isoShift_cas1,
      stopEV: (isoShift_cas1 / 6).toFixed(2),
      duration: 0
    };
    
    if (cas1_data.hasOptimization) {
      const newCenterSpeed_cas1 = centerSpeed.stop_sixth - isoShift_cas1;
      const centerSpeedObj_cas1 = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
        Math.abs(curr.stop_sixth - newCenterSpeed_cas1) < Math.abs(prev.stop_sixth - newCenterSpeed_cas1) ? curr : prev
      );
      
      for (let i = -halfBrackets; i <= halfBrackets; i++) {
        const evShift = i * optimalConfig.value;
        const targetStopSixth = centerSpeedObj_cas1.stop_sixth + (evShift * 6);
        let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
          Math.abs(curr.stop_sixth - targetStopSixth) < Math.abs(prev.stop_sixth - targetStopSixth) ? curr : prev
        );
        cas1_data.duration += Math.max(closestShutter.numeric, minTimePerShot);
      }
    }
    
    // CAS 2 : Priorité Ouverture
    const apertureShift_cas2 = artisticMaxAperture.stop_sixth - currentAperture.stop_sixth;
    
    let cas2_data = {
      hasOptimization: apertureShift_cas2 > 0,
      apertureFrom: currentAperture.display,
      apertureTo: artisticMaxAperture.display,
      stopSixth: apertureShift_cas2,
      stopEV: (apertureShift_cas2 / 6).toFixed(2),
      duration: 0
    };
    
    if (cas2_data.hasOptimization) {
      for (let i = -halfBrackets; i <= halfBrackets; i++) {
        const evShift = i * optimalConfig.value;
        const targetStopSixth = centerSpeed.stop_sixth + (evShift * 6);
        let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
          Math.abs(curr.stop_sixth - targetStopSixth) < Math.abs(prev.stop_sixth - targetStopSixth) ? curr : prev
        );
        cas2_data.duration += Math.max(closestShutter.numeric, minTimePerShot);
      }
    }
    
    // CAS 3 : Qualité +
    const totalShift_cas3 = (isoShift_cas1 < 0 ? isoShift_cas1 : 0) + (apertureShift_cas2 > 0 ? apertureShift_cas2 : 0);
    const newCenterSpeed_cas3_stopThird = centerSpeed.stop_sixth - totalShift_cas3;
    const centerSpeedObj_cas3 = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
      Math.abs(curr.stop_sixth - newCenterSpeed_cas3_stopThird) < Math.abs(prev.stop_sixth - newCenterSpeed_cas3_stopThird) ? curr : prev
    );
    
    let cas3_poseLongue = null;
    let cas3_poseRapide = null;
    let cas3_duration = 0;
    
    for (let i = -halfBrackets; i <= halfBrackets; i++) {
      const evShift = i * optimalConfig.value;
      const targetStopSixth = centerSpeedObj_cas3.stop_sixth + (evShift * 6);
      let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
        Math.abs(curr.stop_sixth - targetStopSixth) < Math.abs(prev.stop_sixth - targetStopSixth) ? curr : prev
      );
      
      if (i === -halfBrackets) cas3_poseLongue = closestShutter;
      if (i === halfBrackets) cas3_poseRapide = closestShutter;
      
      cas3_duration += Math.max(closestShutter.numeric, minTimePerShot);
    }
    
    let cas3_data = {
      isoOptimal: cas1_data.hasOptimization ? artisticMinIso.display : currentIso.display,
      isoChanged: cas1_data.hasOptimization,
      apertureOptimal: cas2_data.hasOptimization ? artisticMaxAperture.display : currentAperture.display,
      apertureChanged: cas2_data.hasOptimization,
      vueCentree: centerSpeedObj_cas3.display,
      stopSixth: totalShift_cas3,
      stopEV: (totalShift_cas3 / 6).toFixed(2),
      brackets: optimalConfig.brackets,
      spacing: optimalConfig.value,
      poseLongue: cas3_poseLongue.display,
      poseRapide: cas3_poseRapide.display,
      duration: cas3_duration
    };
    
    advancedRecommendations.push({
      type: 'CAS_1',
      data: cas1_data
    });
    
    advancedRecommendations.push({
      type: 'CAS_2',
      data: cas2_data
    });
    
    advancedRecommendations.push({
      type: 'CAS_3',
      data: cas3_data
    });
    
    suggestions.push(...basicRecommendations);
    suggestions.push(...advancedRecommendations);
  }
  
  return { 
    totalEV, 
    totalCrans, 
    centerSpeed,
    totalDuration,
    possibleSpacings, 
    suggestions, 
    errors 
  };
}
```

### 4.2 Modifier App.jsx
**SUPPRIMER la fonction calculateRangePleine**

**MODIFIER l'appel :**
```javascript
// AVANT
const rangeResult = calculateRangePleine();

// APRÈS
const rangeResult = calculateRangePleine(rangeValues, settings);
```

### 4.3 Test de Validation
```bash
git add .
git commit -m "checkpoint: avant extraction calculateRangePleine"
# ... effectuer modifs ...
# ... tester SURTOUT la section Plage entière ...
git add .
git commit -m "refactor: extraction calculateRangePleine → calculationEngine.js"
```

---

## 📝 Étape 5 : Extraction getValidIsos() et getValidApertures()

### 5.1 Créer validationEngine.js

**Fichier :** `/utils/validationEngine.js`

```javascript
// utils/validationEngine.js - Validation des options disponibles

/**
 * Filtre les ISO compatibles avec la vue centrée actuelle
 * @param {object} mainValues - { aperture, shutter, iso, brackets, spacing }
 * @param {object} settings - Paramètres app
 * @returns {array} Liste des ISO valides
 */
function getValidIsos(mainValues, settings) {
  const allIsos = filterByIncrementAndLimits(
    photoDatabase.iso_values.values,
    settings.increment,
    settings.isoMin,
    settings.isoMax
  );
  
  return allIsos.filter(iso => {
    const isoIndex = photoDatabase.iso_values.values.indexOf(iso);
    const isoShift = iso.stop_sixth - photoDatabase.iso_values.values[mainValues.iso].stop_sixth;
    const adjustedShutterIndex = mainValues.shutter + isoShift;
    
    const testResult = calculateHDRSequence(
      adjustedShutterIndex,
      mainValues.aperture,
      isoIndex,
      mainValues.brackets,
      mainValues.spacing,
      settings,
      true
    );
    
    return testResult.errors.length === 0;
  });
}

/**
 * Filtre les ouvertures compatibles avec la vue centrée actuelle
 * @param {object} mainValues - { aperture, shutter, iso, brackets, spacing }
 * @param {object} settings - Paramètres app
 * @returns {array} Liste des ouvertures valides
 */
function getValidApertures(mainValues, settings) {
  const allApertures = filterByIncrementAndLimits(
    photoDatabase.aperture_values.values,
    settings.increment,
    settings.apertureMin,
    settings.apertureMax
  );
  
  return allApertures.filter(aperture => {
    const apertureIndex = photoDatabase.aperture_values.values.indexOf(aperture);
    const apertureShift = aperture.stop_sixth - photoDatabase.aperture_values.values[mainValues.aperture].stop_sixth;
    const adjustedShutterIndex = mainValues.shutter - apertureShift;
    
    const testResult = calculateHDRSequence(
      adjustedShutterIndex,
      apertureIndex,
      mainValues.iso,
      mainValues.brackets,
      mainValues.spacing,
      settings,
      true
    );
    
    return testResult.errors.length === 0;
  });
}
```

### 5.2 Modifier index.html
```html
<script src="utils/calculationEngine.js"></script>
<script src="utils/validationEngine.js"></script> <!-- NOUVEAU -->
```

### 5.3 Modifier App.jsx
**SUPPRIMER les fonctions getValidIsos et getValidApertures**

**MODIFIER les appels :**
```javascript
// Pas de changement nécessaire car déjà appelées correctement
// Mais vérifier qu'elles sont bien utilisées dans les composants
```

### 5.4 Test de Validation
```bash
git add .
git commit -m "checkpoint: avant extraction validation functions"
# ... effectuer modifs ...
# ... tester les dropdowns ISO et Ouverture dans corrections ...
git add .
git commit -m "refactor: extraction getValidIsos/Apertures → validationEngine.js"
```

---

## ✅ Étape 6 : Vérification Finale

### 6.1 Checklist Complète

```bash
# Tests fonctionnels
□ Vue centrée calcule correctement
□ Correction ISO affiche suggestions
□ Correction Ouverture affiche suggestions
□ Plage entière affiche CAS 1/2/3
□ Paramètres artistiques pris en compte
□ Aucune erreur console
□ Pas de régression visuelle

# Tests techniques
□ App.jsx réduit à ~300 lignes
□ calculationEngine.js créé (~500 lignes)
□ validationEngine.js créé (~50 lignes)
□ index.html chargements corrects
□ Git history propre (commits séparés)

# Tests mobile
□ Responsive fonctionne
□ Touch interactions OK
□ Pas de ralentissement
```

### 6.2 Mesure de Succès

**AVANT :**
```
App.jsx : ~800 lignes
```

**APRÈS :**
```
App.jsx : ~300 lignes (-62%)
calculationEngine.js : ~500 lignes (nouveau)
validationEngine.js : ~50 lignes (nouveau)
```

**Bénéfice :** Logique métier séparée, réutilisable, testable

---

## 🚨 Points d'Attention Critiques

### 1. Paramètre `settings` PARTOUT
**⚠️ CRITIQUE :** Tous les appels à `calculateHDRSequence` doivent inclure `settings`

**Vérifier dans :**
- App.jsx (appel direct mainResult)
- calculateCorrection1 (appels récursifs)
- calculateCorrection2 (appels récursifs)
- calculateRangePleine (boucles CAS 1/2/3)

### 2. Variables Globales Requises
**⚠️ NE PAS MODIFIER :**
- `photoDatabase` (doit rester global)
- `cameraTypes` (doit rester global)
- `filterByIncrementAndLimits()` (doit rester global)
- `getSpacingOptions()` (doit rester global)

### 3. Ordre de Chargement index.html
**⚠️ RESPECTER CET ORDRE :**
```html
1. photoDatabase.js
2. utils.js
3. calculationEngine.js  ← NOUVEAU
4. validationEngine.js   ← NOUVEAU
5. helpers.js
6. Composants JSX
7. App.jsx
```

### 4. Rollback en Cas d'Échec
```bash
# Si problème à une étape
git reset --hard HEAD~1

# Si problème généralisé (revenir au début)
git reset --hard <commit_avant_refactoring>
```

---

## 📊 Métriques de Validation

### Performance
- Temps de chargement initial : **<500ms** (comme avant)
- Temps de calcul mainResult : **<50ms** (comme avant)
- Mémoire utilisée : **<20MB** (comme avant)

### Qualité Code
- Complexité cyclomatique App.jsx : **<15** (vs ~30 avant)
- Duplication de code : **0%** (fonctions réutilisables)
- Lignes par fonction : **<100** (lisibilité)

---

## 🎯 Résultat Attendu

### Avant
```javascript
// App.jsx (800 lignes)
const HDRCalculator = () => {
  // calculateHDRSequence (100 lignes)
  // calculateCorrection1 (80 lignes)
  // calculateCorrection2 (70 lignes)
  // calculateRangePleine (200 lignes)
  // getValidIsos (20 lignes)
  // getValidApertures (20 lignes)
  // Composant React (310 lignes)
}
```

### Après
```javascript
// App.jsx (~300 lignes)
const HDRCalculator = () => {
  // États (useState)
  // Appels fonctions externes
  // Rendu JSX
}

// calculationEngine.js
function calculateHDRSequence() { ... }
function calculateCorrection1() { ... }
function calculateCorrection2() { ... }
function calculateRangePleine() { ... }

// validationEngine.js
function getValidIsos() { ... }
function getValidApertures() { ... }
```

---

## 📚 Documentation pour Opus

### Prompt Suggéré pour Opus

```
Tu vas effectuer une migration critique du fichier App.jsx en suivant 
EXACTEMENT le plan technique fourni (PLAN_TECHNIQUE_MIGRATION.md).

RÈGLES ABSOLUES :
1. Effectuer ÉTAPE PAR ÉTAPE (ne pas tout faire d'un coup)
2. Créer un commit Git AVANT chaque modification
3. Tester APRÈS chaque modification
4. NE PAS modifier les variables globales
5. RESPECTER l'ordre de chargement index.html
6. AJOUTER le paramètre `settings` à TOUS les appels calculateHDRSequence

PROCESSUS :
Pour chaque étape :
- Lire la section du plan
- Créer le checkpoint Git
- Effectuer UNIQUEMENT cette étape
- Me demander validation avant étape suivante

Commençons par l'Étape 1 : Extraction calculateHDRSequence()
```

---

## 🔐 Sauvegardes Recommandées

### Avant de Commencer
```bash
# Créer une branche de sauvegarde
git branch backup-avant-refactoring

# Créer une archive ZIP
zip -r hdr_calculator_backup.zip .
```

### Pendant le Travail
```bash
# Commit après chaque étape réussie
git add .
git commit -m "refactor: étape X terminée"
```

---

## 📞 Support

**Si blocage :**
1. Vérifier la console (erreurs JS ?)
2. Vérifier ordre de chargement index.html
3. Rollback Git dernière étape OK
4. Relire section "Points d'Attention Critiques"

**Si succès total :**
```bash
# Supprimer testCalculation.js
rm utils/testCalculation.js
git add .
git commit -m "cleanup: suppression fichiers de test"

# Mettre à jour guideline
# Marquer Phase 2 Étape 1 comme ✅ TERMINÉE
```

---

**Fin du Plan Technique**

**Version :** 1.0  
**Date :** Janvier 2025  
**Créé pour :** Migration Phase 2 HDR Calculator  
**Destiné à :** Claude Haiku OU exécution manuelle progressive