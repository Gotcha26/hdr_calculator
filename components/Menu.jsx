// components/Menu.jsx - Menu latéral de navigation

const Menu = ({ menuOpen, setMenuOpen, currentPage, setCurrentPage }) => {
  const styles = {
    menuOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 998,
      display: menuOpen ? 'block' : 'none'
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
      transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      overflowY: 'auto',
      boxShadow: '4px 0 12px rgba(0,0,0,0.5)'
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
    }
  };

  return (
    <>
      {menuOpen && <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)} />}
      
      <div style={styles.menuSidebar}>
        <div style={{padding: '24px', borderBottom: '1px solid #475569'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            HDR Calculator
          </h2>
          <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px'}}>v1.0 Complète</p>
        </div>
        
        <div style={{...styles.menuItem, background: currentPage === 'calculator' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}} onClick={() => { setCurrentPage('calculator'); setMenuOpen(false); }}>
          <span style={{fontSize: '1.25rem'}}>📷</span>
          <span>Calcul HDR</span>
        </div>
        
        <div style={{...styles.menuItem, background: currentPage === 'settings' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}} onClick={() => { setCurrentPage('settings'); setMenuOpen(false); }}>
          <span style={{fontSize: '1.25rem'}}>⚙️</span>
          <span>Paramètres</span>
        </div>
        
        <div style={styles.menuItem} onClick={() => window.open('#faq', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>❓</span>
          <span>FAQ</span>
        </div>
        
        <div style={styles.menuItem} onClick={() => window.open('#github', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>🔗</span>
          <span>GitHub</span>
        </div>
        
        <div style={styles.menuItem} onClick={() => window.open('#support', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>❤️</span>
          <span>Me soutenir</span>
        </div>
      </div>
    </>
  );
};
