import React, { useState, useEffect } from 'react';
import { Globe, MapPin, ChevronDown, Check } from 'lucide-react';
import { autoDetectUserPreferences } from '../utils/languageDetection';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', nativeName: 'العربية' }
];

const regions = [
  { code: 'us-federal', name: 'United States (Federal OSHA)', flag: '🇺🇸' },
  { code: 'us-california', name: 'California (Cal/OSHA)', flag: '🇺🇸' },
  { code: 'canada', name: 'Canada (WHMIS)', flag: '🇨🇦' },
  { code: 'eu', name: 'European Union', flag: '🇪🇺' },
  { code: 'uk', name: 'United Kingdom (HSE)', flag: '🇬🇧' },
  { code: 'australia', name: 'Australia (Safe Work)', flag: '🇦🇺' },
  { code: 'japan', name: 'Japan (JISHA)', flag: '🇯🇵' },
  { code: 'uae', name: 'United Arab Emirates (OSHAD)', flag: '🇦🇪' }
];

const SmartLanguageSelector = ({ 
  selectedLanguage, 
  selectedRegion, 
  onLanguageChange, 
  onRegionChange,
  canAccessFeature,
  showDetectionNotice = true 
}) => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [showAutoDetectBanner, setShowAutoDetectBanner] = useState(false);

  useEffect(() => {
    // Auto-detect user preferences on component mount
    const detectPreferences = async () => {
      try {
        const preferences = await autoDetectUserPreferences();
        setDetectionResult(preferences);
        
        // Show banner if detected preferences differ from current selection
        if (showDetectionNotice && 
            (preferences.language !== selectedLanguage || preferences.region !== selectedRegion)) {
          setShowAutoDetectBanner(true);
        }
      } catch (error) {
        console.log('Auto-detection failed:', error);
      }
    };

    detectPreferences();
  }, [selectedLanguage, selectedRegion, showDetectionNotice]);

  const applyDetectedPreferences = () => {
    if (detectionResult) {
      onLanguageChange(detectionResult.language);
      onRegionChange(detectionResult.region);
      setShowAutoDetectBanner(false);
    }
  };

  const dismissBanner = () => {
    setShowAutoDetectBanner(false);
  };

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);
  const selectedReg = regions.find(reg => reg.code === selectedRegion);

  return (
    <div className="space-y-4">
      {/* Auto-detection Banner */}
      {showAutoDetectBanner && detectionResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  We detected your preferences
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Based on your location, we suggest using{' '}
                  <span className="font-medium">
                    {languages.find(l => l.code === detectionResult.language)?.name}
                  </span>{' '}
                  and{' '}
                  <span className="font-medium">
                    {regions.find(r => r.code === detectionResult.region)?.name}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={applyDetectedPreferences}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={dismissBanner}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Analysis Language
          </label>
          
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedLang?.flag}</span>
                <span>{selectedLang?.nativeName}</span>
                {!canAccessFeature('multi_language') && selectedLanguage !== 'en' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Pro+</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLanguageOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {languages.map((lang) => {
                  const isAccessible = canAccessFeature('multi_language') || lang.code === 'en';
                  const isDetected = detectionResult?.language === lang.code;
                  
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (isAccessible) {
                          onLanguageChange(lang.code);
                          setIsLanguageOpen(false);
                        }
                      }}
                      disabled={!isAccessible}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        !isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${selectedLanguage === lang.code ? 'bg-blue-50 text-blue-700' : ''}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                        {!isAccessible && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Pro+</span>
                        )}
                        {isDetected && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Detected</span>
                        )}
                      </div>
                      {selectedLanguage === lang.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!canAccessFeature('multi_language') && (
            <p className="mt-1 text-xs text-gray-500">
              Upgrade to Professional plan for multi-language support
            </p>
          )}
        </div>

        {/* Region Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Regional Standards
          </label>
          
          <div className="relative">
            <button
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedReg?.flag}</span>
                <span className="truncate">{selectedReg?.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isRegionOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRegionOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {regions.map((region) => {
                  const isDetected = detectionResult?.region === region.code;
                  
                  return (
                    <button
                      key={region.code}
                      onClick={() => {
                        onRegionChange(region.code);
                        setIsRegionOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                        selectedRegion === region.code ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{region.flag}</span>
                        <span className="truncate">{region.name}</span>
                        {isDetected && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Detected</span>
                        )}
                      </div>
                      {selectedRegion === region.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLanguageSelector;

