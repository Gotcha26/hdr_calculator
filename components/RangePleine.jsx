// components/RangePleine.jsx - Section Plage entière



const RangePleine = ({ 
  section4Open,
  setSection4Open,
  rangeValues,
  setRangeValues,
  rangeResult,
  settings,
  photoDatabase,
  filterByIncrementAndLimits
}) => {
  
  return (
    <div style={{
      ...appStyles.section,
      border: '1px solid rgba(139, 92, 246, 0.3)'
    }}>
      <h2 
        onClick={() => setSection4Open(!section4Open)}
        style={{...appStyles.sectionTitle, color: '#8b5cf6'}}
      >
        <span>🎯 Plage entière</span>
        <span style={{fontSize: '1.25rem'}}>{section4Open ? '▼' : '▶'}</span>
      </h2>

      {section4Open && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={appStyles.formLabel}>Ouverture</label>
              <select 
                value={rangeValues.aperture} 
                onChange={(e) => setRangeValues({...rangeValues, aperture: parseInt(e.target.value)})} 
                style={{
                  ...appStyles.select,
                  border: '1px solid #8b5cf6'
                }}
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
              <label style={appStyles.formLabel}>ISO</label>
              <select 
                value={rangeValues.iso} 
                onChange={(e) => setRangeValues({...rangeValues, iso: parseInt(e.target.value)})} 
                style={{
                  ...appStyles.select,
                  border: '1px solid #8b5cf6'
                }}
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
              <label style={appStyles.formLabel}>Vitesse minimale</label>
              <select 
                value={rangeValues.speedMin} 
                onChange={(e) => setRangeValues({...rangeValues, speedMin: parseInt(e.target.value)})} 
                style={{
                  ...appStyles.select,
                  border: '1px solid #8b5cf6'
                }}
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
              <p style={{...appStyles.helpText, fontStyle: 'italic'}}>pose longue</p>
            </div>

            <div>
              <label style={appStyles.formLabel}>Vitesse maximale</label>
              <select 
                value={rangeValues.speedMax} 
                onChange={(e) => setRangeValues({...rangeValues, speedMax: parseInt(e.target.value)})} 
                style={{
                  ...appStyles.select,
                  border: '1px solid #8b5cf6'
                }}
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
              <p style={{...appStyles.helpText, fontStyle: 'italic'}}>pose rapide</p>
            </div>
          </div>

          {/* Résultats amplitude */}
          <div style={{
            ...appStyles.resultCard(rangeResult.errors.length > 0 ? 'error' : 'success'),
            marginBottom: '24px'
          }}>
            <div style={appStyles.resultGrid}>
              <div>
                <p style={appStyles.resultLabel}>Amplitude totale</p>
                <p style={appStyles.resultValue}>{rangeResult.totalEV.toFixed(2)} EV</p>
              </div>
              <div>
                <p style={appStyles.resultLabel}>Équivalent en crans</p>
                <p style={appStyles.resultValue}>
                  {rangeResult.totalCrans} cran{rangeResult.totalCrans > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p style={appStyles.resultLabel}>Durée séquence</p>
                <p style={appStyles.resultValue}>
                  {rangeResult.totalDuration > 0 ? `${rangeResult.totalDuration.toFixed(2)}s` : '-'}
                </p>
              </div>
            </div>

            {rangeResult.errors.length > 0 ? (
              <div>
                <p style={appStyles.statusError}>❌ CONFIGURATION INVALIDE</p>
                <ul style={appStyles.errorList}>
                  {rangeResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <p style={appStyles.statusSuccess}>✅ AMPLITUDE VALIDE</p>
              </div>
            )}
          </div>

          {/* Aide à la décision */}
          {rangeResult.errors.length === 0 && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: '#c4b5fd',
                marginBottom: '16px'
              }}>
                📊 Aide à la décision
              </h3>

              <div style={{fontSize: '0.875rem', color: '#e9d5ff', lineHeight: '1.6'}}>
                {/* Recommandation basique */}
                <div style={{marginBottom: '16px'}}>
                  <p style={{fontWeight: '600', marginBottom: '8px'}}>📋 Recommandation basique :</p>
                  <ul style={{paddingLeft: '20px', margin: '0', listStyle: 'none'}}>
                    <li style={{marginBottom: '4px'}}>
                      Vue centrée : <strong>{rangeResult.suggestions[0]}</strong>
                    </li>
                    <li style={{marginBottom: '4px'}}>
                      Séquence : <strong>{rangeResult.suggestions[1]}</strong>
                    </li>
                    <li style={{marginBottom: '4px'}}>
                      Écart type : <strong>{rangeResult.suggestions[2]}</strong>
                    </li>
                  </ul>
                </div>

                {/* Recommandations avancées */}
                {rangeResult.suggestions.length > 3 && (
                  <div>
                    <p style={{fontWeight: '600', marginBottom: '12px'}}>🎯 Optimisations possibles :</p>
                    
                    {rangeResult.suggestions.slice(3).map((sug, i) => {
                      if (typeof sug === 'object') {
                        const { type, data } = sug;
                        
                        // CAS 1
                        if (type === 'CAS_1') {
                          return (
                            <div key={i} style={{
                              marginBottom: '20px',
                              padding: '12px',
                              background: 'rgba(139, 92, 246, 0.05)',
                              borderRadius: '6px',
                              border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}>
                              <p style={{fontWeight: '700', marginBottom: '8px'}}>
                                <strong>Cas 1</strong> : Priorité ISO
                              </p>
                              {data.hasOptimization ? (
                                <>
                                  <p style={{marginBottom: '4px'}}>
                                    {data.isoFrom} → <strong>{data.isoTo}</strong>
                                  </p>
                                  <p style={{marginBottom: '4px'}}>
                                    Nombre de stops : <strong>{data.stopThird}</strong>
                                  </p>
                                  <p>
                                    Durée séquence : <strong>{data.duration.toFixed(2)}s</strong>
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p style={{marginBottom: '4px'}}>
                                    <strong>Pas</strong> d'optimisation recommandable.
                                  </p>
                                  <p style={{marginBottom: '4px'}}>
                                    Nombre de stops : <strong>0</strong>
                                  </p>
                                  <p>
                                    Durée séquence : <strong>{data.duration.toFixed(2)}s</strong>
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        }
                        
                        // CAS 2
                        if (type === 'CAS_2') {
                          return (
                            <div key={i} style={{
                              marginBottom: '20px',
                              padding: '12px',
                              background: 'rgba(139, 92, 246, 0.05)',
                              borderRadius: '6px',
                              border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}>
                              <p style={{fontWeight: '700', marginBottom: '8px'}}>
                                <strong>Cas 2</strong> : Priorité à l'ouverture
                              </p>
                              {data.hasOptimization ? (
                                <>
                                  <p style={{marginBottom: '4px'}}>
                                    {data.apertureFrom} → <strong>{data.apertureTo}</strong>
                                  </p>
                                  <p style={{marginBottom: '4px'}}>
                                    Nombre de stops : <strong>+{data.stopThird}</strong>
                                  </p>
                                  <p>
                                    Durée séquence : <strong>{data.duration.toFixed(2)}s</strong>
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p style={{marginBottom: '4px'}}>
                                    <strong>Pas</strong> d'optimisation recommandable.
                                  </p>
                                  <p style={{marginBottom: '4px'}}>
                                    Nombre de stops : <strong>0</strong>
                                  </p>
                                  <p>
                                    Durée séquence : <strong>{data.duration.toFixed(2)}s</strong>
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        }
                        
                        // CAS 3
                        if (type === 'CAS_3') {
                          return (
                            <div key={i} style={{
                              marginBottom: '20px',
                              padding: '12px',
                              background: 'rgba(139, 92, 246, 0.05)',
                              borderRadius: '6px',
                              border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}>
                              <p style={{fontWeight: '700', marginBottom: '8px'}}>
                                <strong>Cas 3</strong> : Qualité +
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                ISO → {data.isoChanged ? `${data.isoOptimal}` : `Pas de changement (${data.isoOptimal})`}
                                {data.isoChanged && <strong> {data.isoOptimal}</strong>}
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Ouverture : <strong>{data.apertureOptimal}</strong>
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Vue centrée recalculée : <strong>{data.vueCentree}</strong>
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Nombre de stops : <strong>{data.stopThird}</strong>
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Séquence : <strong>{data.brackets} images</strong>
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Écart type : <strong>{data.spacing.toFixed(2)} EV</strong>
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Pose longue : <strong>{data.poseLongue}</strong>
                              </p>
                              <p style={{marginBottom: '4px'}}>
                                Pose rapide : <strong>{data.poseRapide}</strong>
                              </p>
                              <p>
                                Durée séquence : <strong>{data.duration.toFixed(2)}s</strong>
                              </p>
                            </div>
                          );
                        }
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};