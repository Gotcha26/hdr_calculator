// utils/hdrCalculations.js - Logique de calcul des séquences HDR

/**
 * Calcule une séquence HDR complète
 */
export function calculateHDRSequence(
  centerShutterIndex,
  centerApertureIndex,
  centerIsoIndex,
  brackets,
  spacing,
  skipSuggestions,
  settings,
  photoDatabase
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
    const targetStopThird = photoDatabase.shutter_speeds.values[centerShutterIndex].stop_third + (evShift * 3);
    
    let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
      Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
    );
    
    const minSpeed = photoDatabase.shutter_speeds.values[settings.speedMin];
    const maxSpeed = photoDatabase.shutter_speeds.values[settings.speedMax];
    
    if (closestShutter.stop_third < minSpeed.stop_third) {
      speedErrors.min = { speed: closestShutter.display, limit: minSpeed.display };
    }
    
    if (closestShutter.stop_third > maxSpeed.stop_third) {
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
  
  // Suggestions si réalisable et pas de warning
  if (errors.length === 0 && !skipSuggestions && !durationWarning) {
    const minIso = photoDatabase.iso_values.values[settings.isoMin];
    const currentIso = photoDatabase.iso_values.values[centerIsoIndex];
    
    if (currentIso.stop_third > minIso.stop_third) {
      const testIsoIndex = settings.isoMin;
      const isoShift = currentIso.stop_third - minIso.stop_third;
      const testShutterIndex = centerShutterIndex - isoShift;
      
      const testResult = calculateHDRSequence(
        testShutterIndex,
        centerApertureIndex,
        testIsoIndex,
        brackets,
        spacing,
        true,
        settings,
        photoDatabase
      );
      
      if (testResult.errors.length === 0 && !testResult.durationWarning) {
        suggestions.push(`💡 Qualité optimale possible: baissez l'ISO à ${minIso.display}`);
      }
    }
    
    if (settings.durationLimit < 100) {
      const marginTime = settings.durationLimit - totalDuration;
      if (marginTime > 0.5) {
        suggestions.push(`✔ Marge temporelle: ${marginTime.toFixed(2)}s disponibles`);
      }
    }
  }
  
  return { sequence, totalDuration, errors, suggestions, speedErrors, durationExceeded, durationWarning };
}

const cameraTypes = {
  'mirrorless_electronic': { name: 'Mirrorless (obturateur électronique)', minTime: 0.020, bufferDelay: 0.119 },
  'mirrorless_mechanical': { name: 'Mirrorless (obturateur mécanique)', minTime: 0.050, bufferDelay: 0.114 },
  'reflex_mechanical': { name: 'Reflex (obturateur mécanique)', minTime: 0.080, bufferDelay: 0.144 }
};

export { cameraTypes };
