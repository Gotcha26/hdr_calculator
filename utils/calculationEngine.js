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