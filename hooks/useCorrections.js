// hooks/useCorrections.js - Hook pour les calculs de correction ISO et Ouverture

import { calculateHDRSequence } from '../utils/hdrCalculations.js';
import { filterByIncrementAndLimits } from '../utils/utils.js';

export function useCorrections(mainValues, settings, photoDatabase) {
  
  // Calcul Correction ISO
  const calculateCorrection1 = (correction1Iso) => {
    const isoShift = photoDatabase.iso_values.values[correction1Iso].stop_third - 
                     photoDatabase.iso_values.values[mainValues.iso].stop_third;
    
    const adjustedShutterIndex = mainValues.shutter + isoShift;
    
    const result = calculateHDRSequence(
      adjustedShutterIndex,
      mainValues.aperture,
      correction1Iso,
      mainValues.brackets,
      mainValues.spacing,
      true,
      settings,
      photoDatabase
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
        let bestIsoExceedsAstro = result.durationWarning;
        
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
            true,
            settings,
            photoDatabase
          );
          
          if (testResult.errors.length === 0) {
            bestIsoIndex = testIsoIndex;
            bestIso = testIso;
            bestIsoExceedsAstro = testResult.durationWarning;
          } else {
            break;
          }
        }
        
        if (bestIsoIndex !== correction1Iso) {
          const cransDiff = Math.abs(currentIndexInFiltered - filteredIsos.indexOf(bestIso));
          
          // Recalculer pour obtenir la durée du réglage optimal
          const bestIsoShift = bestIso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
          const bestShutterIndex = mainValues.shutter + bestIsoShift;
          const bestResult = calculateHDRSequence(
            bestShutterIndex,
            mainValues.aperture,
            photoDatabase.iso_values.values.indexOf(bestIso),
            mainValues.brackets,
            mainValues.spacing,
            true,
            settings,
            photoDatabase
          );
          
          // 1. Durée actuelle + statut sur 2 lignes
          specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
          if (result.durationWarning) {
            specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
          } else {
            specificSuggestions.push(`✅ Durée compatible astrophoto`);
          }
          
          // 2. Paramètre optimum
          specificSuggestions.push(`💡 Optimum technique : ISO ${bestIso.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''} plus bas)`);
          
          // 3. Durée optimale
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
    
    return { ...result, suggestions: specificSuggestions, canToggleAstroLimit: result.durationWarning };
  };

  // Calcul Correction Ouverture
  const calculateCorrection2 = (correction2Aperture) => {
    const apertureShift = photoDatabase.aperture_values.values[correction2Aperture].stop_third - 
                          photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
    
    const adjustedShutterIndex = mainValues.shutter - apertureShift;
    
    const result = calculateHDRSequence(
      adjustedShutterIndex,
      correction2Aperture,
      mainValues.iso,
      mainValues.brackets,
      mainValues.spacing,
      true,
      settings,
      photoDatabase
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
      
      // Recherche de l'ouverture optimale (f/5.6 à f/8) techniquement réalisable
      let bestAperture = null;
      let bestApertureIndex = -1;
      let bestDuration = result.totalDuration;
      let cransDiff = 0;
      
      // Chercher dans la zone optimale f/5.6 - f/8
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
            true,
            settings,
            photoDatabase
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
      
      // 1. Durée actuelle + statut sur 2 lignes
      specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
      if (result.durationWarning) {
        specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
      } else {
        specificSuggestions.push(`✅ Durée compatible astrophoto`);
      }
      
      // 2. Paramètre optimum (si trouvé)
      if (bestAperture && bestApertureIndex !== correction2Aperture) {
        specificSuggestions.push(`💡 Optimum technique : ${bestAperture.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''})`);
        
        // 3. Durée optimale
        const optimalDurationStatus = bestDuration <= settings.durationLimit || settings.durationLimit >= 100 ? '✅ Compatible' : '⚠️ Dépasse limite';
        specificSuggestions.push(`🎯 Durée optimale : ${bestDuration.toFixed(2)}s - ${optimalDurationStatus}`);
      } else {
        // Pas d'optimum trouvé - afficher statut qualité optique
        if (currentAperture.numeric >= 5.6 && currentAperture.numeric <= 11) {
          specificSuggestions.push(`✅ Zone de netteté optimale atteinte`);
        } else if (currentAperture.numeric < 2.8) {
          specificSuggestions.push(`⚠️ Ouverture très large : profondeur de champ limitée`);
        } else if (currentAperture.numeric > 16) {
          specificSuggestions.push(`⚠️ Ouverture très fermée : attention à la diffraction`);
        }
      }
    }
    
    return { ...result, suggestions: specificSuggestions, canToggleAstroLimit: result.durationWarning };
  };

  return { calculateCorrection1, calculateCorrection2 };
}
