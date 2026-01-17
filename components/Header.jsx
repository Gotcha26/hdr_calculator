// components/Header.jsx - En-tête de l'application

const Header = ({ setMenuOpen }) => {
  return (
    <div style={{background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #475569', position: 'sticky', top: 0, zIndex: 50}}>
      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px'}}>
        <button 
          onClick={() => setMenuOpen(prev => !prev)}
          style={{padding: '8px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem'}}
        >
          ☰
        </button>
        
        <div style={{flex: 1}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            HDR Calculator
          </h1>
          <p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Calculateur de séquences HDR</p>
        </div>
      </div>
    </div>
  );
};
