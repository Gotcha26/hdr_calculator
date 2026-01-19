// utils.js - Fonctions utilitaires

// Filtrage des valeurs selon l'incrément et les limites
function filterByIncrementAndLimits(values, increment, minIndex, maxIndex) {
  const filtered = values.filter((_, idx) => idx >= minIndex && idx <= maxIndex);
  
  // Filtrage basé sur stop_sixth (sixièmes de stop)
  // 1:1 (stops entiers) = multiples de 6
  // 1:2 (demi-stops) = multiples de 3
  // 1:3 (tiers de stops) = multiples de 2
  if (increment === '1:1') {
    return filtered.filter(v => v.stop_sixth % 6 === 0);
  } else if (increment === '1:2') {
    return filtered.filter(v => v.stop_sixth % 3 === 0);
  } else if (increment === '1:3') {
    return filtered.filter(v => v.stop_sixth % 2 === 0);
  }
  return filtered;
}

// Options d'espacement selon l'incrément
function getSpacingOptions(increment) {
  if (increment === '1:1') {
    return [1, 2, 3];
  } else if (increment === '1:2') {
    return [0.5, 1, 1.5, 2, 2.5, 3];
  }
  return [0.33, 0.67, 1, 1.33, 1.67, 2, 2.33, 2.67, 3];
}