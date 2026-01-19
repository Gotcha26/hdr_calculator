// components/Footer.jsx - Pied de page de l'application

const Footer = () => {
  const version = typeof versionInfo !== 'undefined' 
    ? versionInfo.getShortVersion() 
    : 'v1.0 dev unknown';
  
  const datetime = typeof versionInfo !== 'undefined'
    ? versionInfo.getDateTime()
    : 'Date inconnue';
  
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
              <span title={datetime} style={{cursor: 'help', borderBottom: '1px dotted #94a3b8'}}>
                {version}
              </span>
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