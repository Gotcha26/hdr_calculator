// components/SettingsPage.jsx - Page de configuration matériel



const SettingsPage = ({ 
  settings, 
  setSettings, 
  setCurrentPage, 
  photoDatabase,
  cameraTypes 
}) => {
  const [techOpen, setTechOpen] = React.useState(true);
  const [artisticOpen, setArtisticOpen] = React.useState(false);
  const [boitierOpen, setBoitierOpen] = React.useState(true);
  const [objectifOpen, setObjectifOpen] = React.useState(true);
  
  // Filtrer les ouvertures pour les paramètres artistiques (selon limites techniques)
  const getArtisticApertureOptions = () => {
    return photoDatabase.aperture_values.values.filter((_, idx) => 
      idx >= settings.apertureMin && idx <= settings.apertureMax
    );
  };
  
  // Filtrer les ISO pour les paramètres artistiques (selon limites techniques)
  const getArtisticIsoOptions = () => {
    return photoDatabase.iso_values.values.filter((_, idx) => 
      idx >= settings.isoMin && idx <= settings.isoMax
    );
  };
  
  return (
    <div style={{maxWidth: '1280px', margin: '0 auto'}}>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
        <span>⚙️</span> Configuration matériel
      </h2>
      
      {/* SECTION TECHNIQUE - ACCORDION */}
      <div style={{
        ...appStyles.section,
        marginBottom: '24px'
      }}>
        <h3 
          onClick={() => setTechOpen(!techOpen)}
          style={{
            ...appStyles.sectionTitle,
            color: appStyles.titleSettings,
            marginBottom: techOpen ? '24px' : '0'
          }}
        >
          <span>⚙️ Technique</span>
          <span style={{fontSize: '1.25rem'}}>{techOpen ? '▼' : '▶'}</span>
        </h3>
        
        {techOpen && (
          <div>
            {/* Boîtier */}
            <div style={{marginBottom: '24px'}}>
              <h4 
                onClick={() => setBoitierOpen(!boitierOpen)}
                style={{
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{fontSize: '0.875rem'}}>{boitierOpen ? '▼' : '▶'}</span>
                <span>Boîtier</span>
              </h4>
              {boitierOpen && (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                  {/* Type de boîtier */}
                  <div>
                    <label style={appStyles.formLabel}>Type de boîtier</label>
                    <select 
                      value={settings.cameraType} 
                      onChange={(e) => setSettings({...settings, cameraType: e.target.value})} 
                      style={appStyles.select}
                    >
                      {Object.entries(cameraTypes).map(([key, data]) => (
                        <option key={key} value={key}>{data.name}</option>
                      ))}
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>
                      Temps mini/photo : {(cameraTypes[settings.cameraType].minTime + cameraTypes[settings.cameraType].bufferDelay).toFixed(3)}s
                    </p>
                  </div>

                  {/* Plage dynamique capteur */}
                  <div>
                    <label style={appStyles.formLabel}>Plage dynamique capteur</label>
                    <div style={appStyles.flexCenter}>
                      <button 
                        onClick={() => setSettings({...settings, sensorDynamicRange: Math.max(8, settings.sensorDynamicRange - 1)})} 
                        style={appStyles.button}
                      >
                        −
                      </button>
                      <input 
                        type="number" 
                        value={settings.sensorDynamicRange} 
                        onChange={(e) => setSettings({...settings, sensorDynamicRange: parseInt(e.target.value) || 15})} 
                        min="8" 
                        max="20" 
                        style={appStyles.input}
                      />
                      <button 
                        onClick={() => setSettings({...settings, sensorDynamicRange: Math.min(20, settings.sensorDynamicRange + 1)})} 
                        style={appStyles.button}
                      >
                        +
                      </button>
                      <span style={{fontSize: '0.875rem', color: '#94a3b8'}}>EV</span>
                    </div>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>Capacité du capteur 8-20 EV, défaut: 15 EV</p>
                  </div>

                  {/* Séquence de bracketing */}
                  <div>
                    <label style={appStyles.formLabel}>Séquence de bracketing</label>
                    <select 
                      value={settings.maxBrackets} 
                      onChange={(e) => setSettings({...settings, maxBrackets: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      <option value={3}>3 images</option>
                      <option value={5}>5 images</option>
                      <option value={7}>7 images</option>
                      <option value={9}>9 images</option>
                      <option value={12}>12 images</option>
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>Nombre maximum de photos dans la séquence HDR</p>
                  </div>

                  {/* Paliers IL */}
                  <div style={{gridColumn: '1 / -1'}}>
                    <label style={appStyles.formLabel}>Paliers IL</label>
                    <select 
                      value={settings.increment} 
                      onChange={(e) => setSettings({...settings, increment: e.target.value})} 
                      style={appStyles.select}
                    >
                      <option value="1:1">1:1 (stops entiers)</option>
                      <option value="1:2">1:2 (demi-stops)</option>
                      <option value="1:3">1:3 (tiers de stops)</option>
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>incréments</p>
                  </div>

                  {/* ISO Min/Max */}
                  <div>
                    <label style={appStyles.formLabel}>ISO Minimum</label>
                    <select 
                      value={settings.isoMin} 
                      onChange={(e) => setSettings({...settings, isoMin: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      {photoDatabase.iso_values.values.map((iso, idx) => (
                        <option key={idx} value={idx}>{iso.display}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={appStyles.formLabel}>ISO Maximum</label>
                    <select 
                      value={settings.isoMax} 
                      onChange={(e) => setSettings({...settings, isoMax: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      {photoDatabase.iso_values.values.map((iso, idx) => (
                        <option key={idx} value={idx}>{iso.display}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vitesse Min/Max */}
                  <div>
                    <label style={appStyles.formLabel}>Vitesse Minimum</label>
                    <select 
                      value={settings.speedMin} 
                      onChange={(e) => setSettings({...settings, speedMin: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      {photoDatabase.shutter_speeds.values.slice(0, 30).map((speed, idx) => (
                        <option key={idx} value={idx}>{speed.display}</option>
                      ))}
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>pose longue</p>
                  </div>

                  <div>
                    <label style={appStyles.formLabel}>Vitesse Maximum</label>
                    <select 
                      value={settings.speedMax} 
                      onChange={(e) => setSettings({...settings, speedMax: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      {photoDatabase.shutter_speeds.values.slice(30).map((speed, idx) => (
                        <option key={idx} value={idx + 30}>{speed.display}</option>
                      ))}
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>pose rapide</p>
                  </div>
                </div>
              )}
            </div>

            {/* Objectif */}
            <div>
              <h4 
                onClick={() => setObjectifOpen(!objectifOpen)}
                style={{
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{fontSize: '0.875rem'}}>{objectifOpen ? '▼' : '▶'}</span>
                <span>Objectif</span>
              </h4>
              {objectifOpen && (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={appStyles.formLabel}>Ouverture maximale</label>
                    <select 
                      value={settings.apertureMin} 
                      onChange={(e) => setSettings({...settings, apertureMin: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      {photoDatabase.aperture_values.values.map((aperture, idx) => (
                        <option key={idx} value={idx}>{aperture.display}</option>
                      ))}
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>la plus lumineuse - Plus petit nombre f/ = plus lumineux</p>
                  </div>

                  <div>
                    <label style={appStyles.formLabel}>Ouverture minimale</label>
                    <select 
                      value={settings.apertureMax} 
                      onChange={(e) => setSettings({...settings, apertureMax: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      {photoDatabase.aperture_values.values.map((aperture, idx) => (
                        <option key={idx} value={idx}>{aperture.display}</option>
                      ))}
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>fermée - Plus grand nombre f/ = moins lumineux</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION ARTISTIQUE - ACCORDION */}
      <div style={appStyles.section}>
        <h3 
          onClick={() => setArtisticOpen(!artisticOpen)}
          style={{
            ...appStyles.sectionTitle,
            color: appStyles.titleAperture,
            marginBottom: artisticOpen ? '24px' : '0'
          }}
        >
          <span>🎨 Artistique</span>
          <span style={{fontSize: '1.25rem'}}>{artisticOpen ? '▼' : '▶'}</span>
        </h3>
        
        {artisticOpen && (
          <div>
            {/* Limite durée - ligne seule */}
            <div style={{marginBottom: '16px'}}>
              <label style={appStyles.formLabel}>Limite de durée séquence</label>
              <select 
                value={settings.durationLimit} 
                onChange={(e) => setSettings({...settings, durationLimit: parseFloat(e.target.value)})} 
                style={appStyles.select}
              >
                <option value={999}>Aucune limite</option>
                {Array.from({length: 16}, (_, i) => (1.5 + i * 0.1)).map(val => (
                  <option key={val} value={val}>{val.toFixed(1)}s</option>
                ))}
              </select>
              <p style={{...appStyles.helpText, fontStyle: 'italic'}}>astrophotographie - Pour éviter le filé d'étoiles</p>
            </div>

            {/* Ouvertures - 2 colonnes */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={appStyles.formLabel}>Ouverture maximale</label>
                <select 
                  value={settings.artisticApertureMin} 
                  onChange={(e) => setSettings({...settings, artisticApertureMin: parseInt(e.target.value)})} 
                  style={appStyles.select}
                >
                  {getArtisticApertureOptions().map((aperture) => {
                    const idx = photoDatabase.aperture_values.values.indexOf(aperture);
                    return <option key={idx} value={idx}>{aperture.display}</option>;
                  })}
                </select>
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>zone acceptable - Netteté faible mais acceptable petit f/</p>
              </div>

              <div>
                <label style={appStyles.formLabel}>Ouverture minimale</label>
                <select 
                  value={settings.artisticApertureMax} 
                  onChange={(e) => setSettings({...settings, artisticApertureMax: parseInt(e.target.value)})} 
                  style={appStyles.select}
                >
                  {getArtisticApertureOptions().map((aperture) => {
                    const idx = photoDatabase.aperture_values.values.indexOf(aperture);
                    return <option key={idx} value={idx}>{aperture.display}</option>;
                  })}
                </select>
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>zone optimale - Zone de netteté optimale grand f/</p>
              </div>
            </div>

            {/* ISO - 2 colonnes */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'}}>
              <div>
                <label style={appStyles.formLabel}>ISO minimum</label>
                <select 
                  value={settings.artisticIsoMin} 
                  onChange={(e) => setSettings({...settings, artisticIsoMin: parseInt(e.target.value)})} 
                  style={appStyles.select}
                >
                  {getArtisticIsoOptions().map((iso) => {
                    const idx = photoDatabase.iso_values.values.indexOf(iso);
                    return <option key={idx} value={idx}>{iso.display}</option>;
                  })}
                </select>
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>qualité optimale - Différence peu perceptible en dessous</p>
              </div>

              <div>
                <label style={appStyles.formLabel}>ISO maximum</label>
                <select 
                  value={settings.artisticIsoMax} 
                  onChange={(e) => setSettings({...settings, artisticIsoMax: parseInt(e.target.value)})} 
                  style={appStyles.select}
                >
                  {getArtisticIsoOptions().map((iso) => {
                    const idx = photoDatabase.iso_values.values.indexOf(iso);
                    return <option key={idx} value={idx}>{iso.display}</option>;
                  })}
                </select>
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>qualité acceptable - Éviter d'aller au-delà pour la qualité</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => setCurrentPage('calculator')} 
        style={appStyles.primaryButton}
      >
        ← Retour au calcul
      </button>
    </div>
  );
};