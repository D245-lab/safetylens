import React, { useState, useEffect } from 'react';
import { Check, X, Star, Shield, Users, Zap, Globe, Phone, BarChart3, Crown, ArrowRight, Sparkles } from 'lucide-react';

const PricingPage = ({ onSelectPlan, currentUser, onLogin, onRegister }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('https://0vhlizcp3lqd.manus.space/api/subscription/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback to hardcoded plans if API fails
      setPlans([
        {
          id: 'free',
          name: 'Free Trial',
          description: 'Perfect for trying out our platform',
          price_monthly: 0,
          price_yearly: 0,
          monthly_analyses: 3,
          team_members: 1,
          languages_supported: 1,
          api_access: false,
          custom_branding: false,
          phone_support: false,
          advanced_analytics: false,
          data_retention_days: 30,
          report_type: 'basic'
        },
        {
          id: 'starter',
          name: 'Starter',
          description: 'Great for small businesses getting started with safety analysis',
          price_monthly: 29,
          price_yearly: 290,
          monthly_analyses: 50,
          team_members: 1,
          languages_supported: 5,
          api_access: false,
          custom_branding: false,
          phone_support: false,
          advanced_analytics: false,
          data_retention_days: 365,
          report_type: 'basic'
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'Most popular - Ideal for growing businesses and teams',
          price_monthly: 99,
          price_yearly: 990,
          monthly_analyses: 500,
          team_members: 5,
          languages_supported: 15,
          api_access: true,
          custom_branding: false,
          phone_support: false,
          advanced_analytics: true,
          data_retention_days: 730,
          report_type: 'advanced',
          is_popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'Unlimited power for large organizations',
          price_monthly: 299,
          price_yearly: 2990,
          monthly_analyses: -1,
          team_members: -1,
          languages_supported: -1,
          api_access: true,
          custom_branding: true,
          phone_support: true,
          advanced_analytics: true,
          data_retention_days: -1,
          report_type: 'custom',
          contact_sales: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getMonthlyPrice = (plan) => {
    if (billingCycle === 'yearly' && plan.price_yearly > 0) {
      return (plan.price_yearly / 12).toFixed(2);
    }
    return plan.price_monthly;
  };

  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.price_yearly > 0 && plan.price_monthly > 0) {
      const yearlyTotal = plan.price_monthly * 12;
      const savings = yearlyTotal - plan.price_yearly;
      const percentage = Math.round((savings / yearlyTotal) * 100);
      return { amount: savings, percentage };
    }
    return null;
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free': return <Shield className="w-8 h-8 text-blue-500" />;
      case 'starter': return <Zap className="w-8 h-8 text-green-500" />;
      case 'professional': return <Star className="w-8 h-8 text-purple-500" />;
      case 'enterprise': return <Crown className="w-8 h-8 text-yellow-500" />;
      default: return <Zap className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFeatureList = (plan) => {
    const features = [];
    
    // Analyses
    if (plan.monthly_analyses === -1) {
      features.push({ text: 'Unlimited analyses', included: true, highlight: true });
    } else {
      features.push({ text: `${plan.monthly_analyses} analyses per month`, included: true });
    }
    
    // Report type
    if (plan.report_type === 'custom') {
      features.push({ text: 'Custom reports & branding', included: true, highlight: true });
    } else if (plan.report_type === 'advanced') {
      features.push({ text: 'Advanced reports & analytics', included: true, highlight: true });
    } else {
      features.push({ text: 'Basic reports', included: true });
    }
    
    // Languages
    if (plan.languages_supported === -1) {
      features.push({ text: 'All languages supported', included: true, highlight: true });
    } else if (plan.languages_supported > 5) {
      features.push({ text: `${plan.languages_supported} languages supported`, included: true });
    } else if (plan.languages_supported > 1) {
      features.push({ text: `${plan.languages_supported} languages`, included: true });
    } else {
      features.push({ text: 'English only', included: true });
    }
    
    // Team members
    if (plan.team_members === -1) {
      features.push({ text: 'Unlimited team members', included: true });
    } else if (plan.team_members > 1) {
      features.push({ text: `Up to ${plan.team_members} team members`, included: true });
    } else {
      features.push({ text: 'Single user', included: true });
    }
    
    // API access
    features.push({ text: 'API access', included: plan.api_access, highlight: plan.api_access });
    
    // Support
    if (plan.phone_support) {
      features.push({ text: '24/7 phone support', included: true, highlight: true });
    } else {
      features.push({ text: 'Email support', included: true });
    }
    
    // Data retention
    if (plan.data_retention_days === -1) {
      features.push({ text: 'Unlimited data retention', included: true });
    } else {
      features.push({ text: `${plan.data_retention_days} days data retention`, included: true });
    }
    
    return features;
  };

  const handleSelectPlan = (plan) => {
    if (!currentUser) {
      onLogin();
      return;
    }
    
    if (plan.contact_sales) {
      // Handle enterprise contact sales
      window.open('mailto:sales@safetylens.pro?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    
    setSelectedPlan(plan);
    onSelectPlan(plan, billingCycle);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Safety Analysis Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven workplace safety analysis for businesses of all sizes. 
              Start with our free trial and scale as you grow.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const savings = getSavings(plan);
            const isPopular = plan.is_popular;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isPopular 
                    ? 'border-purple-500 ring-4 ring-purple-100' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    {plan.price_monthly === 0 ? (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">Free</span>
                        <p className="text-gray-600 text-sm mt-1">No credit card required</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">
                            ${getMonthlyPrice(plan)}
                          </span>
                          <span className="text-gray-600 ml-1">/month</span>
                        </div>
                        {billingCycle === 'yearly' && savings && (
                          <div className="mt-2">
                            <span className="text-green-600 text-sm font-medium">
                              Save ${savings.amount}/year ({savings.percentage}% off)
                            </span>
                          </div>
                        )}
                        {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                          <p className="text-gray-600 text-sm mt-1">
                            Billed annually (${plan.price_yearly}/year)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {getFeatureList(plan).map((feature, index) => (
                      <div key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                            feature.highlight ? 'text-purple-500' : 'text-green-500'
                          }`} />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included 
                            ? feature.highlight 
                              ? 'text-gray-900 font-medium' 
                              : 'text-gray-700'
                            : 'text-gray-400'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={selectedPlan?.id === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
                      plan.contact_sales
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : plan.price_monthly === 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } ${
                      selectedPlan?.id === plan.id ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {selectedPlan?.id === plan.id ? (
                      'Processing...'
                    ) : plan.contact_sales ? (
                      <>
                        Contact Sales
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : plan.price_monthly === 0 ? (
                      'Start Free Trial'
                    ) : (
                      `Get Started - $${getMonthlyPrice(plan)}/mo`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Volume Discount Message */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Need more than 500 analyses per month?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact our sales team for custom volume pricing and enterprise features.
              We offer significant discounts for high-volume usage.
            </p>
            <button
              onClick={() => window.open('mailto:sales@safetylens.pro?subject=Volume Pricing Inquiry', '_blank')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Sales Team
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards and PayPal. Enterprise customers can pay by invoice.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                Yes! Our Free Trial includes 3 analyses per month with no time limit.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

