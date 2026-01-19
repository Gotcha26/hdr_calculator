// utils/testCalculation.js - Test de chargement de fonction

// Fonction bidon ultra-simple pour tester le mécanisme
function calculateTestSum(a, b) {
  return {
    result: a + b,
    message: `✅ Fonction externe appelée avec succès: ${a} + ${b} = ${a + b}`
  };
}

// Fonction bidon utilisant photoDatabase (test dépendance globale)
function getFirstIsoValue() {
  if (typeof photoDatabase === 'undefined') {
    return { error: '❌ photoDatabase non accessible' };
  }
  
  return {
    success: true,
    firstIso: photoDatabase.iso_values.values[0].display,
    message: `✅ Accès à photoDatabase OK: ${photoDatabase.iso_values.values[0].display}`
  };
}

// Fonction bidon utilisant cameraTypes (test autre dépendance)
function getFirstCameraType() {
  if (typeof cameraTypes === 'undefined') {
    return { error: '❌ cameraTypes non accessible' };
  }
  
  const firstKey = Object.keys(cameraTypes)[0];
  return {
    success: true,
    cameraName: cameraTypes[firstKey].name,
    message: `✅ Accès à cameraTypes OK: ${cameraTypes[firstKey].name}`
  };
}