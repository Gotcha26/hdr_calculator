// components/CorrectionISO.jsx - Section Correction ISO (optimisé mobile)

const CorrectionISO = ({ 
  section2Open,
  setSection2Open,
  correction1Iso,
  setCorrection1Iso,
  correction1Result,
  mainValues,
  settings,
  setSettings,
  photoDatabase,
  getValidIsos,
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
    <div style={appStyles.sectionISO}>
      <h2 
        onClick={() => setSection2Open(!section2Open)}
        style={{...appStyles.sectionTitle, color: appStyles.titleISO}}
      >
        <span>🔶 {t("Correction ISO")}</span>
        <span style={{fontSize: '1.25rem'}}>{section2Open ? '▼' : '▶'}</span>
      </h2>

      {section2Open && (
        <div>
          <div style={{marginBottom: '24px'}}>
            <label style={appStyles.formLabel}>{t("Nouveau ISO")}</label>
            <select 
              value={correction1Iso} 
              onChange={(e) => setCorrection1Iso(parseInt(e.target.value))} 
              style={appStyles.selectISO}
            >
              {getValidIsos().map((iso) => (
                <option key={iso.stop_sixth} value={photoDatabase.iso_values.values.indexOf(iso)}>
                  {iso.display}
                </option>
              ))}
            </select>
            <p style={appStyles.helpText}>
              {t("Ouverture fixe")} : {photoDatabase.aperture_values.values[mainValues.aperture].display}
            </p>
          </div>

          <div style={appStyles.resultCard(
            correction1Result.errors.length > 0 ? 'error' : 'success'
          )}>
            <div style={appStyles.resultGrid}>
              <div>
                <p style={appStyles.resultLabel}>{t("Pose longue")}</p>
                <p style={appStyles.resultValue}>
                  {correction1Result.sequence[0]?.shutter?.display || '-'}
                </p>
              </div>
              <div>
                <p style={appStyles.resultLabel}>{t("Pose rapide")}</p>
                <p style={appStyles.resultValue}>
                  {correction1Result.sequence[correction1Result.sequence.length - 1]?.shutter?.display || '-'}
                </p>
              </div>
            </div>

            <div>
              {correction1Result.errors.length === 0 ? (
                <div>
                  <p style={appStyles.statusSuccess}>✅ {t("SÉQUENCE RÉALISABLE")}</p>
                  {correction1Result.suggestions.length > 0 && (
                    <ul style={appStyles.suggestionList}>
                      {correction1Result.suggestions.map((sug, i) => 
                        renderSuggestion(sug, i, setSettings, settings, isMobile)
                      )}
                    </ul>
                  )}
                </div>
              ) : (
                <div>
                  <p style={appStyles.statusError}>❌ {t("IMPOSSIBLE")}</p>
                  <ul style={appStyles.errorList}>
                    {correction1Result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {correction1Result.suggestions.map((sug, i) => (
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