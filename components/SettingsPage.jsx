// components/SettingsPage.jsx - Page de configuration matériel (optimisé mobile)

const SettingsPage = ({ 
  settings, 
  setSettings, 
  setCurrentPage, 
  photoDatabase,
  cameraTypes 
}) => {
  const [generalOpen, setGeneralOpen] = React.useState(true);
  const [techOpen, setTechOpen] = React.useState(false);
  const [artisticOpen, setArtisticOpen] = React.useState(false);
  const [boitierOpen, setBoitierOpen] = React.useState(false);
  const [objectifOpen, setObjectifOpen] = React.useState(false);
  
  // Détection mobile
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Langue actuelle
  const [currentLang, setCurrentLang] = React.useState(i18n.getLanguage());
  
  // Changer de langue
  const handleLanguageChange = (lang) => {
    if (window.changeLanguage) {
      window.changeLanguage(lang);
      setCurrentLang(lang);
    }
  };
  
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
        <span>⚙️</span> {t("Configuration matériel")}
      </h2>
      
      {/* SECTION GÉNÉRAL - LANGUE */}
      <div style={{
        ...appStyles.section,
        marginBottom: '24px'
      }}>
        <h3 
          onClick={() => setGeneralOpen(!generalOpen)}
          style={{
            ...appStyles.sectionTitle,
            color: appStyles.titleSettings,
            marginBottom: generalOpen ? '24px' : '0'
          }}
        >
          <span>🌐 {t("Général")}</span>
          <span style={{fontSize: '1.25rem'}}>{generalOpen ? '▼' : '▶'}</span>
        </h3>
        
        {generalOpen && (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
            <div>
              <label style={appStyles.formLabel}>{t("Langue")}</label>
              <select 
                value={currentLang} 
                onChange={(e) => handleLanguageChange(e.target.value)} 
                style={appStyles.select}
              >
                {i18n.getAvailableLanguages().map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <p style={{...appStyles.helpText, fontStyle: 'italic'}}>
                {t("Langue de l'interface")}
              </p>
            </div>
          </div>
        )}
      </div>
      
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
          <span>⚙️ {t("Technique")}</span>
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
                <span>{t("Boîtier")}</span>
              </h4>
              {boitierOpen && (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                  {/* Type de boîtier */}
                  <div>
                    <label style={appStyles.formLabel}>{t("Type de boîtier")}</label>
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
                      {t("Temps mini/photo")} : {(cameraTypes[settings.cameraType].minTime + cameraTypes[settings.cameraType].bufferDelay).toFixed(3)}s
                    </p>
                  </div>

                  {/* Plage dynamique capteur */}
                  <div>
                    <label style={appStyles.formLabel}>{t("Plage dynamique capteur")}</label>
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
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Capacité du capteur")} 8-20 EV</p>
                  </div>

                  {/* Séquence de bracketing */}
                  <div>
                    <label style={appStyles.formLabel}>{t("Séquence de bracketing")}</label>
                    <select 
                      value={settings.maxBrackets} 
                      onChange={(e) => setSettings({...settings, maxBrackets: parseInt(e.target.value)})} 
                      style={appStyles.select}
                    >
                      <option value={3}>3 {t("images")}</option>
                      <option value={5}>5 {t("images")}</option>
                      <option value={7}>7 {t("images")}</option>
                      <option value={9}>9 {t("images")}</option>
                      <option value={12}>12 {t("images")}</option>
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Nombre maximum de photos")}</p>
                  </div>

                  {/* Paliers IL */}
                  <div style={{gridColumn: '1 / -1'}}>
                    <label style={appStyles.formLabel}>{t("Paliers IL")}</label>
                    <select 
                      value={settings.increment} 
                      onChange={(e) => setSettings({...settings, increment: e.target.value})} 
                      style={appStyles.select}
                    >
                      <option value="1:1">1:1 ({t("stops entiers")})</option>
                      <option value="1:2">1:2 ({t("demi-stops")})</option>
                      <option value="1:3">1:3 ({t("tiers de stops")})</option>
                    </select>
                    <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Incréments")}</p>
                  </div>

                  {/* ISO Min/Max - côte à côte sur mobile */}
                  {isMobile ? (
                    <div style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                      <div>
                        <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                          {t("ISO Minimum")}
                        </label>
                        <select 
                          value={settings.isoMin} 
                          onChange={(e) => setSettings({...settings, isoMin: parseInt(e.target.value)})} 
                          style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                        >
                          {photoDatabase.iso_values.values.map((iso, idx) => (
                            <option key={idx} value={idx}>{iso.display}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                          {t("ISO Maximum")}
                        </label>
                        <select 
                          value={settings.isoMax} 
                          onChange={(e) => setSettings({...settings, isoMax: parseInt(e.target.value)})} 
                          style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                        >
                          {photoDatabase.iso_values.values.map((iso, idx) => (
                            <option key={idx} value={idx}>{iso.display}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={appStyles.formLabel}>{t("ISO Minimum")}</label>
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
                        <label style={appStyles.formLabel}>{t("ISO Maximum")}</label>
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
                    </>
                  )}

                  {/* Vitesse Min/Max - côte à côte sur mobile */}
                  {isMobile ? (
                    <div style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                      <div>
                        <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                          {t("Vitesse Minimum")}
                        </label>
                        <select 
                          value={settings.speedMin} 
                          onChange={(e) => setSettings({...settings, speedMin: parseInt(e.target.value)})} 
                          style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                        >
                          {photoDatabase.shutter_speeds.values.slice(0, 30).map((speed, idx) => (
                            <option key={idx} value={idx}>{speed.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic', fontSize: '0.65rem'}}>
                          {t("Pose longue")}
                        </p>
                      </div>

                      <div>
                        <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                          {t("Vitesse Maximum")}
                        </label>
                        <select 
                          value={settings.speedMax} 
                          onChange={(e) => setSettings({...settings, speedMax: parseInt(e.target.value)})} 
                          style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                        >
                          {photoDatabase.shutter_speeds.values.slice(30).map((speed, idx) => (
                            <option key={idx} value={idx + 30}>{speed.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic', fontSize: '0.65rem'}}>
                          {t("Pose rapide")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={appStyles.formLabel}>{t("Vitesse Minimum")}</label>
                        <select 
                          value={settings.speedMin} 
                          onChange={(e) => setSettings({...settings, speedMin: parseInt(e.target.value)})} 
                          style={appStyles.select}
                        >
                          {photoDatabase.shutter_speeds.values.slice(0, 30).map((speed, idx) => (
                            <option key={idx} value={idx}>{speed.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Pose longue")}</p>
                      </div>

                      <div>
                        <label style={appStyles.formLabel}>{t("Vitesse Maximum")}</label>
                        <select 
                          value={settings.speedMax} 
                          onChange={(e) => setSettings({...settings, speedMax: parseInt(e.target.value)})} 
                          style={appStyles.select}
                        >
                          {photoDatabase.shutter_speeds.values.slice(30).map((speed, idx) => (
                            <option key={idx} value={idx + 30}>{speed.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Pose rapide")}</p>
                      </div>
                    </>
                  )}
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
                <span>{t("Objectif")}</span>
              </h4>
              {objectifOpen && (
                <>
                  {/* Ouvertures - côte à côte sur mobile */}
                  {isMobile ? (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                      <div>
                        <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                          {t("Ouverture maximale")}
                        </label>
                        <select 
                          value={settings.apertureMin} 
                          onChange={(e) => setSettings({...settings, apertureMin: parseInt(e.target.value)})} 
                          style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                        >
                          {photoDatabase.aperture_values.values.map((aperture, idx) => (
                            <option key={idx} value={idx}>{aperture.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic', fontSize: '0.65rem'}}>
                          {t("La plus lumineuse")}
                        </p>
                      </div>

                      <div>
                        <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                          {t("Ouverture minimale")}
                        </label>
                        <select 
                          value={settings.apertureMax} 
                          onChange={(e) => setSettings({...settings, apertureMax: parseInt(e.target.value)})} 
                          style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                        >
                          {photoDatabase.aperture_values.values.map((aperture, idx) => (
                            <option key={idx} value={idx}>{aperture.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic', fontSize: '0.65rem'}}>
                          {t("Fermée")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                      <div>
                        <label style={appStyles.formLabel}>{t("Ouverture maximale")}</label>
                        <select 
                          value={settings.apertureMin} 
                          onChange={(e) => setSettings({...settings, apertureMin: parseInt(e.target.value)})} 
                          style={appStyles.select}
                        >
                          {photoDatabase.aperture_values.values.map((aperture, idx) => (
                            <option key={idx} value={idx}>{aperture.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("La plus lumineuse")}</p>
                      </div>

                      <div>
                        <label style={appStyles.formLabel}>{t("Ouverture minimale")}</label>
                        <select 
                          value={settings.apertureMax} 
                          onChange={(e) => setSettings({...settings, apertureMax: parseInt(e.target.value)})} 
                          style={appStyles.select}
                        >
                          {photoDatabase.aperture_values.values.map((aperture, idx) => (
                            <option key={idx} value={idx}>{aperture.display}</option>
                          ))}
                        </select>
                        <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("ermée")}</p>
                      </div>
                    </div>
                  )}
                </>
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
          <span>🎨 {t("Artistique")}</span>
          <span style={{fontSize: '1.25rem'}}>{artisticOpen ? '▼' : '▶'}</span>
        </h3>
        
        {artisticOpen && (
          <div>
            {/* Limite durée - ligne seule */}
            <div style={{marginBottom: '16px'}}>
              <label style={appStyles.formLabel}>{t("Limite de durée séquence")}</label>
              <select 
                value={settings.durationLimit} 
                onChange={(e) => setSettings({...settings, durationLimit: parseFloat(e.target.value)})} 
                style={appStyles.select}
              >
                <option value={999}>{t("Aucune limite")}</option>
                {Array.from({length: 16}, (_, i) => (1.5 + i * 0.1)).map(val => (
                  <option key={val} value={val}>{val.toFixed(1)}s</option>
                ))}
              </select>
              <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Astrophotographie")} - {t("Pour éviter le filé d'étoiles")}</p>
            </div>

            {/* Ouvertures - 2 colonnes */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={appStyles.formLabel}>{t("Ouverture maximale")}</label>
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
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Zone acceptable")}</p>
              </div>

              <div>
                <label style={appStyles.formLabel}>{t("Ouverture minimale")}</label>
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
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Zone optimale")}</p>
              </div>
            </div>

            {/* ISO - 2 colonnes */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'}}>
              <div>
                <label style={appStyles.formLabel}>{t("ISO minimum")}</label>
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
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Qualité optimale")}</p>
              </div>

              <div>
                <label style={appStyles.formLabel}>{t("ISO maximum")}</label>
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
                <p style={{...appStyles.helpText, fontStyle: 'italic'}}>{t("Qualité acceptable")}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => setCurrentPage('calculator')} 
        style={appStyles.primaryButton}
      >
        ← {t("Retour au calcul")}
      </button>
    </div>
  );
};