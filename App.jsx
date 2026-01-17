const { useState } = React;

const HDRCalculator = () => {
  const [currentPage, setCurrentPage] = useState('calculator');
  const [menuOpen, setMenuOpen] = useState(false);
  const [section2Open, setSection2Open] = useState(false);
  const [section3Open, setSection3Open] = useState(false);
  
  // Paramètres
  const [settings, setSettings] = useState({
    cameraType: 'reflex_mechanical',
    increment: '1:3',
    isoMin: 3,
    isoMax: 21,
    speedMin: 3,
    speedMax: 57,
    apertureMin: 9,
    apertureMax: 27,
    sensorDynamicRange: 15,
    durationLimit: 2.5
  });

  // Valeurs principales
  const [mainValues, setMainValues] = useState({
    aperture: 9, // f/2.8
    shutter: 34, // 1/40
    iso: 9, // 400
    brackets: 7,
    spacing: 2
  });

  const [correction1Iso, setCorrection1Iso] = useState(12); // 800
  const [correction2Aperture, setCorrection2Aperture] = useState(9); // f/2.8

  // Calcul séquence HDR
  const calculateHDRSequence = (centerShutterIndex, centerApertureIndex, centerIsoIndex, brackets, spacing, skipSuggestions = false) => {
    const halfBrackets = Math.floor(brackets / 2);
    const sequence = [];
    const errors = [];
    const suggestions = [];
    
    const cameraData = cameraTypes[settings.cameraType];
    const minTimePerShot = cameraData.minTime + cameraData.bufferDelay;
    
    let totalDuration = 0;
    let speedErrors = { min: null, max: null };
    
    for (let i = -halfBrackets; i <= halfBrackets; i++) {
      const evShift = i * spacing;
      const targetStopThird = photoDatabase.shutter_speeds.values[centerShutterIndex].stop_third + (evShift * 3);
      
      let closestShutter = photoDatabase.shutter_speeds.values.reduce((prev, curr) => 
        Math.abs(curr.stop_third - targetStopThird) < Math.abs(prev.stop_third - targetStopThird) ? curr : prev
      );
      
      const minSpeed = photoDatabase.shutter_speeds.values[settings.speedMin];
      const maxSpeed = photoDatabase.shutter_speeds.values[settings.speedMax];
      
      // Vérifier si targetStopThird dépasse les limites AVANT de chercher closestShutter
      if (targetStopThird < minSpeed.stop_third) {
        speedErrors.min = { speed: closestShutter.display, limit: minSpeed.display };
      }
      
      if (targetStopThird > maxSpeed.stop_third) {
        speedErrors.max = { speed: closestShutter.display, limit: maxSpeed.display };
      }
      
      const shotDuration = Math.max(closestShutter.numeric, minTimePerShot);
      totalDuration += shotDuration;
      
      sequence.push({
        ev: evShift,
        shutter: closestShutter,
        duration: shotDuration
      });
    }
    
    if (speedErrors.min) {
      errors.push(`Vitesse ${speedErrors.min.speed} trop lente (limite: ${speedErrors.min.limit})`);
    }
    if (speedErrors.max) {
      errors.push(`Vitesse ${speedErrors.max.speed} trop rapide (limite: ${speedErrors.max.limit})`);
    }
    
    const durationExceeded = settings.durationLimit < 100 && totalDuration > settings.durationLimit;
    const durationWarning = durationExceeded;
    
    const totalDynamicRange = (brackets - 1) * spacing;
    if (totalDynamicRange > settings.sensorDynamicRange) {
      errors.push(`Plage dynamique ${totalDynamicRange} EV dépasse capacité capteur (${settings.sensorDynamicRange} EV)`);
    }
    
    // Suggestions si réalisable et pas de warning
    if (errors.length === 0 && !skipSuggestions && !durationWarning) {
      const minIso = photoDatabase.iso_values.values[settings.isoMin];
      const currentIso = photoDatabase.iso_values.values[centerIsoIndex];
      
      if (currentIso.stop_third > minIso.stop_third) {
        const testIsoIndex = settings.isoMin;
        const isoShift = currentIso.stop_third - minIso.stop_third;
        const testShutterIndex = centerShutterIndex - isoShift;
        
        const testResult = calculateHDRSequence(testShutterIndex, centerApertureIndex, testIsoIndex, brackets, spacing, true);
        
        if (testResult.errors.length === 0 && !testResult.durationWarning) {
          suggestions.push(`💡 Qualité optimale possible: baissez l'ISO à ${minIso.display}`);
        }
      }
      
      if (settings.durationLimit < 100) {
        const marginTime = settings.durationLimit - totalDuration;
        if (marginTime > 0.5) {
          suggestions.push(`✓ Marge temporelle: ${marginTime.toFixed(2)}s disponibles`);
        }
      }
    }
    
    return { sequence, totalDuration, errors, suggestions, speedErrors, durationExceeded, durationWarning };
  };

  // Calcul Correction #1 (ISO)
  const calculateCorrection1 = () => {
    const isoShift = photoDatabase.iso_values.values[correction1Iso].stop_third - 
                     photoDatabase.iso_values.values[mainValues.iso].stop_third;
    
    const adjustedShutterIndex = mainValues.shutter + isoShift;
    
    const result = calculateHDRSequence(
      adjustedShutterIndex,
      mainValues.aperture,
      correction1Iso,
      mainValues.brackets,
      mainValues.spacing,
      true
    );
    
    const specificSuggestions = [];
    const currentIso = photoDatabase.iso_values.values[correction1Iso];
    const minIso = photoDatabase.iso_values.values[settings.isoMin];
    
    if (result.errors.length > 0) {
      specificSuggestions.push(`❌ Réglage impossible avec les limites techniques actuelles`);
      
      if (result.speedErrors.max) {
        specificSuggestions.push(`→ Vitesse trop rapide : augmentez l'ISO`);
      }
      if (result.speedErrors.min) {
        specificSuggestions.push(`→ Vitesse trop lente : diminuez l'ISO`);
      }
    } else {
      if (currentIso.stop_third > minIso.stop_third) {
        let bestIsoIndex = correction1Iso;
        let bestIso = currentIso;
        let bestIsoExceedsAstro = result.durationWarning;
        
        const filteredIsos = filterByIncrementAndLimits(
          photoDatabase.iso_values.values,
          settings.increment,
          settings.isoMin,
          settings.isoMax
        );
        
        const currentIndexInFiltered = filteredIsos.indexOf(currentIso);
        
        for (let i = currentIndexInFiltered - 1; i >= 0; i--) {
          const testIso = filteredIsos[i];
          const testIsoIndex = photoDatabase.iso_values.values.indexOf(testIso);
          const testIsoShift = testIso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
          const testShutterIndex = mainValues.shutter + testIsoShift;
          
          const testResult = calculateHDRSequence(
            testShutterIndex,
            mainValues.aperture,
            testIsoIndex,
            mainValues.brackets,
            mainValues.spacing,
            true
          );
          
          if (testResult.errors.length === 0) {
            bestIsoIndex = testIsoIndex;
            bestIso = testIso;
            bestIsoExceedsAstro = testResult.durationWarning;
          } else {
            break;
          }
        }
        
        if (bestIsoIndex !== correction1Iso) {
          const cransDiff = Math.abs(currentIndexInFiltered - filteredIsos.indexOf(bestIso));
          
          // Recalculer pour obtenir la durée du réglage optimal
          const bestIsoShift = bestIso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
          const bestShutterIndex = mainValues.shutter + bestIsoShift;
          const bestResult = calculateHDRSequence(
            bestShutterIndex,
            mainValues.aperture,
            photoDatabase.iso_values.values.indexOf(bestIso),
            mainValues.brackets,
            mainValues.spacing,
            true
          );
          
          // 1. Durée actuelle + statut sur 2 lignes
          specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
          if (result.durationWarning) {
            specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
          } else {
            specificSuggestions.push(`✅ Durée compatible astrophoto`);
          }
          
          // 2. Paramètre optimum
          specificSuggestions.push(`💡 Optimum technique : ISO ${bestIso.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''} plus bas)`);
          
          // 3. Durée optimale
          const optimalDurationStatus = bestResult.durationWarning ? '⚠️ Dépasse limite' : '✅ Compatible';
          specificSuggestions.push(`🎯 Durée optimale : ${bestResult.totalDuration.toFixed(2)}s - ${optimalDurationStatus}`);
          
        } else if (bestIso.stop_third > minIso.stop_third) {
          specificSuggestions.push(`⏱️ Durée : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
          if (result.durationWarning) {
            specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
          } else {
            specificSuggestions.push(`✅ Durée compatible astrophoto`);
          }
          specificSuggestions.push(`⚠️ Limite technique atteinte`);
        } else {
          specificSuggestions.push(`⏱️ Durée : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
          if (result.durationWarning) {
            specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
          } else {
            specificSuggestions.push(`✅ Durée compatible astrophoto`);
          }
          specificSuggestions.push(`✅ ISO minimal atteint : qualité optimale`);
        }
      } else {
        specificSuggestions.push(`⏱️ Durée : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
        if (result.durationWarning) {
          specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
        } else {
          specificSuggestions.push(`✅ Durée compatible astrophoto`);
        }
        specificSuggestions.push(`✅ ISO minimal atteint : qualité optimale`);
      }
    }
    
    return { ...result, suggestions: specificSuggestions, canToggleAstroLimit: result.durationWarning };
  };

  // Calcul Correction #2 (Ouverture)
  const calculateCorrection2 = () => {
    const apertureShift = photoDatabase.aperture_values.values[correction2Aperture].stop_third - 
                          photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
    
    const adjustedShutterIndex = mainValues.shutter - apertureShift;
    
    const result = calculateHDRSequence(
      adjustedShutterIndex,
      correction2Aperture,
      mainValues.iso,
      mainValues.brackets,
      mainValues.spacing,
      true
    );
    
    const specificSuggestions = [];
    const currentAperture = photoDatabase.aperture_values.values[correction2Aperture];
    const minAperture = photoDatabase.aperture_values.values[settings.apertureMin];
    const maxAperture = photoDatabase.aperture_values.values[settings.apertureMax];
    
    if (result.errors.length > 0) {
      specificSuggestions.push(`❌ Réglage impossible avec les limites techniques actuelles`);
      
      if (result.speedErrors.max) {
        specificSuggestions.push(`→ Vitesse trop rapide : fermez le diaphragme (augmentez f/)`);
        if (currentAperture.stop_third >= maxAperture.stop_third) {
          specificSuggestions.push(`🎯 Objectif au maximum (${maxAperture.display}) → Filtres ND`);
        }
      }
      if (result.speedErrors.min) {
        specificSuggestions.push(`→ Vitesse trop lente : ouvrez le diaphragme (diminuez f/)`);
        if (currentAperture.stop_third <= minAperture.stop_third) {
          specificSuggestions.push(`🎯 Objectif au maximum (${minAperture.display}) → Objectif plus lumineux (f/1.4, f/1.8)`);
        }
      }
    } else {
      const filteredApertures = filterByIncrementAndLimits(
        photoDatabase.aperture_values.values,
        settings.increment,
        settings.apertureMin,
        settings.apertureMax
      );
      
      const currentIndexInFiltered = filteredApertures.indexOf(currentAperture);
      
      // Recherche de l'ouverture optimale (f/5.6 à f/8) techniquement réalisable
      let bestAperture = null;
      let bestApertureIndex = -1;
      let bestDuration = result.totalDuration;
      let cransDiff = 0;
      
      // Chercher dans la zone optimale f/5.6 - f/8
      for (let i = 0; i < filteredApertures.length; i++) {
        const testAperture = filteredApertures[i];
        if (testAperture.numeric >= 5.6 && testAperture.numeric <= 8) {
          const testApertureIndex = photoDatabase.aperture_values.values.indexOf(testAperture);
          const testApertureShift = testAperture.stop_third - photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
          const testShutterIndex = mainValues.shutter - testApertureShift;
          
          const testResult = calculateHDRSequence(
            testShutterIndex,
            testApertureIndex,
            mainValues.iso,
            mainValues.brackets,
            mainValues.spacing,
            true
          );
          
          if (testResult.errors.length === 0 && !testResult.durationWarning) {
            bestAperture = testAperture;
            bestApertureIndex = testApertureIndex;
            bestDuration = testResult.totalDuration;
            cransDiff = Math.abs(i - currentIndexInFiltered);
            break;
          }
        }
      }
      
      // 1. Durée actuelle + statut sur 2 lignes
      specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
      if (result.durationWarning) {
        specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
      } else {
        specificSuggestions.push(`✅ Durée compatible astrophoto`);
      }
      
      // 2. Paramètre optimum (si trouvé)
      if (bestAperture && bestApertureIndex !== correction2Aperture) {
        specificSuggestions.push(`💡 Optimum technique : ${bestAperture.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''})`);
        
        // 3. Durée optimale
        const optimalDurationStatus = bestDuration <= settings.durationLimit || settings.durationLimit >= 100 ? '✅ Compatible' : '⚠️ Dépasse limite';
        specificSuggestions.push(`🎯 Durée optimale : ${bestDuration.toFixed(2)}s - ${optimalDurationStatus}`);
      } else {
        // Pas d'optimum trouvé - afficher statut qualité optique
        if (currentAperture.numeric >= 5.6 && currentAperture.numeric <= 11) {
          specificSuggestions.push(`✅ Zone de netteté optimale atteinte`);
        } else if (currentAperture.numeric < 2.8) {
          specificSuggestions.push(`⚠️ Ouverture très large : profondeur de champ limitée`);
        } else if (currentAperture.numeric > 16) {
          specificSuggestions.push(`⚠️ Ouverture très fermée : attention à la diffraction`);
        }
      }
    }
    
    return { ...result, suggestions: specificSuggestions, canToggleAstroLimit: result.durationWarning };
  };

  const mainResult = calculateHDRSequence(
    mainValues.shutter,
    mainValues.aperture,
    mainValues.iso,
    mainValues.brackets,
    mainValues.spacing
  );

  const correction1Result = calculateCorrection1();
  const correction2Result = calculateCorrection2();

  // Filtrer les ISO valides pour Section 2 (éviter les valeurs qui sortent des limites techniques)
  const getValidIsos = () => {
    const allIsos = filterByIncrementAndLimits(
      photoDatabase.iso_values.values,
      settings.increment,
      settings.isoMin,
      settings.isoMax
    );
    
    return allIsos.filter(iso => {
      const isoIndex = photoDatabase.iso_values.values.indexOf(iso);
      const isoShift = iso.stop_third - photoDatabase.iso_values.values[mainValues.iso].stop_third;
      const adjustedShutterIndex = mainValues.shutter + isoShift;
      
      const testResult = calculateHDRSequence(
        adjustedShutterIndex,
        mainValues.aperture,
        isoIndex,
        mainValues.brackets,
        mainValues.spacing,
        true
      );
      
      return testResult.errors.length === 0;
    });
  };

  // Filtrer les ouvertures valides pour Section 3
  const getValidApertures = () => {
    const allApertures = filterByIncrementAndLimits(
      photoDatabase.aperture_values.values,
      settings.increment,
      settings.apertureMin,
      settings.apertureMax
    );
    
    return allApertures.filter(aperture => {
      const apertureIndex = photoDatabase.aperture_values.values.indexOf(aperture);
      const apertureShift = aperture.stop_third - photoDatabase.aperture_values.values[mainValues.aperture].stop_third;
      const adjustedShutterIndex = mainValues.shutter - apertureShift;
      
      const testResult = calculateHDRSequence(
        adjustedShutterIndex,
        apertureIndex,
        mainValues.iso,
        mainValues.brackets,
        mainValues.spacing,
        true
      );
      
      return testResult.errors.length === 0;
    });
  };

  // Fonction pour rendre les suggestions avec lien cliquable uniquement sur "(désactiver)"
  const renderSuggestion = (sug, index) => {
    // Chercher si la suggestion contient "Limite astrophoto dépassée"
    if (sug.includes('Limite astrophoto dépassée')) {
      return (
        <li key={index}>
          ⚠️ Limite astrophoto dépassée{' '}
          <span 
            onClick={() => setSettings({...settings, durationLimit: 999})}
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              color: '#fbbf24'
            }}
          >
            (désactiver)
          </span>
        </li>
      );
    }
    return <li key={index}>{sug}</li>;
  };

  // Styles CSS inline
  const styles = {
    menuOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 998,
      display: menuOpen ? 'block' : 'none'
    },
    menuSidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '85%',
      maxWidth: '320px',
      background: 'linear-gradient(180deg, rgb(30, 41, 59), rgb(15, 23, 42))',
      zIndex: 999,
      transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      overflowY: 'auto',
      boxShadow: '4px 0 12px rgba(0,0,0,0.5)'
    },
    menuItem: {
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', color: 'white'}}>
      {/* Menu overlay */}
      {menuOpen && <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)} />}

      {/* Menu sidebar */}
      <div style={styles.menuSidebar}>
        <div style={{padding: '24px', borderBottom: '1px solid #475569'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            HDR Calculator
          </h2>
          <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px'}}>v1.0 Complète</p>
        </div>
        
        <div style={{...styles.menuItem, background: currentPage === 'calculator' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}} onClick={() => { setCurrentPage('calculator'); setMenuOpen(false); }}>
          <span style={{fontSize: '1.25rem'}}>📷</span>
          <span>Calcul HDR</span>
        </div>
        
        <div style={{...styles.menuItem, background: currentPage === 'settings' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}} onClick={() => { setCurrentPage('settings'); setMenuOpen(false); }}>
          <span style={{fontSize: '1.25rem'}}>⚙️</span>
          <span>Paramètres</span>
        </div>
        
        <div style={styles.menuItem} onClick={() => window.open('#faq', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>❓</span>
          <span>FAQ</span>
        </div>
        
        <div style={styles.menuItem} onClick={() => window.open('#github', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>🔗</span>
          <span>GitHub</span>
        </div>
        
        <div style={styles.menuItem} onClick={() => window.open('#support', '_blank')}>
          <span style={{fontSize: '1.25rem'}}>❤️</span>
          <span>Me soutenir</span>
        </div>
      </div>

      {/* Header */}
      <div style={{background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #475569', position: 'sticky', top: 0, zIndex: 50}}>
        <div style={{maxWidth: '1280px', margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px'}}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
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

      {/* Content */}
      <div style={{padding: '24px'}}>
        <div style={{maxWidth: '1280px', margin: '0 auto'}}>
          {currentPage === 'calculator' ? (
            <div>
              {/* Vue centrée */}
              <div style={{background: 'rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)', marginBottom: '24px'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#22d3ee'}}>
                  📷 Vue centrée
                </h2>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Ouverture</label>
                    <select value={mainValues.aperture} onChange={(e) => setMainValues({...mainValues, aperture: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                      {filterByIncrementAndLimits(photoDatabase.aperture_values.values, settings.increment, settings.apertureMin, settings.apertureMax).map((aperture) => (
                        <option key={aperture.stop_third} value={photoDatabase.aperture_values.values.indexOf(aperture)}>{aperture.display}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Vitesse</label>
                    <select value={mainValues.shutter} onChange={(e) => setMainValues({...mainValues, shutter: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                      {filterByIncrementAndLimits(photoDatabase.shutter_speeds.values, settings.increment, settings.speedMin, settings.speedMax).map((speed) => (
                        <option key={speed.stop_third} value={photoDatabase.shutter_speeds.values.indexOf(speed)}>{speed.display}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>ISO</label>
                    <select value={mainValues.iso} onChange={(e) => setMainValues({...mainValues, iso: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                      {filterByIncrementAndLimits(photoDatabase.iso_values.values, settings.increment, settings.isoMin, settings.isoMax).map((iso) => (
                        <option key={iso.stop_third} value={photoDatabase.iso_values.values.indexOf(iso)}>{iso.display}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Brackets</label>
                    <select value={mainValues.brackets} onChange={(e) => setMainValues({...mainValues, brackets: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                      {[3, 5, 7, 9].map(n => <option key={n} value={n}>{n} images</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Espacement</label>
                    <select value={mainValues.spacing} onChange={(e) => setMainValues({...mainValues, spacing: parseFloat(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                      {getSpacingOptions(settings.increment).map(val => <option key={val} value={val}>{val.toFixed(2)} EV</option>)}
                    </select>
                  </div>
                </div>

                {/* Résultats Vue centrée */}
                <div style={{padding: '16px', borderRadius: '8px', background: mainResult.errors.length === 0 ? (mainResult.durationWarning ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.05))' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))') : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: `1px solid ${mainResult.errors.length === 0 ? (mainResult.durationWarning ? 'rgba(251, 146, 60, 0.3)' : 'rgba(34, 197, 94, 0.3)') : 'rgba(239, 68, 68, 0.3)'}`}}>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px'}}>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Plage dynamique</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{((mainValues.brackets - 1) * mainValues.spacing).toFixed(2)} EV</p></div>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Durée totale</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{mainResult.totalDuration.toFixed(2)}s</p></div>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Pose longue</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{mainResult.sequence[0].shutter.display}</p></div>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Pose rapide</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{mainResult.sequence[mainResult.sequence.length - 1].shutter.display}</p></div>
                  </div>

                  <div>
                    {mainResult.errors.length === 0 ? (
                      mainResult.durationWarning ? (
                        <div>
                          <p style={{fontWeight: '600', color: '#fb923c', marginBottom: '8px'}}>⚠️ COMPLIQUÉ (Durée astrophoto dépassée)</p>
                          <p style={{fontSize: '0.75rem', color: '#fed7aa', marginBottom: '12px'}}>
                            Durée {mainResult.totalDuration.toFixed(2)}s dépasse {settings.durationLimit}s → Risque de filé d'étoiles
                          </p>
                          <button onClick={() => setSettings({...settings, durationLimit: 999})} style={{padding: '8px 16px', fontSize: '0.75rem', background: 'rgba(251, 146, 60, 0.2)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '6px', color: 'white', cursor: 'pointer'}}>🚀 Désactiver limite astrophoto</button>
                        </div>
                      ) : (
                        <div>
                          <p style={{fontWeight: '600', color: '#22c55e', marginBottom: '8px'}}>✅ SÉQUENCE RÉALISABLE</p>
                          {mainResult.suggestions.length > 0 && (
                            <ul style={{fontSize: '0.75rem', color: '#86efac', paddingLeft: '20px'}}>
                              {mainResult.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                            </ul>
                          )}
                        </div>
                      )
                    ) : (
                      <div>
                        <p style={{fontWeight: '600', color: '#ef4444', marginBottom: '8px'}}>❌ IMPOSSIBLE</p>
                        <ul style={{fontSize: '0.75rem', color: '#fca5a5', paddingLeft: '20px'}}>
                          {mainResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Correction ISO */}
              <div style={{background: 'rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)', marginBottom: '24px'}}>
                <h2 
                  onClick={() => setSection2Open(!section2Open)}
                  style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none'}}
                >
                  <span>🔶 Correction ISO</span>
                  <span style={{fontSize: '1.25rem'}}>{section2Open ? '▼' : '▶'}</span>
                </h2>

                {section2Open && (
                <div>
                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Nouveau ISO</label>
                  <select value={correction1Iso} onChange={(e) => setCorrection1Iso(parseInt(e.target.value))} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(251, 191, 36)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                    {getValidIsos().map((iso) => (
                      <option key={iso.stop_third} value={photoDatabase.iso_values.values.indexOf(iso)}>{iso.display}</option>
                    ))}
                  </select>
                  <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px'}}>Ouverture fixe : {photoDatabase.aperture_values.values[mainValues.aperture].display}</p>
                </div>

                <div style={{padding: '16px', borderRadius: '8px', background: correction1Result.errors.length === 0 ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: `1px solid ${correction1Result.errors.length === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`}}>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px'}}>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Pose longue</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{correction1Result.sequence[0].shutter.display}</p></div>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Pose rapide</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{correction1Result.sequence[correction1Result.sequence.length - 1].shutter.display}</p></div>
                  </div>

                  <div>
                    {correction1Result.errors.length === 0 ? (
                      <div>
                        <p style={{fontWeight: '600', color: '#22c55e', marginBottom: '8px'}}>✅ SÉQUENCE RÉALISABLE</p>
                        {correction1Result.suggestions.length > 0 && (
                          <ul style={{fontSize: '0.75rem', color: '#86efac', paddingLeft: '20px', marginBottom: '12px'}}>
                            {correction1Result.suggestions.map((sug, i) => renderSuggestion(sug, i))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p style={{fontWeight: '600', color: '#ef4444', marginBottom: '8px'}}>❌ IMPOSSIBLE</p>
                        <ul style={{fontSize: '0.75rem', color: '#fca5a5', paddingLeft: '20px'}}>
                          {correction1Result.errors.map((err, i) => <li key={i}>{err}</li>)}
                          {correction1Result.suggestions.map((sug, i) => <li key={i + 1000}>{sug}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                )}
              </div>

              {/* Correction Ouverture */}
              <div style={{background: 'rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)'}}>
                <h2 
                  onClick={() => setSection3Open(!section3Open)}
                  style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none'}}
                >
                  <span>🟣 Correction Ouverture</span>
                  <span style={{fontSize: '1.25rem'}}>{section3Open ? '▼' : '▶'}</span>
                </h2>

                {section3Open && (
                <div>
                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Nouvelle Ouverture</label>
                  <select value={correction2Aperture} onChange={(e) => setCorrection2Aperture(parseInt(e.target.value))} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(168, 85, 247)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                    {getValidApertures().map((aperture) => (
                      <option key={aperture.stop_third} value={photoDatabase.aperture_values.values.indexOf(aperture)}>{aperture.display}</option>
                    ))}
                  </select>
                  <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px'}}>ISO fixe : {photoDatabase.iso_values.values[mainValues.iso].display}</p>
                </div>

                <div style={{padding: '16px', borderRadius: '8px', background: correction2Result.errors.length === 0 ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: `1px solid ${correction2Result.errors.length === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`}}>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px'}}>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Pose longue</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{correction2Result.sequence[0].shutter.display}</p></div>
                    <div><p style={{fontSize: '0.75rem', color: '#94a3b8'}}>Pose rapide</p><p style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{correction2Result.sequence[correction2Result.sequence.length - 1].shutter.display}</p></div>
                  </div>

                  <div>
                    {correction2Result.errors.length === 0 ? (
                      <div>
                        <p style={{fontWeight: '600', color: '#22c55e', marginBottom: '8px'}}>✅ SÉQUENCE RÉALISABLE</p>
                        {correction2Result.suggestions.length > 0 && (
                          <ul style={{fontSize: '0.75rem', color: '#86efac', paddingLeft: '20px', marginBottom: '12px'}}>
                            {correction2Result.suggestions.map((sug, i) => renderSuggestion(sug, i))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p style={{fontWeight: '600', color: '#ef4444', marginBottom: '8px'}}>❌ IMPOSSIBLE</p>
                        <ul style={{fontSize: '0.75rem', color: '#fca5a5', paddingLeft: '20px'}}>
                          {correction2Result.errors.map((err, i) => <li key={i}>{err}</li>)}
                          {correction2Result.suggestions.map((sug, i) => <li key={i + 1000}>{sug}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                )}
              </div>
            </div>
          ) : (
            // PAGE PARAMÈTRES
            <div style={{background: 'rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span>⚙️</span> Configuration matériel
              </h2>
              
              {/* SECTION TECHNIQUE */}
              <div style={{marginBottom: '32px'}}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#22d3ee'}}>⚙️ Technique</h3>
                
                <div style={{marginBottom: '24px'}}>
                  <h4 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1'}}>Boîtier</h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Type de boîtier</label>
                      <select value={settings.cameraType} onChange={(e) => setSettings({...settings, cameraType: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {Object.entries(cameraTypes).map(([key, data]) => (
                          <option key={key} value={key}>{data.name}</option>
                        ))}
                      </select>
                      <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '8px'}}>
                        Temps mini/photo : {(cameraTypes[settings.cameraType].minTime + cameraTypes[settings.cameraType].bufferDelay).toFixed(3)}s
                      </p>
                    </div>

                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Plage dynamique capteur</label>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <button onClick={() => setSettings({...settings, sensorDynamicRange: Math.max(8, settings.sensorDynamicRange - 1)})} style={{padding: '8px 16px', background: '#475569', border: 'none', borderRadius: '6px', color: 'white', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer'}}>−</button>
                        <input type="number" value={settings.sensorDynamicRange} onChange={(e) => setSettings({...settings, sensorDynamicRange: parseInt(e.target.value) || 15})} min="8" max="20" style={{flex: 1, textAlign: 'center', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}} />
                        <button onClick={() => setSettings({...settings, sensorDynamicRange: Math.min(20, settings.sensorDynamicRange + 1)})} style={{padding: '8px 16px', background: '#475569', border: 'none', borderRadius: '6px', color: 'white', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer'}}>+</button>
                        <span style={{fontSize: '0.875rem', color: '#94a3b8'}}>EV</span>
                      </div>
                      <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '8px'}}>Capacité du capteur (8-20 EV, défaut: 15 EV)</p>
                    </div>

                    <div style={{gridColumn: '1 / -1'}}>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Paliers IL (incréments)</label>
                      <select value={settings.increment} onChange={(e) => setSettings({...settings, increment: e.target.value})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        <option value="1:1">1:1 (stops entiers)</option>
                        <option value="1:2">1:2 (demi-stops)</option>
                        <option value="1:3">1:3 (tiers de stops)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>ISO Minimum</label>
                      <select value={settings.isoMin} onChange={(e) => setSettings({...settings, isoMin: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {photoDatabase.iso_values.values.map((iso, idx) => <option key={idx} value={idx}>{iso.display}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>ISO Maximum</label>
                      <select value={settings.isoMax} onChange={(e) => setSettings({...settings, isoMax: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {photoDatabase.iso_values.values.map((iso, idx) => <option key={idx} value={idx}>{iso.display}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Vitesse Minimum (pose longue)</label>
                      <select value={settings.speedMin} onChange={(e) => setSettings({...settings, speedMin: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {photoDatabase.shutter_speeds.values.slice(0, 30).map((speed, idx) => <option key={idx} value={idx}>{speed.display}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Vitesse Maximum (pose rapide)</label>
                      <select value={settings.speedMax} onChange={(e) => setSettings({...settings, speedMax: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {photoDatabase.shutter_speeds.values.slice(30).map((speed, idx) => <option key={idx} value={idx + 30}>{speed.display}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1'}}>Objectif</h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Ouverture maximale (la plus lumineuse)</label>
                      <select value={settings.apertureMin} onChange={(e) => setSettings({...settings, apertureMin: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {photoDatabase.aperture_values.values.map((aperture, idx) => <option key={idx} value={idx}>{aperture.display}</option>)}
                      </select>
                      <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>Plus petit nombre f/ = plus lumineux</p>
                    </div>

                    <div>
                      <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>Ouverture minimale (fermée)</label>
                      <select value={settings.apertureMax} onChange={(e) => setSettings({...settings, apertureMax: parseInt(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                        {photoDatabase.aperture_values.values.map((aperture, idx) => <option key={idx} value={idx}>{aperture.display}</option>)}
                      </select>
                      <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>Plus grand nombre f/ = moins lumineux</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION ARTISTIQUE */}
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#a855f7'}}>🎨 Artistique</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px'}}>
                      Limite de durée séquence (astrophotographie)
                    </label>
                    <select value={settings.durationLimit} onChange={(e) => setSettings({...settings, durationLimit: parseFloat(e.target.value)})} style={{width: '100%', padding: '12px', background: 'rgb(30, 41, 59)', border: '1px solid rgb(71, 85, 105)', borderRadius: '8px', color: 'white', fontSize: '16px'}}>
                      <option value={999}>Aucune limite</option>
                      {Array.from({length: 16}, (_, i) => (1.5 + i * 0.1)).map(val => (
                        <option key={val} value={val}>{val.toFixed(1)}s</option>
                      ))}
                    </select>
                    <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '8px'}}>Pour éviter le filé d'étoiles</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setCurrentPage('calculator')} style={{width: '100%', marginTop: '32px', padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '16px'}}>
                ← Retour au calcul
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid #475569', marginTop: '48px'}}>
        <div style={{maxWidth: '1280px', margin: '0 auto', padding: '32px 24px'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', fontSize: '0.875rem'}}>
            <div>
              <h3 style={{fontWeight: 'bold', color: '#22d3ee', marginBottom: '8px'}}>HDR Calculator</h3>
              <p style={{color: '#94a3b8', fontSize: '0.75rem'}}>
                Outil professionnel pour le calcul de séquences HDR en photographie.
              </p>
            </div>
            
            <div>
              <h3 style={{fontWeight: 'bold', color: '#22d3ee', marginBottom: '8px'}}>Liens</h3>
              <ul style={{listStyle: 'none', padding: 0, fontSize: '0.75rem', color: '#94a3b8'}}>
                <li style={{marginBottom: '4px'}}><a href="#faq" style={{color: '#94a3b8', textDecoration: 'none'}}>FAQ</a></li>
                <li style={{marginBottom: '4px'}}><a href="#github" style={{color: '#94a3b8', textDecoration: 'none'}}>GitHub</a></li>
                <li><a href="#support" style={{color: '#94a3b8', textDecoration: 'none'}}>Soutenir le projet</a></li>
              </ul>
            </div>
            
            <div>
              <h3 style={{fontWeight: 'bold', color: '#22d3ee', marginBottom: '8px'}}>Informations</h3>
              <p style={{color: '#94a3b8', fontSize: '0.75rem'}}>
                Créé avec ❤️ pour les photographes<br/>
                Version 1.0 Complète • 2026
              </p>
            </div>
          </div>
          
          <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #334155', textAlign: 'center', fontSize: '0.75rem', color: '#64748b'}}>
            © 2026 HDR Calculator • Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<HDRCalculator />);