// components/MainSection.jsx - Section Vue centrée



const MainSection = ({ 
  mainValues, 
  setMainValues, 
  mainResult, 
  settings, 
  setSettings, 
  photoDatabase,
  filterByIncrementAndLimits,
  getSpacingOptions
}) => {
  
  return (
    <div style={appStyles.section}>
      <h2 style={{...appStyles.sectionTitle, color: appStyles.titleMain}}>
        📷 Vue centrée
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={appStyles.formLabel}>Ouverture</label>
          <select 
            value={mainValues.aperture} 
            onChange={(e) => setMainValues({...mainValues, aperture: parseInt(e.target.value)})} 
            style={appStyles.select}
          >
            {filterByIncrementAndLimits(
              photoDatabase.aperture_values.values, 
              settings.increment, 
              settings.apertureMin, 
              settings.apertureMax
            ).map((aperture) => (
              <option key={aperture.stop_third} value={photoDatabase.aperture_values.values.indexOf(aperture)}>
                {aperture.display}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={appStyles.formLabel}>Vitesse</label>
          <select 
            value={mainValues.shutter} 
            onChange={(e) => setMainValues({...mainValues, shutter: parseInt(e.target.value)})} 
            style={appStyles.select}
          >
            {filterByIncrementAndLimits(
              photoDatabase.shutter_speeds.values, 
              settings.increment, 
              settings.speedMin, 
              settings.speedMax
            ).map((speed) => (
              <option key={speed.stop_third} value={photoDatabase.shutter_speeds.values.indexOf(speed)}>
                {speed.display}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={appStyles.formLabel}>ISO</label>
          <select 
            value={mainValues.iso} 
            onChange={(e) => setMainValues({...mainValues, iso: parseInt(e.target.value)})} 
            style={appStyles.select}
          >
            {filterByIncrementAndLimits(
              photoDatabase.iso_values.values, 
              settings.increment, 
              settings.isoMin, 
              settings.isoMax
            ).map((iso) => (
              <option key={iso.stop_third} value={photoDatabase.iso_values.values.indexOf(iso)}>
                {iso.display}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={appStyles.formLabel}>Brackets</label>
          <select 
            value={mainValues.brackets} 
            onChange={(e) => setMainValues({...mainValues, brackets: parseInt(e.target.value)})} 
            style={appStyles.select}
          >
            {[3, 5, 7, 9].map(n => (
              <option key={n} value={n}>{n} images</option>
            ))}
          </select>
        </div>

        <div>
          <label style={appStyles.formLabel}>Espacement</label>
          <select 
            value={mainValues.spacing} 
            onChange={(e) => setMainValues({...mainValues, spacing: parseFloat(e.target.value)})} 
            style={appStyles.select}
          >
            {getSpacingOptions(settings.increment).map(val => (
              <option key={val} value={val}>{val.toFixed(2)} EV</option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultats Vue centrée */}
      <div style={appStyles.resultCard(
        mainResult.errors.length > 0 ? 'error' : 
        mainResult.durationWarning ? 'warning' : 'success'
      )}>
        <div style={appStyles.resultGrid}>
          <div>
            <p style={appStyles.resultLabel}>Plage dynamique</p>
            <p style={appStyles.resultValue}>
              {((mainValues.brackets - 1) * mainValues.spacing).toFixed(2)} EV
            </p>
          </div>
          <div>
            <p style={appStyles.resultLabel}>Durée totale</p>
            <p style={appStyles.resultValue}>{mainResult.totalDuration.toFixed(2)}s</p>
          </div>
          <div>
            <p style={appStyles.resultLabel}>Pose longue</p>
            <p style={appStyles.resultValue}>{mainResult.sequence[0].shutter.display}</p>
          </div>
          <div>
            <p style={appStyles.resultLabel}>Pose rapide</p>
            <p style={appStyles.resultValue}>
              {mainResult.sequence[mainResult.sequence.length - 1].shutter.display}
            </p>
          </div>
        </div>

        <div>
          {mainResult.errors.length === 0 ? (
            mainResult.durationWarning ? (
              <div>
                <p style={appStyles.statusWarning}>
                  ⚠️ COMPLIQUÉ (Durée astrophoto dépassée)
                </p>
                <p style={{fontSize: '0.75rem', color: '#fed7aa', marginBottom: '12px'}}>
                  Durée {mainResult.totalDuration.toFixed(2)}s dépasse {settings.durationLimit}s → Risque de filé d'étoiles
                </p>
                <button 
                  onClick={() => setSettings({...settings, durationLimit: 999})} 
                  style={appStyles.warningButton}
                >
                  🚀 Désactiver limite astrophoto
                </button>
              </div>
            ) : (
              <div>
                <p style={appStyles.statusSuccess}>✅ SÉQUENCE RÉALISABLE</p>
                {mainResult.suggestions.length > 0 && (
                  <ul style={appStyles.suggestionList}>
                    {mainResult.suggestions.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ) : (
            <div>
              <p style={appStyles.statusError}>❌ IMPOSSIBLE</p>
              <ul style={appStyles.errorList}>
                {mainResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};