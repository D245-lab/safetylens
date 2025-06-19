import { useState, useRef, useEffect } from 'react'
import { Upload, Download, Globe, MapPin, Camera, FileText, BarChart3, Users, Settings, CreditCard, LogOut } from 'lucide-react'
import PricingPage from './components/PricingPage'
import AuthModal from './components/AuthModal'
import PaymentModal from './components/PaymentModal'
import SubscriptionDashboard from './components/SubscriptionDashboard'
import SmartLanguageSelector from './components/SmartLanguageSelector'
import AIAssistant from './components/AIAssistant'
import { autoDetectUserPreferences } from './utils/languageDetection'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
]

const regions = [
  { code: 'us-federal', name: 'United States (Federal OSHA)', flag: '🇺🇸' },
  { code: 'us-california', name: 'California (Cal/OSHA)', flag: '🇺🇸' },
  { code: 'canada', name: 'Canada (WHMIS)', flag: '🇨🇦' },
  { code: 'eu', name: 'European Union', flag: '🇪🇺' },
  { code: 'uk', name: 'United Kingdom (HSE)', flag: '🇬🇧' },
  { code: 'australia', name: 'Australia (Safe Work)', flag: '🇦🇺' },
  { code: 'japan', name: 'Japan (JISHA)', flag: '🇯🇵' },
  { code: 'uae', name: 'United Arab Emirates (OSHAD)', flag: '🇦🇪' }
]

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedRegion, setSelectedRegion] = useState('us-federal')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentView, setCurrentView] = useState('analyzer') // 'analyzer', 'pricing', 'dashboard'
  const [currentUser, setCurrentUser] = useState(null)
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' })
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, plan: null, billingCycle: 'monthly' })
  const [autoDetectionApplied, setAutoDetectionApplied] = useState(false)
  const fileInputRef = useRef(null)

  // Auto-detect user preferences on first load
  useEffect(() => {
    const applyAutoDetection = async () => {
      if (!autoDetectionApplied) {
        try {
          const preferences = await autoDetectUserPreferences()
          setSelectedLanguage(preferences.language)
          setSelectedRegion(preferences.region)
          setAutoDetectionApplied(true)
        } catch (error) {
          console.log('Auto-detection failed, using defaults')
          setAutoDetectionApplied(true)
        }
      }
    }
    
    applyAutoDetection()
  }, [autoDetectionApplied])

  // Check for existing session on app load
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('https://0vhlizcp3lqd.manus.space/api/profile', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.log('No active session')
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setAnalysisResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!uploadedImage) return

    // Check if user can perform analysis
    if (currentUser && !currentUser.subscription?.is_active) {
      alert('Please subscribe to a plan to perform analysis')
      setCurrentView('pricing')
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Increment usage
      if (currentUser) {
        await fetch('https://0vhlizcp3lqd.manus.space/api/subscription/usage/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'analysis' })
        })
      }

      const response = await fetch('https://0vhlizcp3lqd.manus.space/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          image: uploadedImage,
          language: selectedLanguage,
          region: selectedRegion
        })
      })
      
      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLogin = () => {
    setAuthModal({ isOpen: true, mode: 'login' })
  }

  const handleRegister = () => {
    setAuthModal({ isOpen: true, mode: 'register' })
  }

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
    setAuthModal({ isOpen: false, mode: 'login' })
  }

  const handleLogout = async () => {
    try {
      await fetch('https://0vhlizcp3lqd.manus.space/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setCurrentUser(null)
      setCurrentView('analyzer')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSelectPlan = (plan, billingCycle) => {
    if (!currentUser) {
      handleLogin()
      return
    }
    setPaymentModal({ isOpen: true, plan, billingCycle })
  }

  const handlePaymentSuccess = (subscription) => {
    // Update user with new subscription
    setCurrentUser(prev => ({
      ...prev,
      subscription: subscription
    }))
    setPaymentModal({ isOpen: false, plan: null, billingCycle: 'monthly' })
    setCurrentView('analyzer')
  }

  const canAccessFeature = (feature) => {
    if (!currentUser || !currentUser.subscription) return false
    
    const plan = currentUser.subscription.plan
    if (!plan) return false

    switch (feature) {
      case 'multi_language':
        return plan.languages_supported > 1
      case 'advanced_analytics':
        return plan.advanced_analytics
      case 'api_access':
        return plan.api_access
      default:
        return false
    }
  }

  const getUserUsageInfo = () => {
    if (!currentUser || !currentUser.current_usage || !currentUser.usage_limits) {
      return { used: 0, limit: 0, canAnalyze: false }
    }

    const used = currentUser.current_usage.analyses_used || 0
    const limit = currentUser.usage_limits.monthly_analyses
    const canAnalyze = limit === -1 || used < limit

    return { used, limit, canAnalyze }
  }

  if (currentView === 'pricing') {
    return (
      <>
        <PricingPage
          onSelectPlan={handleSelectPlan}
          currentUser={currentUser}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          mode={authModal.mode}
          onSwitchMode={() => setAuthModal(prev => ({ 
            ...prev, 
            mode: prev.mode === 'login' ? 'register' : 'login' 
          }))}
          onSuccess={handleAuthSuccess}
        />
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, plan: null, billingCycle: 'monthly' })}
          plan={paymentModal.plan}
          billingCycle={paymentModal.billingCycle}
          user={currentUser}
          onSuccess={handlePaymentSuccess}
        />
      </>
    )
  }

  const usageInfo = getUserUsageInfo()

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${selectedLanguage === 'ar' ? 'rtl' : 'ltr'}`} dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/src/assets/safetylens_logo.png" 
                alt="SafetyLens.pro" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafetyLens.pro</h1>
                <p className="text-sm text-gray-600">AI-Powered Workplace Safety Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('analyzer')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'analyzer' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Analyzer
                </button>
                <button
                  onClick={() => setCurrentView('pricing')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'pricing' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Pricing
                </button>
                {currentUser && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'dashboard' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </button>
                )}
              </nav>

              {/* User Menu */}
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                    <div className="text-xs text-gray-600">
                      {currentUser.subscription?.plan?.name || 'Free'} Plan
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                      <span className="text-white text-sm font-medium">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <button
                        onClick={() => setCurrentView('pricing')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Manage Subscription
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleRegister}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'pricing' && (
          <PricingPage 
            onSelectPlan={handleSelectPlan}
            currentUser={currentUser}
            onLogin={handleLogin}
          />
        )}
        
        {currentView === 'dashboard' && currentUser && (
          <SubscriptionDashboard
            user={currentUser}
            onUpgrade={() => setCurrentView('pricing')}
            onManageSubscription={() => {
              // In a real app, this would open PayPal subscription management
              alert('Redirecting to PayPal subscription management...')
            }}
          />
        )}
        
        {currentView === 'analyzer' && (
          <>
            {/* Usage Info */}
            {currentUser && (
              <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Monthly Usage</h3>
                    <p className="text-xs text-gray-600">
                      {usageInfo.limit === -1 
                        ? `${usageInfo.used} analyses used (Unlimited)`
                        : `${usageInfo.used} of ${usageInfo.limit} analyses used`
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!usageInfo.canAnalyze && (
                      <span className="text-xs text-red-600 font-medium">Limit reached</span>
                    )}
                    <button
                      onClick={() => setCurrentView('pricing')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
                {usageInfo.limit > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((usageInfo.used / usageInfo.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <SmartLanguageSelector
            selectedLanguage={selectedLanguage}
            selectedRegion={selectedRegion}
            onLanguageChange={setSelectedLanguage}
            onRegionChange={setSelectedRegion}
            canAccessFeature={canAccessFeature}
            showDetectionNotice={!autoDetectionApplied}
          />
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Upload className="w-5 h-5 inline mr-2" />
            Upload Workplace Image
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded workplace"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                />
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing || !usageInfo.canAnalyze}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Safety'
                    )}
                  </button>
                </div>
                {!usageInfo.canAnalyze && (
                  <p className="text-sm text-red-600">
                    Monthly analysis limit reached. Please upgrade your plan.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg text-gray-600">Drop your workplace image here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Safety Analysis Results
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Score */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Overall Compliance Score</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        analysisResult.compliance_score >= 80 ? 'bg-green-500' :
                        analysisResult.compliance_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.compliance_score}%` }}
                    ></div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {analysisResult.compliance_score}%
                  </span>
                </div>
              </div>

              {/* Hazards Detected */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Hazards Detected</h3>
                <div className="space-y-2">
                  {analysisResult.hazards.map((hazard, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{hazard.type}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        hazard.severity === 'high' ? 'bg-red-100 text-red-800' :
                        hazard.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {hazard.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Safety Recommendations</h3>
              <div className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Report */}
            <div className="mt-6 flex justify-end">
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        )}
        </>
      )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        mode={authModal.mode}
        onSwitchMode={() => setAuthModal(prev => ({ 
          ...prev, 
          mode: prev.mode === 'login' ? 'register' : 'login' 
        }))}
        onSuccess={handleAuthSuccess}
      />
      
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, plan: null, billingCycle: 'monthly' })}
        plan={paymentModal.plan}
        billingCycle={paymentModal.billingCycle}
        user={currentUser}
        onSuccess={handlePaymentSuccess}
      />
      
      {/* AI Assistant */}
      <AIAssistant
        currentUser={currentUser}
        userContext={{
          selectedLanguage,
          selectedRegion,
          currentView,
          usage_percentage: usageInfo ? (usageInfo.used / usageInfo.limit) * 100 : 0,
          canAnalyze: usageInfo?.canAnalyze
        }}
      />
    </div>
  )
}

export default App

