// components/SettingsPage.jsx - Page de configuration matériel



const SettingsPage = ({ 
  settings, 
  setSettings, 
  setCurrentPage, 
  photoDatabase,
  cameraTypes 
}) => {
  
  return (
    <div style={appStyles.section}>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
        <span>⚙️</span> Configuration matériel
      </h2>
      
      {/* SECTION TECHNIQUE */}
      <div style={{marginBottom: '32px'}}>
        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: appStyles.titleSettings}}>
          ⚙️ Technique
        </h3>
        
        {/* Boîtier */}
        <div style={{marginBottom: '24px'}}>
          <h4 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1'}}>
            Boîtier
          </h4>
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
              <p style={appStyles.helpText}>
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
              <p style={appStyles.helpText}>Capacité du capteur (8-20 EV, défaut: 15 EV)</p>
            </div>

            {/* Paliers IL */}
            <div style={{gridColumn: '1 / -1'}}>
              <label style={appStyles.formLabel}>Paliers IL (incréments)</label>
              <select 
                value={settings.increment} 
                onChange={(e) => setSettings({...settings, increment: e.target.value})} 
                style={appStyles.select}
              >
                <option value="1:1">1:1 (stops entiers)</option>
                <option value="1:2">1:2 (demi-stops)</option>
                <option value="1:3">1:3 (tiers de stops)</option>
              </select>
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
              <label style={appStyles.formLabel}>Vitesse Minimum (pose longue)</label>
              <select 
                value={settings.speedMin} 
                onChange={(e) => setSettings({...settings, speedMin: parseInt(e.target.value)})} 
                style={appStyles.select}
              >
                {photoDatabase.shutter_speeds.values.slice(0, 30).map((speed, idx) => (
                  <option key={idx} value={idx}>{speed.display}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={appStyles.formLabel}>Vitesse Maximum (pose rapide)</label>
              <select 
                value={settings.speedMax} 
                onChange={(e) => setSettings({...settings, speedMax: parseInt(e.target.value)})} 
                style={appStyles.select}
              >
                {photoDatabase.shutter_speeds.values.slice(30).map((speed, idx) => (
                  <option key={idx} value={idx + 30}>{speed.display}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Objectif */}
        <div>
          <h4 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1'}}>
            Objectif
          </h4>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
            <div>
              <label style={appStyles.formLabel}>Ouverture maximale (la plus lumineuse)</label>
              <select 
                value={settings.apertureMin} 
                onChange={(e) => setSettings({...settings, apertureMin: parseInt(e.target.value)})} 
                style={appStyles.select}
              >
                {photoDatabase.aperture_values.values.map((aperture, idx) => (
                  <option key={idx} value={idx}>{aperture.display}</option>
                ))}
              </select>
              <p style={appStyles.smallHelpText}>Plus petit nombre f/ = plus lumineux</p>
            </div>

            <div>
              <label style={appStyles.formLabel}>Ouverture minimale (fermée)</label>
              <select 
                value={settings.apertureMax} 
                onChange={(e) => setSettings({...settings, apertureMax: parseInt(e.target.value)})} 
                style={appStyles.select}
              >
                {photoDatabase.aperture_values.values.map((aperture, idx) => (
                  <option key={idx} value={idx}>{aperture.display}</option>
                ))}
              </select>
              <p style={appStyles.smallHelpText}>Plus grand nombre f/ = moins lumineux</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION ARTISTIQUE */}
      <div>
        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: appStyles.titleAperture}}>
          🎨 Artistique
        </h3>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
          <div>
            <label style={appStyles.formLabel}>
              Limite de durée séquence (astrophotographie)
            </label>
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
            <p style={appStyles.helpText}>Pour éviter le filé d'étoiles</p>
          </div>
        </div>
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