// components/Footer.jsx - Pied de page de l'application

const Footer = () => {
  const [version, setVersion] = React.useState('v1.0 dev');
  
  React.useEffect(() => {
    if (typeof versionInfo !== 'undefined') {
      versionInfo.getShortVersion().then(v => setVersion(v));
    }
  }, []);
  
  return (
    <footer style={appStyles.footer}>
      <div style={appStyles.footerContainer}>
        <div style={appStyles.footerGrid}>
          <div>
            <h3 style={appStyles.footerTitle}>HDR Calculator</h3>
            <p style={appStyles.footerText}>
              Outil professionnel pour le calcul de séquences HDR en photographie.
            </p>
          </div>
          
          <div>
            <h3 style={appStyles.footerTitle}>Liens</h3>
            <ul style={{listStyle: 'none', padding: 0, fontSize: '0.75rem', color: '#94a3b8'}}>
              <li style={{marginBottom: '4px'}}>
                <a href="#faq" style={appStyles.footerLink}>FAQ</a>
              </li>
              <li style={{marginBottom: '4px'}}>
                <a href="#github" style={appStyles.footerLink}>GitHub</a>
              </li>
              <li>
                <a href="#support" style={appStyles.footerLink}>Soutenir le projet</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 style={appStyles.footerTitle}>Informations</h3>
            <p style={appStyles.footerText}>
              Créé avec ❤️ pour les photographes<br/>
              {version} • 2026
            </p>
          </div>
        </div>
        
        <div style={appStyles.footerCopyright}>
          © 2026 HDR Calculator • Tous droits réservés
        </div>
      </div>
    </footer>
  );
};