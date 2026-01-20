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