// Language detection utility
export const detectUserLanguage = () => {
  // Get browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Supported languages mapping
  const supportedLanguages = {
    'en': 'en',
    'es': 'es', 
    'fr': 'fr',
    'de': 'de',
    'zh': 'zh',
    'ja': 'ja',
    'ar': 'ar'
  };
  
  // Return detected language or default to English
  return supportedLanguages[langCode] || 'en';
};

// Get user's timezone for regional detection
export const detectUserRegion = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Regional mapping based on timezone
  const regionMapping = {
    // North America
    'America/New_York': 'us-federal',
    'America/Chicago': 'us-federal',
    'America/Denver': 'us-federal',
    'America/Los_Angeles': 'us-california',
    'America/Toronto': 'canada',
    'America/Vancouver': 'canada',
    
    // Europe
    'Europe/London': 'uk',
    'Europe/Paris': 'eu',
    'Europe/Berlin': 'eu',
    'Europe/Madrid': 'eu',
    'Europe/Rome': 'eu',
    'Europe/Amsterdam': 'eu',
    
    // Asia Pacific
    'Asia/Tokyo': 'japan',
    'Asia/Shanghai': 'us-federal', // Default for China
    'Asia/Hong_Kong': 'us-federal',
    'Australia/Sydney': 'australia',
    'Australia/Melbourne': 'australia',
    
    // Middle East
    'Asia/Dubai': 'uae',
    'Asia/Riyadh': 'uae',
    'Asia/Kuwait': 'uae',
    'Asia/Qatar': 'uae'
  };
  
  return regionMapping[timezone] || 'us-federal';
};

// Get user's location for enhanced detection (requires permission)
export const detectLocationBasedRegion = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Rough geographic boundaries for regions
        if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
          // United States
          if (latitude >= 32 && latitude <= 42 && longitude >= -124 && longitude <= -114) {
            resolve('us-california');
          } else {
            resolve('us-federal');
          }
        } else if (latitude >= 42 && latitude <= 83 && longitude >= -141 && longitude <= -52) {
          // Canada
          resolve('canada');
        } else if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
          // Europe
          if (latitude >= 50 && latitude <= 61 && longitude >= -8 && longitude <= 2) {
            resolve('uk');
          } else {
            resolve('eu');
          }
        } else if (latitude >= 20 && latitude <= 26 && longitude >= 51 && longitude <= 56) {
          // UAE
          resolve('uae');
        } else if (latitude >= 24 && latitude <= 46 && longitude >= 123 && longitude <= 146) {
          // Japan
          resolve('japan');
        } else if (latitude >= -44 && latitude <= -10 && longitude >= 113 && longitude <= 154) {
          // Australia
          resolve('australia');
        } else {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};

// Combined detection function
export const autoDetectUserPreferences = async () => {
  const language = detectUserLanguage();
  const timezoneRegion = detectUserRegion();
  const locationRegion = await detectLocationBasedRegion();
  
  return {
    language,
    region: locationRegion || timezoneRegion,
    detectionMethod: locationRegion ? 'location' : 'timezone'
  };
};

