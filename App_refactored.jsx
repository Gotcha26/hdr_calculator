// App.jsx - Composant principal refactorisé

const { useState } = React;

import styles from './styles/styles.js';
import Header from './components/Header.jsx';
import Menu from './components/Menu.jsx';
import MainSection from './components/MainSection.jsx';
import CorrectionISO from './components/CorrectionISO.jsx';
import CorrectionAperture from './components/CorrectionAperture.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import Footer from './components/Footer.jsx';
import { renderSuggestion } from './utils/helpers.js';

const HDRCalculator = () => {
  // États de navigation
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
    aperture: 9,  // f/2.8
    shutter: 34,  // 1/40
    iso: 9,       // 400
    brackets: 7,
    spacing: 2
  });

  const [correction1Iso, setCorrection1Iso] = useState(12);        // 800
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
          
          specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
          if (result.durationWarning) {
            specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
          } else {
            specificSuggestions.push(`✅ Durée compatible astrophoto`);
          }
          
          specificSuggestions.push(`💡 Optimum technique : ISO ${bestIso.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''} plus bas)`);
          
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
      
      let bestAperture = null;
      let bestApertureIndex = -1;
      let bestDuration = result.totalDuration;
      let cransDiff = 0;
      
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
      
      specificSuggestions.push(`⏱️ Durée actuelle : ${result.totalDuration.toFixed(2)}s ${settings.durationLimit < 100 ? `(limite : ${settings.durationLimit}s)` : ''}`);
      if (result.durationWarning) {
        specificSuggestions.push(`⚠️ Limite astrophoto dépassée (désactiver)`);
      } else {
        specificSuggestions.push(`✅ Durée compatible astrophoto`);
      }
      
      if (bestAperture && bestApertureIndex !== correction2Aperture) {
        specificSuggestions.push(`💡 Optimum technique : ${bestAperture.display} (${cransDiff} cran${cransDiff > 1 ? 's' : ''})`);
        
        const optimalDurationStatus = bestDuration <= settings.durationLimit || settings.durationLimit >= 100 ? '✅ Compatible' : '⚠️ Dépasse limite';
        specificSuggestions.push(`🎯 Durée optimale : ${bestDuration.toFixed(2)}s - ${optimalDurationStatus}`);
      } else {
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

  // Filtrer les ISO valides
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

  // Filtrer les ouvertures valides
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

  return (
    <div style={styles.container}>
      <Menu 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <Header setMenuOpen={setMenuOpen} />

      <div style={styles.content}>
        <div style={styles.contentContainer}>
          {currentPage === 'calculator' ? (
            <div>
              <MainSection
                mainValues={mainValues}
                setMainValues={setMainValues}
                mainResult={mainResult}
                settings={settings}
                setSettings={setSettings}
                photoDatabase={photoDatabase}
                filterByIncrementAndLimits={filterByIncrementAndLimits}
                getSpacingOptions={getSpacingOptions}
              />

              <CorrectionISO
                section2Open={section2Open}
                setSection2Open={setSection2Open}
                correction1Iso={correction1Iso}
                setCorrection1Iso={setCorrection1Iso}
                correction1Result={correction1Result}
                mainValues={mainValues}
                settings={settings}
                setSettings={setSettings}
                photoDatabase={photoDatabase}
                getValidIsos={getValidIsos}
                renderSuggestion={renderSuggestion}
              />

              <CorrectionAperture
                section3Open={section3Open}
                setSection3Open={setSection3Open}
                correction2Aperture={correction2Aperture}
                setCorrection2Aperture={setCorrection2Aperture}
                correction2Result={correction2Result}
                mainValues={mainValues}
                settings={settings}
                setSettings={setSettings}
                photoDatabase={photoDatabase}
                getValidApertures={getValidApertures}
                renderSuggestion={renderSuggestion}
              />
            </div>
          ) : (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              setCurrentPage={setCurrentPage}
              photoDatabase={photoDatabase}
              cameraTypes={cameraTypes}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<HDRCalculator />);