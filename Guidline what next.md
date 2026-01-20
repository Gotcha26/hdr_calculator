PHASE 1 (maintenant) : Finaliser la web-app
├── 1.1 Corrections bugs restants
├── 1.2 Tests utilisateurs
├── 1.3 Stabilisation
├── 1.4 🆕 Internationalisation (i18n)
│   ├── Système de traduction FR par défaut
│   ├── Clés en français (ex: "vue_centree", "pose_longue")
│   ├── Fichiers de langue JSON (fr.json, en.json, etc.)
│   └── Sélecteur de langue dans les paramètres
└── 1.5 🆕 Variables CSS personnalisables
    ├── Extraction des couleurs en variables CSS (--color-primary, etc.)
    ├── Extraction des espacements (--spacing-sm, --spacing-md, etc.)
    ├── Classes CSS utilitaires pour le debug
    └── Possibilité de thème clair/sombre (bonus)

PHASE 2 (court terme) : Conversion PWA
├── manifest.json + icônes (192x192, 512x512)
├── Service worker (cache pour mode hors-ligne)
├── Bouton "Installer l'app" intelligent
├── Splash screen
└── Test sur iOS/Android réels

PHASE 3 (moyen terme) : Monétisation
├── Définir fonctions gratuites vs premium
├── Intégration Stripe/PayPal
├── Page de landing/marketing
└── Système de "licence" simple (localStorage + vérification)

PHASE 4 (si succès) : Évolution
├── Retours utilisateurs
├── Nouvelles fonctionnalités
├── Thèmes personnalisés (exploitant les variables CSS)
└── Éventuellement : app native via un pro

---

## 📁 Organisation des fichiers

Voici la structure exacte à avoir dans ton dossier sur GitHub et sur o2switch :
```
hdr_calculator/
│
├── 📄 index.html              ← Page principale
├── 📄 theme.css               ← Variables CSS (couleurs, espacements)
├── 📄 styles.js               ← Styles React (utilise les variables CSS)
├── 📄 App.jsx                 ← Composant React principal
├── 📄 version.js              ← ⚠️ IGNORÉ par Git, créé par deploy.php
│
├── 📁 components/
│   ├── Header.jsx
│   ├── Menu.jsx
│   ├── Footer.jsx
│   ├── MainSection.jsx
│   ├── CorrectionISO.jsx
│   ├── CorrectionAperture.jsx
│   ├── RangePleine.jsx
│   └── SettingsPage.jsx
│
├── 📁 data/
│   └── photoDatabase.js       ← Base de données photo (ISO, vitesses, ouvertures)
│
├── 📁 i18n/
│   ├── index.js               ← Gestionnaire de traduction
│   ├── fr.js                  ← Traductions françaises
│   └── en.js                  ← Traductions anglaises
│
├── 📁 utils/
│   ├── utils.js               ← Fonctions utilitaires (filtrage, espacements)
│   ├── calculationEngine.js   ← Moteur de calcul HDR
│   ├── validationEngine.js    ← Validation des ISO/ouvertures
│   └── helpers.js             ← Helpers React (renderSuggestion)
│
├── 📄 .gitignore              ← Fichiers ignorés par Git
├── 📄 .htaccess               ← Config Apache (sécurité)
└── 📄 deploy.php              ← ⚠️ IGNORÉ par Git (webhook déploiement)
```

---