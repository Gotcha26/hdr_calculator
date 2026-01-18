// components/Header.jsx - En-tête de l'application

const Header = ({ setMenuOpen }) => {
  return (
    <div style={appStyles.header}>
      <div style={appStyles.headerContainer}>
        <button 
          onClick={() => setMenuOpen(prev => !prev)}
          style={appStyles.headerButton}
        >
          ☰
        </button>
        
        <div style={{flex: 1}}>
          <h1 style={appStyles.headerTitle}>
            HDR Calculator
          </h1>
          <p style={appStyles.headerSubtitle}>Calculateur de séquences HDR</p>
        </div>
      </div>
    </div>
  );
};