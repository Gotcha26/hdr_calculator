// utils/helpers.js - Fonctions utilitaires pour le rendu

// Fonction pour rendre les suggestions avec lien cliquable uniquement sur "(désactiver)"
const renderSuggestion = (sug, index, setSettings, settings, isMobile = false) => {
  // Chercher si la suggestion contient "Limite astrophoto dépassée"
  if (sug.includes('Limite astrophoto dépassée')) {
    return (
      <li key={index} style={{whiteSpace: 'pre-line'}}>
        ⚠️ Limite astrophoto dépassée
        {isMobile && <br />}
        {!isMobile && ' '}
        <span 
          onClick={() => setSettings({...settings, durationLimit: 999})}
          style={appStyles.clickableLink}
        >
          (désactiver)
        </span>
      </li>
    );
  }
  
  // Formatter la suggestion pour mobile
  let displayText = sug;
  
  if (isMobile) {
    // Pattern: "Label : valeur" → retour à la ligne
    if (sug.match(/^(⏱️ Durée actuelle|💡 Optimum technique|🎯 Durée optimale) : /)) {
      displayText = sug.replace(/^(.*?) : (.+)$/, '$1 :\n   $2');
    }
  }
  
  return <li key={index} style={{whiteSpace: 'pre-line'}}>{displayText}</li>;
};