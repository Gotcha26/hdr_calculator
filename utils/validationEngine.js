// utils/validationEngine.js - Validation des options disponibles (VERSION SÉCURISÉE)

/**
 * Valide qu'un index est dans les limites d'un tableau de la base de données
 */
function validateIndexValidation(index, arrayName) {
  if (typeof index !== 'number' || isNaN(index)) return false;
  const array = photoDatabase[arrayName].values;
  return index >= 0 && index < array.length;
}

/**
 * Filtre les ISO compatibles avec la vue centrée actuelle
 * @param {object} mainValues - { aperture, shutter, iso, brackets, spacing }
 * @param {object} settings - Paramètres app
 * @returns {array} Liste des ISO valides
 */
function getValidIsos(mainValues, settings) {
  // Validation de mainValues.iso
  if (!validateIndexValidation(mainValues.iso, 'iso_values')) {
    console.warn('⚠️ mainValues.iso invalide dans getValidIsos');
    return [];
  }
  
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
  // Validation de mainValues.aperture
  if (!validateIndexValidation(mainValues.aperture, 'aperture_values')) {
    console.warn('⚠️ mainValues.aperture invalide dans getValidApertures');
    return [];
  }
  
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
    
    // Validation de adjustedShutterIndex avant l'appel
    if (!validateIndexValidation(adjustedShutterIndex, 'shutter_speeds')) {
      return false;
    }
    
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