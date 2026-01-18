// styles.js - Styles centralisés de l'application (variable globale pour Babel standalone)

const appStyles = {
  // Conteneur principal
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
    color: 'white'
  },

  // Header
  header: {
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #475569',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  headerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerButton: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.5rem'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #60a5fa, #22d3ee)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerSubtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },

  // Menu
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 998
  },
  menuSidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '85%',
    maxWidth: '320px',
    background: 'linear-gradient(180deg, rgb(30, 41, 59), rgb(15, 23, 42))',
    zIndex: 999,
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
    boxShadow: '4px 0 12px rgba(0,0,0,0.5)'
  },
  menuHeader: {
    padding: '24px',
    borderBottom: '1px solid #475569'
  },
  menuItem: {
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'white',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Sections
  section: {
    background: 'rgba(51, 65, 85, 0.5)',
    backdropFilter: 'blur(12px)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none'
  },

  // Cards de résultats
  resultCard: (status) => ({
    padding: '16px',
    borderRadius: '8px',
    background: status === 'error' 
      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
      : status === 'warning'
      ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.05))'
      : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
    border: status === 'error'
      ? '1px solid rgba(239, 68, 68, 0.3)'
      : status === 'warning'
      ? '1px solid rgba(251, 146, 60, 0.3)'
      : '1px solid rgba(34, 197, 94, 0.3)'
  }),
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  resultLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  resultValue: {
    fontSize: '1.125rem',
    fontWeight: 'bold'
  },

  // Formulaires
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  formLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '8px'
  },
  select: {
    width: '100%',
    padding: '12px',
    background: 'rgb(30, 41, 59)',
    border: '1px solid rgb(71, 85, 105)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px'
  },
  input: {
    flex: 1,
    textAlign: 'center',
    padding: '12px',
    background: 'rgb(30, 41, 59)',
    border: '1px solid rgb(71, 85, 105)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px'
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '8px'
  },
  smallHelpText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '4px'
  },

  // Boutons
  button: {
    padding: '8px 16px',
    background: '#475569',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  primaryButton: {
    width: '100%',
    marginTop: '32px',
    padding: '12px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '16px'
  },
  warningButton: {
    padding: '8px 16px',
    fontSize: '0.75rem',
    background: 'rgba(251, 146, 60, 0.2)',
    border: '1px solid rgba(251, 146, 60, 0.3)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer'
  },

  // Messages de statut
  statusSuccess: {
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: '8px'
  },
  statusError: {
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: '8px'
  },
  statusWarning: {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '8px'
  },

  // Listes
  suggestionList: {
    fontSize: '0.75rem',
    color: '#86efac',
    paddingLeft: '20px',
    marginBottom: '12px'
  },
  errorList: {
    fontSize: '0.75rem',
    color: '#fca5a5',
    paddingLeft: '20px'
  },

  // Footer
  footer: {
    background: 'rgba(15, 23, 42, 0.3)',
    borderTop: '1px solid #475569',
    marginTop: '48px'
  },
  footerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    fontSize: '0.875rem'
  },
  footerTitle: {
    fontWeight: 'bold',
    color: '#22d3ee',
    marginBottom: '8px'
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '0.75rem'
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none'
  },
  footerCopyright: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #334155',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#64748b'
  },

  // Content
  content: {
    padding: '24px'
  },
  contentContainer: {
    maxWidth: '1280px',
    margin: '0 auto'
  },

  // Sections spécifiques
  sectionISO: {
    background: 'rgba(51, 65, 85, 0.5)',
    backdropFilter: 'blur(12px)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    marginBottom: '24px'
  },
  sectionAperture: {
    background: 'rgba(51, 65, 85, 0.5)',
    backdropFilter: 'blur(12px)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  selectISO: {
    width: '100%',
    padding: '12px',
    background: 'rgb(30, 41, 59)',
    border: '1px solid rgb(251, 191, 36)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px'
  },
  selectAperture: {
    width: '100%',
    padding: '12px',
    background: 'rgb(30, 41, 59)',
    border: '1px solid rgb(168, 85, 247)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px'
  },

  // Couleurs de titre par section
  titleMain: '#22d3ee',
  titleISO: '#fbbf24',
  titleAperture: '#a855f7',
  titleSettings: '#22d3ee',

  // Utilitaires
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
    color: '#fbbf24'
  }
};

// Pas d'export - variable globale pour Babel standalone