// utils.js - Fonctions utilitaires

// Filtrage des valeurs selon l'incrÃ©ment et les limites
function filterByIncrementAndLimits(values, increment, minIndex, maxIndex) {
  const filtered = values.filter((_, idx) => idx >= minIndex && idx <= maxIndex);
  
  if (increment === '1:1') {
    return filtered.filter(v => v.stop_third % 3 === 0);
  } else if (increment === '1:2') {
    return filtered.filter(v => v.stop_third % 1.5 === 0);
  }
  return filtered;
}

// Options d'espacement selon l'incrÃ©ment
function getSpacingOptions(increment) {
  if (increment === '1:1') {
    return [1, 2, 3];
  } else if (increment === '1:2') {
    return [0.5, 1, 1.5, 2, 2.5, 3];
  }
  return [0.33, 0.67, 1, 1.33, 1.67, 2, 2.33, 2.67, 3];
}
