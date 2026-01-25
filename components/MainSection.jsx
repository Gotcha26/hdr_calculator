// components/MainSection.jsx - Section Vue centrée (optimisé mobile)

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
  
  // Détection simple de mobile (peut être remplacée par window.innerWidth)
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={appStyles.section}>
      <h2 style={{...appStyles.sectionTitle, color: appStyles.titleMain}}>
        📷 {t("Vue centrée")}
      </h2>

      {/* Grille responsive : 3 + 2 sur mobile, auto-fit sur desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: isMobile ? '12px' : '16px',
        marginBottom: '24px'
      }}>
        {isMobile ? (
          <>
            {/* Ligne 1 mobile : Ouverture + Vitesse + ISO */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              <div>
                <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                  {t("Ouverture")}
                </label>
                <select 
                  value={mainValues.aperture} 
                  onChange={(e) => setMainValues({...mainValues, aperture: parseInt(e.target.value)})} 
                  style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                >
                  {filterByIncrementAndLimits(
                    photoDatabase.aperture_values.values, 
                    settings.increment, 
                    settings.apertureMin, 
                    settings.apertureMax
                  ).map((aperture) => (
                    <option key={aperture.stop_sixth} value={photoDatabase.aperture_values.values.indexOf(aperture)}>
                      {aperture.display}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                  {t("Vitesse")}
                </label>
                <select 
                  value={mainValues.shutter} 
                  onChange={(e) => setMainValues({...mainValues, shutter: parseInt(e.target.value)})} 
                  style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                >
                  {filterByIncrementAndLimits(
                    photoDatabase.shutter_speeds.values, 
                    settings.increment, 
                    settings.speedMin, 
                    settings.speedMax
                  ).map((speed) => (
                    <option key={speed.stop_sixth} value={photoDatabase.shutter_speeds.values.indexOf(speed)}>
                      {speed.display}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                  {t("ISO")}
                </label>
                <select 
                  value={mainValues.iso} 
                  onChange={(e) => setMainValues({...mainValues, iso: parseInt(e.target.value)})} 
                  style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                >
                  {filterByIncrementAndLimits(
                    photoDatabase.iso_values.values, 
                    settings.increment, 
                    settings.isoMin, 
                    settings.isoMax
                  ).map((iso) => (
                    <option key={iso.stop_sixth} value={photoDatabase.iso_values.values.indexOf(iso)}>
                      {iso.display}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne 2 mobile : Brackets + Espacement */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              <div>
                <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                  {t("Brackets")}
                </label>
                <select 
                  value={mainValues.brackets} 
                  onChange={(e) => setMainValues({...mainValues, brackets: parseInt(e.target.value)})} 
                  style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                >
                  {[3, 5, 7, 9].map(n => (
                    <option key={n} value={n}>{n} {t("images")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{...appStyles.formLabel, fontSize: '0.7rem', marginBottom: '4px'}}>
                  {t("Espacement")}
                </label>
                <select 
                  value={mainValues.spacing} 
                  onChange={(e) => setMainValues({...mainValues, spacing: parseFloat(e.target.value)})} 
                  style={{...appStyles.select, padding: '8px', fontSize: '0.875rem'}}
                >
                  {getSpacingOptions(settings.increment).map(val => (
                    <option key={val} value={val}>{val.toFixed(2)} EV</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop : 5 colonnes auto-fit */}
            <div>
              <label style={appStyles.formLabel}>{t("Ouverture")}</label>
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
                  <option key={aperture.stop_sixth} value={photoDatabase.aperture_values.values.indexOf(aperture)}>
                    {aperture.display}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={appStyles.formLabel}>{t("Vitesse")}</label>
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
                  <option key={speed.stop_sixth} value={photoDatabase.shutter_speeds.values.indexOf(speed)}>
                    {speed.display}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={appStyles.formLabel}>{t("ISO")}</label>
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
                  <option key={iso.stop_sixth} value={photoDatabase.iso_values.values.indexOf(iso)}>
                    {iso.display}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={appStyles.formLabel}>{t("Brackets")}</label>
              <select 
                value={mainValues.brackets} 
                onChange={(e) => setMainValues({...mainValues, brackets: parseInt(e.target.value)})} 
                style={appStyles.select}
              >
                {[3, 5, 7, 9].map(n => (
                  <option key={n} value={n}>{n} {t("images")}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={appStyles.formLabel}>{t("Espacement")}</label>
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
          </>
        )}
      </div>

      {/* Résultats Vue centrée */}
      <div style={appStyles.resultCard(
        mainResult.errors.length > 0 ? 'error' : 
        mainResult.durationWarning ? 'warning' : 'success'
      )}>
        <div style={appStyles.resultGrid}>
          <div>
            <p style={appStyles.resultLabel}>{t("Plage dynamique")}</p>
            <p style={appStyles.resultValue}>
              {((mainValues.brackets - 1) * mainValues.spacing).toFixed(2)} EV
            </p>
          </div>
          <div>
            <p style={appStyles.resultLabel}>{t("Durée totale")}</p>
            <p style={appStyles.resultValue}>{mainResult.totalDuration.toFixed(2)}s</p>
          </div>
          <div>
            <p style={appStyles.resultLabel}>{t("Pose longue")}</p>
            <p style={appStyles.resultValue}>{mainResult.sequence[0].shutter.display}</p>
          </div>
          <div>
            <p style={appStyles.resultLabel}>{t("Pose rapide")}</p>
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
                  ⚠️ {t("COMPLIQUÉ")}
                  {isMobile && <br />}
                  {!isMobile && ' '}
                  ({t("Durée astrophoto dépassée")})
                </p>
                <p style={{fontSize: '0.75rem', color: '#fed7aa', marginBottom: '12px'}}>
                  {t("Durée")} {mainResult.totalDuration.toFixed(2)}s {t("dépasse")} {settings.durationLimit}s
                  {isMobile && <br />}
                  {!isMobile && ' '}
                  → {t("Risque de filé d'étoiles")}
                </p>
                <button 
                  onClick={() => setSettings({...settings, durationLimit: 999})} 
                  style={appStyles.warningButton}
                >
                  🚀 {t("Désactiver limite astrophoto")}
                </button>
              </div>
            ) : (
              <div>
                <p style={appStyles.statusSuccess}>✅ {t("SÉQUENCE RÉALISABLE")}</p>
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
              <p style={appStyles.statusError}>❌ {t("IMPOSSIBLE")}</p>
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