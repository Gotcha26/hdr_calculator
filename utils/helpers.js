// utils/helpers.js - Fonctions utilitaires pour le rendu

// Fonction pour rendre les suggestions avec lien cliquable uniquement sur "(désactiver)"
const renderSuggestion = (sug, index, setSettings, settings) => {
  // Chercher si la suggestion contient "Limite astrophoto dépassée"
  if (sug.includes('Limite astrophoto dépassée')) {
    return (
      <li key={index}>
        ⚠️ Limite astrophoto dépassée{' '}
        <span 
          onClick={() => setSettings({...settings, durationLimit: 999})}
          style={appStyles.clickableLink}
        >
          (désactiver)
        </span>
      </li>
    );
  }
  return <li key={index}>{sug}</li>;
};