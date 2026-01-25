// i18n/index.js - Gestionnaire d'internationalisation

const i18n = {
  // Langue actuelle (par défaut: anglais)
  currentLang: 'en',
  
  // Langues disponibles
  availableLanguages: {
    'en': { name: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7', translations: null }, // 🇬🇧
    'fr': { name: 'Français', flag: '\uD83C\uDDEB\uD83C\uDDF7', translations: null }  // 🇫🇷
  },
  
  /**
   * Initialise le système i18n
   * Charge la langue sauvegardée ou détecte celle du navigateur
   */
  init: function() {
    // Charger les traductions
    this.availableLanguages['fr'].translations = translations_fr;
    this.availableLanguages['en'].translations = translations_en;
    
    // Récupérer la langue sauvegardée
    const savedLang = localStorage.getItem('hdr_calculator_lang');
    if (savedLang && this.availableLanguages[savedLang]) {
      this.currentLang = savedLang;
      console.log(`🌐 i18n initialisé - Langue sauvegardée: ${this.currentLang}`);
    } else {
      // Détection automatique de la langue du navigateur
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0]; // 'fr-FR' -> 'fr'
      
      if (this.availableLanguages[langCode]) {
        this.currentLang = langCode;
        console.log(`🌐 i18n initialisé - Langue détectée: ${this.currentLang} (${browserLang})`);
      } else {
        console.log(`🌐 i18n initialisé - Langue par défaut: ${this.currentLang} (navigateur: ${browserLang})`);
      }
    }
    
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = this.currentLang;
  },
  
  /**
   * Change la langue actuelle
   * @param {string} lang - Code de la langue ('fr', 'en', etc.)
   */
  setLanguage: function(lang) {
    if (this.availableLanguages[lang]) {
      this.currentLang = lang;
      localStorage.setItem('hdr_calculator_lang', lang);
      document.documentElement.lang = lang;
      console.log(`🌐 Langue changée: ${lang}`);
      return true;
    }
    console.warn(`⚠️ Langue non disponible: ${lang}`);
    return false;
  },
  
  /**
   * Récupère la langue actuelle
   * @returns {string} Code de la langue actuelle
   */
  getLanguage: function() {
    return this.currentLang;
  },
  
  /**
   * Récupère le drapeau de la langue actuelle
   * @returns {string} Emoji du drapeau
   */
  getCurrentFlag: function() {
    return this.availableLanguages[this.currentLang]?.flag || '🌐';
  },
  
  /**
   * Récupère le drapeau d'une langue spécifique
   * @param {string} lang - Code de la langue
   * @returns {string} Emoji du drapeau
   */
  getFlag: function(lang) {
    return this.availableLanguages[lang]?.flag || '🌐';
  },
  
  /**
   * Récupère la liste des langues disponibles
   * @returns {array} Liste des langues [{code, name, flag}, ...]
   */
  getAvailableLanguages: function() {
    return Object.entries(this.availableLanguages).map(([code, data]) => ({
      code,
      name: data.name,
      flag: data.flag
    }));
  },
  
  /**
   * Traduit une clé
   * @param {string} key - Clé de traduction (texte en français)
   * @param {object} params - Paramètres de substitution optionnels
   * @returns {string} Texte traduit
   */
  t: function(key, params = {}) {
    const translations = this.availableLanguages[this.currentLang]?.translations;
    
    // Récupérer la traduction ou retourner la clé si non trouvée
    let text = translations?.[key] || key;
    
    // Substituer les paramètres {param}
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    });
    
    return text;
  }
};

// Fonction raccourcie globale pour les traductions
function t(key, params) {
  return i18n.t(key, params);
}

// Initialisation automatique au chargement
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});