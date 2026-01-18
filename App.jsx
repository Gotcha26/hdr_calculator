const { useState } = React;

const HDRCalculator = () => {
  // États de navigation
  const [currentPage, setCurrentPage] = useState('calculator');
  const [menuOpen, setMenuOpen] = useState(false);
  const [section2Open, setSection2Open] = useState(false);
  const [section3Open, setSection3Open] = useState(false);
  const [section4Open, setSection4Open] = useState(false);
  
  // Paramètres
  const [settings, setSettings] = useState({
    cameraType: 'reflex_mechanical',
    increment: '1:3',
    isoMin: 3,
    isoMax: 21,
    speedMin: 3,
    speedMax: 57,
    apertureMin: 9,
    apertureMax: 27,
    sensorDynamicRange: 15,
    durationLimit: 2.5,
    maxBrackets: 7,
    // Paramètres artistiques
    artisticApertureMin: 12,  // f/4.0 - Zone acceptable
    artisticApertureMax: 18,  // f/8 - Zone de netteté optimale
    artisticIsoMin: 9,        // ISO 400
    artisticIsoMax: 15        // ISO 1600
  });

  // Valeurs principales
  const [mainValues, setMainValues] = useState({
    aperture: 9,  // f/2.8
    shutter: 34,  // 1/40
    iso: 9,       // 400
    brackets: 7,
    spacing: 2
  });

  const [correction1Iso, setCorrection1Iso] = useState(12);
  const [correction2Aperture, setCorrection2Aperture] = useState(9);
  
  // Valeurs pour la section Plage entière
  const [rangeValues, setRangeValues] = useState({
    aperture: 12,  // f/4.0
    iso: 6,        // 200
    speedMin: 13,  // 3.2s
    speedMax: 49   // 1/1250
  });

  // Calcul séquence HDR
  const calculateHDRSequence = (centerShutterIndex, centerApertureIndex, centerIsoIndex, brackets, spacing, skipSuggestions = false) => {
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
      const targetStopThird = photoDatabase.shutter_speeds.values[centerShutterIndex].stop_third + (evShift * 3);
      
      let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
        Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
      );
      
      const minSpeed = photoDatabase.shutter_speeds.values[settings.speedMin];
      const maxSpeed = photoDatabase.shutter_speeds.values[settings.speedMax];
      
      if (targetStopThird < minSpeed.stop_third) {
        speedErrors.min = { speed: closestShutter.display, limit: minSpeed.display };
      }
      
      if (targetStopThird > maxSpeed.stop_third) {
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
      
      if (currentIso.stop_third > minIso.stop_third) {
        const testIsoIndex = settings.isoMin;
        const isoShift = currentIso.stop_third - minIso.stop_third;
        const testShutterIndex = centerShutterIndex - isoShift;
        
        const testResult = calculateHDRSequence(testShutterIndex, centerApertureIndex, testIsoIndex, brackets, spacing, true);
        
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
  };

  // Calcul Plage entière (Section 4)
  const calculateRangePleine = () => {
    const errors = [];
    const suggestions = [];
    
    const minSpeed = photoDatabase.shutter_speeds.values[rangeValues.speedMin];
    const maxSpeed = photoDatabase.shutter_speeds.values[rangeValues.speedMax];
    
    // Vérifier que speedMax est plus rapide que speedMin
    if (maxSpeed.stop_third <= minSpeed.stop_third) {
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
    
    // Calculer l'amplitude en stop_third (différence entre vitesses)
    const totalCrans = maxSpeed.stop_third - minSpeed.stop_third;
    const totalEV = totalCrans / 3;
    
    // Calculer la vitesse centrale (milieu de la plage)
    const centerStopThird = Math.round((minSpeed.stop_third + maxSpeed.stop_third) / 2);
    const centerSpeed = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
      Math.abs(curr.stop_third - centerStopThird) < Math.abs(prev.stop_third - centerStopThird) ? curr : prev
    );
    
    // Calculer l'espacement optimal pour couvrir toute la plage
    const possibleSpacings = [];
    const cameraData = cameraTypes[settings.cameraType];
    const minTimePerShot = cameraData.minTime + cameraData.bufferDelay;
    
    // Obtenir les espacements possibles selon l'incrément
    const availableSpacings = getSpacingOptions(settings.increment);
    
    // Pour chaque nombre d'images possible (impair, ≤ maxBrackets)
    // Parcourir du plus grand au plus petit pour privilégier les séquences plus fines
    for (let brackets = settings.maxBrackets; brackets >= 3; brackets -= 2) {
      const halfBrackets = Math.floor(brackets / 2);
      
      // Calculer l'espacement maximal qui respecte les limites
      // Distance de la vue centrée aux limites
      const distanceToMin = centerSpeed.stop_third - minSpeed.stop_third; // en tiers
      const distanceToMax = maxSpeed.stop_third - centerSpeed.stop_third; // en tiers
      const maxDistanceEachSide = Math.min(distanceToMin, distanceToMax);
      
      // Espacement maximal = distance disponible / nombre d'images d'un côté
      const maxSpacingThirds = maxDistanceEachSide / halfBrackets;
      const maxSpacingEV = maxSpacingThirds / 3;
      
      // Trouver le plus grand espacement disponible qui ne dépasse pas le max
      for (let i = availableSpacings.length - 1; i >= 0; i--) {
        const spacing = availableSpacings[i];
        if (spacing <= maxSpacingEV) {
          possibleSpacings.push({
            value: spacing,
            brackets: brackets
          });
          break; // On prend le plus grand possible pour ce nombre d'images
        }
      }
    }
    
    // Calculer la durée pour la configuration optimale (plus grand nombre de brackets)
    let totalDuration = 0;
    if (possibleSpacings.length > 0) {
      // Prendre la première configuration (qui a le plus grand nombre de brackets)
      const optimalConfig = possibleSpacings[0];
      const halfBrackets = Math.floor(optimalConfig.brackets / 2);
      
      for (let i = -halfBrackets; i <= halfBrackets; i++) {
        const evShift = i * optimalConfig.value;
        const targetStopThird = centerSpeed.stop_third + (evShift * 3);
        
        let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
          Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
        );
        
        const shotDuration = Math.max(closestShutter.numeric, minTimePerShot);
        totalDuration += shotDuration;
      }
    }
    
    // Suggestions artistiques améliorées
    if (possibleSpacings.length === 0) {
      suggestions.push('⚠️ Amplitude trop faible : augmentez l\'écart entre vitesses min/max');
    } else {
      // Configuration optimale (plus grand nombre de brackets)
      const optimalConfig = possibleSpacings[0];
      
      // Recommandations de base
      const basicRecommendations = [];
      basicRecommendations.push(`${centerSpeed.display}`); // Vue centrée
      basicRecommendations.push(`${optimalConfig.brackets} images`); // Séquence
      basicRecommendations.push(`${optimalConfig.value.toFixed(2)} EV`); // Écart type
      
      // Valeurs actuelles
      const currentIso = photoDatabase.iso_values.values[rangeValues.iso];
      const currentAperture = photoDatabase.aperture_values.values[rangeValues.aperture];
      
      // Valeurs artistiques
      const artisticMinIso = photoDatabase.iso_values.values[settings.artisticIsoMin];
      const artisticMaxIso = photoDatabase.iso_values.values[settings.artisticIsoMax];
      const artisticMinAperture = photoDatabase.aperture_values.values[settings.artisticApertureMin];
      const artisticMaxAperture = photoDatabase.aperture_values.values[settings.artisticApertureMax];
      
      const halfBrackets = Math.floor(optimalConfig.brackets / 2);
      
      // Recommandations avancées
      const advancedRecommendations = [];
      
      // CAS 1 : Priorité ISO (baisser l'ISO)
      const isoShift_cas1 = artisticMinIso.stop_third - currentIso.stop_third;
      
      let cas1_data = {
        hasOptimization: isoShift_cas1 < 0,
        isoFrom: currentIso.display,
        isoTo: artisticMinIso.display,
        stopThird: isoShift_cas1,
        duration: 0
      };
      
      if (cas1_data.hasOptimization) {
        // Calculer vue centrée compensée
        const newCenterSpeed_cas1 = centerSpeed.stop_third - isoShift_cas1;
        const centerSpeedObj_cas1 = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
          Math.abs(curr.stop_third - newCenterSpeed_cas1) < Math.abs(prev.stop_third - newCenterSpeed_cas1) ? curr : prev
        );
        
        // Calculer durée
        for (let i = -halfBrackets; i <= halfBrackets; i++) {
          const evShift = i * optimalConfig.value;
          const targetStopThird = centerSpeedObj_cas1.stop_third + (evShift * 3);
          let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
            Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
          );
          cas1_data.duration += Math.max(closestShutter.numeric, minTimePerShot);
        }
      }
      
      // CAS 2 : Priorité Ouverture (fermer le diaphragme)
      const apertureShift_cas2 = artisticMaxAperture.stop_third - currentAperture.stop_third;
      
      let cas2_data = {
        hasOptimization: apertureShift_cas2 > 0,
        apertureFrom: currentAperture.display,
        apertureTo: artisticMaxAperture.display,
        stopThird: apertureShift_cas2,
        duration: 0
      };
      
      if (cas2_data.hasOptimization) {
        // Vue centrée reste la même pour Cas 2
        // Calculer durée avec vue centrée originale
        for (let i = -halfBrackets; i <= halfBrackets; i++) {
          const evShift = i * optimalConfig.value;
          const targetStopThird = centerSpeed.stop_third + (evShift * 3);
          let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
            Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
          );
          cas2_data.duration += Math.max(closestShutter.numeric, minTimePerShot);
        }
      }
      
      // CAS 3 : Qualité + (Synthèse)
      const totalShift_cas3 = (isoShift_cas1 < 0 ? isoShift_cas1 : 0) + (apertureShift_cas2 > 0 ? apertureShift_cas2 : 0);
      const newCenterSpeed_cas3_stopThird = centerSpeed.stop_third - totalShift_cas3;
      const centerSpeedObj_cas3 = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
        Math.abs(curr.stop_third - newCenterSpeed_cas3_stopThird) < Math.abs(prev.stop_third - newCenterSpeed_cas3_stopThird) ? curr : prev
      );
      
      // Calculer poses longue et rapide pour Cas 3
      let cas3_poseLongue = null;
      let cas3_poseRapide = null;
      let cas3_duration = 0;
      
      for (let i = -halfBrackets; i <= halfBrackets; i++) {
        const evShift = i * optimalConfig.value;
        const targetStopThird = centerSpeedObj_cas3.stop_third + (evShift * 3);
        let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
          Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
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
        stopThird: totalShift_cas3,
        brackets: optimalConfig.brackets,
        spacing: optimalConfig.value,
        poseLongue: cas3_poseLongue.display,
        poseRapide: cas3_poseRapide.display,
        duration: cas3_duration
      };
      
      // Formatter les données pour l'affichage
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
      
      // Retourner les recommandations
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
  };

  // Calcul Correction #1 (ISO)
  const calculateCorrection1 = () => {
    const isoShift = photoDatabase.iso_values.values[correction1Iso].stop_third - 
                     photoDatabase.iso_values.values[mainValues.iso].stop_third;
    
    const adjustedShutterIndex = mainValues.shutter + isoShift;
    
    const result = calculateHDRSequence(
      adjustedShutterIndex,
      mainValues.aperture,
      correction1Iso,
      mainValues.brackets,
      mainValues.spacing,
      true
    );
    
    const specificSuggestions = [];
    const currentIso = photoDatabase.iso_values.values[correction1Iso];
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
      if (currentIso.stop_third > minIso.stop_third) {
        let bestIsoIndex = correction1Iso;
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
          const testIsoShift = testIso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
          const testShutterIndex = mainValues.shutter + testIsoShift;
          
          const testResult = calculateHDRSequence(
            testShutterIndex,
            mainValues.aperture,
            testIsoIndex,
            mainValues.brackets,
            mainValues.spacing,
            true
          );
          
          if (testResult.errors.length === 0) {
            bestIsoIndex = testIsoIndex;
            bestIso = testIso;
          } else {
            break;
          }
        }
        
        if (bestIsoIndex !== correction1Iso) {
          const cransDiff = Math.abs(currentIndexInFiltered - filteredIsos.indexOf(bestIso));
          
          const bestIsoShift = bestIso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
          const bestShutterIndex = mainValues.shutter + bestIsoShift;
          const bestResult = calculateHDRSequence(
            bestShutterIndex,
            mainValues.aperture,
            photoDatabase.iso_values.values.indexOf(bestIso),
            mainValues.brackets,
            mainValues.spacing,
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
          
        } else if (bestIso.stop_third > minIso.stop_third) {
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
  };

  // Calcul Correction #2 (Ouverture)
  const calculateCorrection2 = () => {
    const apertureShift = photoDatabase.aperture_values.values[correction2Aperture].stop_third - 
                          photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
    
    const adjustedShutterIndex = mainValues.shutter - apertureShift;
    
    const result = calculateHDRSequence(
      adjustedShutterIndex,
      correction2Aperture,
      mainValues.iso,
      mainValues.brackets,
      mainValues.spacing,
      true
    );
    
    const specificSuggestions = [];
    const currentAperture = photoDatabase.aperture_values.values[correction2Aperture];
    const minAperture = photoDatabase.aperture_values.values[settings.apertureMin];
    const maxAperture = photoDatabase.aperture_values.values[settings.apertureMax];
    
    if (result.errors.length > 0) {
      specificSuggestions.push(`❌ Réglage impossible avec les limites techniques actuelles`);
      
      if (result.speedErrors.max) {
        specificSuggestions.push(`→ Vitesse trop rapide : fermez le diaphragme (augmentez f/)`);
        if (currentAperture.stop_third >= maxAperture.stop_third) {
          specificSuggestions.push(`🎯 Objectif au maximum (${maxAperture.display}) → Filtres ND`);
        }
      }
      if (result.speedErrors.min) {
        specificSuggestions.push(`→ Vitesse trop lente : ouvrez le diaphragme (diminuez f/)`);
        if (currentAperture.stop_third <= minAperture.stop_third) {
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
          const testApertureShift = testAperture.stop_third - photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
          const testShutterIndex = mainValues.shutter - testApertureShift;
          
          const testResult = calculateHDRSequence(
            testShutterIndex,
            testApertureIndex,
            mainValues.iso,
            mainValues.brackets,
            mainValues.spacing,
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
      
      if (bestAperture && bestApertureIndex !== correction2Aperture) {
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
  };

  const mainResult = calculateHDRSequence(
    mainValues.shutter,
    mainValues.aperture,
    mainValues.iso,
    mainValues.brackets,
    mainValues.spacing
  );

  const correction1Result = calculateCorrection1();
  const correction2Result = calculateCorrection2();
  const rangeResult = calculateRangePleine();

  // Filtrer les ISO valides
  const getValidIsos = () => {
    const allIsos = filterByIncrementAndLimits(
      photoDatabase.iso_values.values,
      settings.increment,
      settings.isoMin,
      settings.isoMax
    );
    
    return allIsos.filter(iso => {
      const isoIndex = photoDatabase.iso_values.values.indexOf(iso);
      const isoShift = iso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
      const adjustedShutterIndex = mainValues.shutter + isoShift;
      
      const testResult = calculateHDRSequence(
        adjustedShutterIndex,
        mainValues.aperture,
        isoIndex,
        mainValues.brackets,
        mainValues.spacing,
        true
      );
      
      return testResult.errors.length === 0;
    });
  };

  // Filtrer les ouvertures valides
  const getValidApertures = () => {
    const allApertures = filterByIncrementAndLimits(
      photoDatabase.aperture_values.values,
      settings.increment,
      settings.apertureMin,
      settings.apertureMax
    );
    
    return allApertures.filter(aperture => {
      const apertureIndex = photoDatabase.aperture_values.values.indexOf(aperture);
      const apertureShift = aperture.stop_third - photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
      const adjustedShutterIndex = mainValues.shutter - apertureShift;
      
      const testResult = calculateHDRSequence(
        adjustedShutterIndex,
        apertureIndex,
        mainValues.iso,
        mainValues.brackets,
        mainValues.spacing,
        true
      );
      
      return testResult.errors.length === 0;
    });
  };

  return (
    <div style={appStyles.container}>
      <Menu 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <Header setMenuOpen={setMenuOpen} />

      <div style={appStyles.content}>
        <div style={appStyles.contentContainer}>
          {currentPage === 'calculator' ? (
            <div>
              <MainSection
                mainValues={mainValues}
                setMainValues={setMainValues}
                mainResult={mainResult}
                settings={settings}
                setSettings={setSettings}
                photoDatabase={photoDatabase}
                filterByIncrementAndLimits={filterByIncrementAndLimits}
                getSpacingOptions={getSpacingOptions}
              />

              <CorrectionISO
                section2Open={section2Open}
                setSection2Open={setSection2Open}
                correction1Iso={correction1Iso}
                setCorrection1Iso={setCorrection1Iso}
                correction1Result={correction1Result}
                mainValues={mainValues}
                settings={settings}
                setSettings={setSettings}
                photoDatabase={photoDatabase}
                getValidIsos={getValidIsos}
                renderSuggestion={renderSuggestion}
              />

              <CorrectionAperture
                section3Open={section3Open}
                setSection3Open={setSection3Open}
                correction2Aperture={correction2Aperture}
                setCorrection2Aperture={setCorrection2Aperture}
                correction2Result={correction2Result}
                mainValues={mainValues}
                settings={settings}
                setSettings={setSettings}
                photoDatabase={photoDatabase}
                getValidApertures={getValidApertures}
                renderSuggestion={renderSuggestion}
              />

              <RangePleine
                section4Open={section4Open}
                setSection4Open={setSection4Open}
                rangeValues={rangeValues}
                setRangeValues={setRangeValues}
                rangeResult={rangeResult}
                settings={settings}
                photoDatabase={photoDatabase}
                filterByIncrementAndLimits={filterByIncrementAndLimits}
              />
            </div>
          ) : (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              setCurrentPage={setCurrentPage}
              photoDatabase={photoDatabase}
              cameraTypes={cameraTypes}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<HDRCalculator />);