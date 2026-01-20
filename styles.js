// styles.js - Styles centralisés utilisant les variables CSS
// Les valeurs font référence aux variables définies dans theme.css

const appStyles = {
  // Conteneur principal
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-middle), var(--bg-gradient-end))',
    color: 'var(--text-primary)'
  },

  // Header
  header: {
    background: 'var(--bg-header)',
    backdropFilter: 'var(--blur-standard)',
    borderBottom: '1px solid var(--border-separator)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  headerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: 'var(--spacing-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  },
  headerButton: {
    padding: 'var(--spacing-sm)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: 'var(--font-size-2xl)'
  },
  headerTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #60a5fa, var(--color-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerSubtitle: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-secondary)'
  },

  // Menu
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--bg-overlay)',
    zIndex: 998
  },
  menuSidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '85%',
    maxWidth: '320px',
    background: 'var(--bg-menu)',
    zIndex: 999,
    transition: 'transform var(--transition-normal)',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-menu)'
  },
  menuHeader: {
    padding: 'var(--spacing-lg)',
    borderBottom: '1px solid var(--border-separator)'
  },
  menuItem: {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-menu-item)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },

  // Sections
  section: {
    background: 'var(--bg-section)',
    backdropFilter: 'var(--blur-standard)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-light)',
    marginBottom: 'var(--spacing-lg)'
  },
  sectionTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'bold',
    marginBottom: 'var(--spacing-lg)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none'
  },

  // Cards de résultats
  resultCard: (status) => ({
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-md)',
    background: status === 'error' 
      ? 'linear-gradient(135deg, var(--color-error-bg), rgba(239, 68, 68, 0.05))'
      : status === 'warning'
      ? 'linear-gradient(135deg, var(--color-warning-bg), rgba(251, 146, 60, 0.05))'
      : 'linear-gradient(135deg, var(--color-success-bg), rgba(34, 197, 94, 0.05))',
    border: status === 'error'
      ? '1px solid var(--color-error-border)'
      : status === 'warning'
      ? '1px solid var(--color-warning-border)'
      : '1px solid var(--color-success-border)'
  }),
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)'
  },
  resultLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-secondary)'
  },
  resultValue: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'bold'
  },

  // Formulaires
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)'
  },
  formLabel: {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600',
    marginBottom: 'var(--spacing-sm)'
  },
  select: {
    width: '100%',
    padding: 'var(--spacing-md)',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-size-base)'
  },
  input: {
    flex: 1,
    textAlign: 'center',
    padding: 'var(--spacing-md)',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-size-base)'
  },
  helpText: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-secondary)',
    marginTop: 'var(--spacing-sm)'
  },
  smallHelpText: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-muted)',
    marginTop: 'var(--spacing-xs)'
  },

  // Boutons
  button: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    background: 'var(--border-separator)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  primaryButton: {
    width: '100%',
    marginTop: 'var(--spacing-xl)',
    padding: 'var(--spacing-md)',
    background: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: 'var(--font-size-base)'
  },
  warningButton: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontSize: 'var(--font-size-xs)',
    background: 'var(--color-warning-bg)',
    border: '1px solid var(--color-warning-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },

  // Messages de statut
  statusSuccess: {
    fontWeight: '600',
    color: 'var(--color-success)',
    marginBottom: 'var(--spacing-sm)'
  },
  statusError: {
    fontWeight: '600',
    color: 'var(--color-error)',
    marginBottom: 'var(--spacing-sm)'
  },
  statusWarning: {
    fontWeight: '600',
    color: 'var(--color-warning)',
    marginBottom: 'var(--spacing-sm)'
  },

  // Listes
  suggestionList: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-success-light)',
    paddingLeft: '20px',
    marginBottom: 'var(--spacing-md)'
  },
  errorList: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-error-light)',
    paddingLeft: '20px'
  },

  // Footer
  footer: {
    background: 'var(--bg-footer)',
    borderTop: '1px solid var(--border-separator)',
    marginTop: 'var(--spacing-xxl)'
  },
  footerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: 'var(--spacing-xl) var(--spacing-lg)'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--spacing-lg)',
    fontSize: 'var(--font-size-sm)'
  },
  footerTitle: {
    fontWeight: 'bold',
    color: 'var(--color-secondary)',
    marginBottom: 'var(--spacing-sm)'
  },
  footerText: {
    color: 'var(--text-secondary)',
    fontSize: 'var(--font-size-xs)'
  },
  footerLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none'
  },
  footerCopyright: {
    marginTop: 'var(--spacing-lg)',
    paddingTop: 'var(--spacing-lg)',
    borderTop: '1px solid var(--border-footer)',
    textAlign: 'center',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-muted)'
  },

  // Content
  content: {
    padding: 'var(--spacing-lg)'
  },
  contentContainer: {
    maxWidth: '1280px',
    margin: '0 auto'
  },

  // Sections spécifiques
  sectionISO: {
    background: 'var(--bg-section)',
    backdropFilter: 'var(--blur-standard)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-section-iso-border)',
    marginBottom: 'var(--spacing-lg)'
  },
  sectionAperture: {
    background: 'var(--bg-section)',
    backdropFilter: 'var(--blur-standard)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-section-aperture-border)'
  },
  selectISO: {
    width: '100%',
    padding: 'var(--spacing-md)',
    background: 'var(--bg-input)',
    border: '1px solid var(--color-section-iso)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-size-base)'
  },
  selectAperture: {
    width: '100%',
    padding: 'var(--spacing-md)',
    background: 'var(--bg-input)',
    border: '1px solid var(--color-section-aperture)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-size-base)'
  },

  // Couleurs de titre par section (utilisent les variables CSS)
  titleMain: 'var(--color-section-main)',
  titleISO: 'var(--color-section-iso)',
  titleAperture: 'var(--color-section-aperture)',
  titleSettings: 'var(--color-section-settings)',

  // Utilitaires
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)'
  },
  textCenter: {
    textAlign: 'center'
  },
  fullWidth: {
    width: '100%'
  },
  clickableLink: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: 'var(--color-section-iso)'
  }
};

// Pas d'export - variable globale pour Babel standalone