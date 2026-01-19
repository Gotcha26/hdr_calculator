// components/Menu.jsx - Menu latéral de navigation

const Menu = ({ menuOpen, setMenuOpen, currentPage, setCurrentPage }) => {
  const [version, setVersion] = React.useState('v1.0 dev');
  
  React.useEffect(() => {
    if (typeof versionInfo !== 'undefined') {
      versionInfo.getFullVersion().then(v => setVersion(v));
    }
  }, []);
  
  return (
    <>
      {menuOpen && (
        <div 
          style={{...appStyles.menuOverlay, display: 'block'}} 
          onClick={() => setMenuOpen(false)} 
        />
      )}
      
      <div style={{
        ...appStyles.menuSidebar,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={appStyles.menuHeader}>
          <h2 style={appStyles.headerTitle}>
            HDR Calculator
          </h2>
          <p style={{...appStyles.headerSubtitle, marginTop: '4px'}}>{version}</p>
        </div>
        
        <div 
          style={{
            ...appStyles.menuItem, 
            background: currentPage === 'calculator' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
          }} 
          onClick={() => { setCurrentPage('calculator'); setMenuOpen(false); }}
        >
          <span style={{fontSize: '1.25rem'}}>📷</span>
          <span>Calcul HDR</span>
        </div>
        
        <div 
          style={{
            ...appStyles.menuItem, 
            background: currentPage === 'settings' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
          }} 
          onClick={() => { setCurrentPage('settings'); setMenuOpen(false); }}
        >
          <span style={{fontSize: '1.25rem'}}>⚙️</span>
          <span>Paramètres</span>
        </div>
        
        <div style={appStyles.menuItem} onClick={() => window.open('#faq', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>❓</span>
          <span>FAQ</span>
        </div>
        
        <div style={appStyles.menuItem} onClick={() => window.open('#github', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>🔗</span>
          <span>GitHub</span>
        </div>
        
        <div style={appStyles.menuItem} onClick={() => window.open('#support', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>❤️</span>
          <span>Me soutenir</span>
        </div>
      </div>
    </>
  );
};