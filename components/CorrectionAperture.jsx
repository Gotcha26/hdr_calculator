// components/CorrectionAperture.jsx - Section Correction Ouverture (optimisé mobile)

const CorrectionAperture = ({ 
  section3Open,
  setSection3Open,
  correction2Aperture,
  setCorrection2Aperture,
  correction2Result,
  mainValues,
  settings,
  setSettings,
  photoDatabase,
  getValidApertures,
  renderSuggestion
}) => {
  
  // Détection mobile
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={{...appStyles.sectionAperture, marginBottom: '24px'}}>
      <h2 
        onClick={() => setSection3Open(!section3Open)}
        style={{...appStyles.sectionTitle, color: appStyles.titleAperture}}
      >
        <span>🟣 {t("Correction Ouverture")}</span>
        <span style={{fontSize: '1.25rem'}}>{section3Open ? '▼' : '▶'}</span>
      </h2>

      {section3Open && (
        <div>
          <div style={{marginBottom: '24px'}}>
            <label style={appStyles.formLabel}>{t("Nouvelle Ouverture")}</label>
            <select 
              value={correction2Aperture} 
              onChange={(e) => setCorrection2Aperture(parseInt(e.target.value))} 
              style={appStyles.selectAperture}
            >
              {getValidApertures().map((aperture) => (
                <option key={aperture.stop_sixth} value={photoDatabase.aperture_values.values.indexOf(aperture)}>
                  {aperture.display}
                </option>
              ))}
            </select>
            <p style={appStyles.helpText}>
              {t("ISO fixe")} : {photoDatabase.iso_values.values[mainValues.iso].display}
            </p>
          </div>

          <div style={appStyles.resultCard(
            correction2Result.errors.length > 0 ? 'error' : 'success'
          )}>
            <div style={appStyles.resultGrid}>
              <div>
                <p style={appStyles.resultLabel}>{t("Pose longue")}</p>
                <p style={appStyles.resultValue}>
                  {correction2Result.sequence[0]?.shutter?.display || '-'}
                </p>
              </div>
              <div>
                <p style={appStyles.resultLabel}>{t("Pose rapide")}</p>
                <p style={appStyles.resultValue}>
                  {correction2Result.sequence[correction2Result.sequence.length - 1]?.shutter?.display || '-'}
                </p>
              </div>
            </div>

            <div>
              {correction2Result.errors.length === 0 ? (
                <div>
                  <p style={appStyles.statusSuccess}>✅ {t("SÉQUENCE RÉALISABLE")}</p>
                  {correction2Result.suggestions.length > 0 && (
                    <ul style={appStyles.suggestionList}>
                      {correction2Result.suggestions.map((sug, i) => 
                        renderSuggestion(sug, i, setSettings, settings, isMobile)
                      )}
                    </ul>
                  )}
                </div>
              ) : (
                <div>
                  <p style={appStyles.statusError}>❌ {t("IMPOSSIBLE")}</p>
                  <ul style={appStyles.errorList}>
                    {correction2Result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {correction2Result.suggestions.map((sug, i) => (
                      <li key={i + 1000}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};