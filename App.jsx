const { useState } = React;

const HDRCalculator = () => {
  // ============================================================================
  // ÉTATS
  // ============================================================================
  
  // États de navigation
  const [currentPage, setCurrentPage] = useState('calculator');
  const [menuOpen, setMenuOpen] = useState(false);
  const [section2Open, setSection2Open] = useState(false);
  const [section3Open, setSection3Open] = useState(false);
  const [section4Open, setSection4Open] = useState(false);
  
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
    durationLimit: 2.5,
    maxBrackets: 7,
    // Paramètres artistiques
    artisticApertureMin: 12,  // f/4.0 - Zone acceptable
    artisticApertureMax: 18,  // f/8 - Zone de netteté optimale
    artisticIsoMin: 9,        // ISO 400
    artisticIsoMax: 15        // ISO 1600
  });

  // Valeurs principales
  const [mainValues, setMainValues] = useState({
    aperture: 9,  // f/2.8
    shutter: 34,  // 1/40
    iso: 9,       // 400
    brackets: 7,
    spacing: 2
  });

  const [correction1Iso, setCorrection1Iso] = useState(9);  // ISO 400 (même que mainValues.iso)
  const [correction2Aperture, setCorrection2Aperture] = useState(9);  // f/2.8 (même que mainValues.aperture)
  
  // Valeurs pour la section Plage entière
  const [rangeValues, setRangeValues] = useState({
    aperture: 12,  // f/4.0
    iso: 6,        // 200
    speedMin: 13,  // 3.2s
    speedMax: 49   // 1/1250
  });

  const mainResult = calculateHDRSequence(
    mainValues.shutter,
    mainValues.aperture,
    mainValues.iso,
    mainValues.brackets,
    mainValues.spacing,
    settings
  );

  const correction1Result = calculateCorrection1(correction1Iso, mainValues, settings);
  const correction2Result = calculateCorrection2(correction2Aperture, mainValues, settings);
  const rangeResult = calculateRangePleine(rangeValues, settings);

  return (
    <div style={appStyles.container}>
      <Menu 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <Header setMenuOpen={setMenuOpen} />

      <div style={appStyles.content}>
        <div style={appStyles.contentContainer}>
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
                getValidIsos={() => getValidIsos(mainValues, settings)}
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
                getValidApertures={() => getValidApertures(mainValues, settings)}
                renderSuggestion={renderSuggestion}
              />

              <RangePleine
                section4Open={section4Open}
                setSection4Open={setSection4Open}
                rangeValues={rangeValues}
                setRangeValues={setRangeValues}
                rangeResult={rangeResult}
                settings={settings}
                photoDatabase={photoDatabase}
                filterByIncrementAndLimits={filterByIncrementAndLimits}
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