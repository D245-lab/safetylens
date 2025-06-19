import React, { useState, useEffect } from 'react';
import { X, CreditCard, Shield, Check, AlertCircle, Star, Lock } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, plan, billingCycle, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);

  const price = billingCycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly;
  const monthlyPrice = billingCycle === 'yearly' && plan?.price_yearly > 0 
    ? (plan.price_yearly / 12).toFixed(2) 
    : plan?.price_monthly;

  useEffect(() => {
    if (isOpen && plan && plan.id !== 'free') {
      loadPaymentScripts();
    }
  }, [isOpen, plan]);

  const loadPaymentScripts = () => {
    loadStripeScript();
    loadPayPalScript();
  };

  const loadStripeScript = () => {
    if (window.Stripe) {
      initializeStripe();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      initializeStripe();
    };
    script.onerror = () => {
      setError('Failed to load Stripe. Please try again.');
    };
    document.head.appendChild(script);
  };

  const initializeStripe = () => {
    const stripeInstance = window.Stripe('pk_test_mock_key'); // Replace with your publishable key
    setStripe(stripeInstance);
    
    const elementsInstance = stripeInstance.elements({
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#ef4444',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        }
      }
    });
    setElements(elementsInstance);
    setStripeLoaded(true);
  };

  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=demo_client_id&vault=true&intent=subscription';
    script.onload = () => {
      setPaypalLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load PayPal. Please try again.');
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (stripeLoaded && elements && selectedPaymentMethod === 'stripe') {
      renderStripeCard();
    }
  }, [stripeLoaded, elements, selectedPaymentMethod]);

  useEffect(() => {
    if (paypalLoaded && selectedPaymentMethod === 'paypal') {
      renderPayPalButton();
    }
  }, [paypalLoaded, selectedPaymentMethod, plan]);

  const renderStripeCard = () => {
    if (!elements) return;

    const cardElementContainer = document.getElementById('stripe-card-element');
    if (!cardElementContainer) return;

    // Clear existing card element
    cardElementContainer.innerHTML = '';

    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1f2937',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
      },
    });

    card.mount('#stripe-card-element');
    setCardElement(card);

    card.on('change', (event) => {
      if (event.error) {
        setError(event.error.message);
      } else {
        setError('');
      }
    });
  };

  const renderPayPalButton = () => {
    if (!window.paypal || !plan) return;

    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) return;

    // Clear existing buttons
    paypalContainer.innerHTML = '';

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'blue',
        layout: 'vertical',
        label: 'subscribe',
        height: 45
      },
      createSubscription: async (data, actions) => {
        try {
          setLoading(true);
          setError('');

          const response = await fetch('https://0vhlizcp3lqd.manus.space/api/payment/create-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              plan_id: plan.id,
              billing_cycle: billingCycle
            })
          });

          const data = await response.json();

          if (response.ok) {
            return data.paypal_subscription_id;
          } else {
            throw new Error(data.error || 'Failed to create subscription');
          }
        } catch (error) {
          setError(error.message);
          setLoading(false);
          throw error;
        }
      },
      onApprove: async (data, actions) => {
        try {
          setLoading(true);
          
          const response = await fetch('https://0vhlizcp3lqd.manus.space/api/payment/confirm-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              subscription_id: data.subscriptionID
            })
          });

          const result = await response.json();

          if (response.ok) {
            onSuccess(result.subscription);
            onClose();
          } else {
            setError(result.error || 'Failed to confirm subscription');
          }
        } catch (error) {
          setError('Failed to process payment. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        setError('Payment failed. Please try again.');
        setLoading(false);
      },
      onCancel: (data) => {
        setLoading(false);
        setError('Payment was cancelled.');
      }
    }).render('#paypal-button-container');
  };

  const handleStripePayment = async () => {
    if (!stripe || !cardElement) {
      setError('Stripe is not loaded. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: user?.name,
          email: user?.email,
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setLoading(false);
        return;
      }

      // Create subscription
      const response = await fetch('https://0vhlizcp3lqd.manus.space/api/payment/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: plan.id,
          payment_method_id: paymentMethod.id,
          billing_cycle: billingCycle
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Handle successful subscription
        if (result.client_secret) {
          // Confirm payment if needed
          const { error: confirmError } = await stripe.confirmCardPayment(result.client_secret);
          
          if (confirmError) {
            setError(confirmError.message);
            return;
          }
        }

        onSuccess(result);
        onClose();
      } else {
        setError(result.error || 'Failed to create subscription');
      }
    } catch (error) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeSubscription = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('https://0vhlizcp3lqd.manus.space/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: 'free',
          billing_cycle: 'monthly'
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.subscription);
        onClose();
      } else {
        setError(data.error || 'Failed to create free subscription');
      }
    } catch (error) {
      setError('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (plan) => {
    const features = [];
    
    if (plan.monthly_analyses === -1) {
      features.push('Unlimited analyses');
    } else {
      features.push(`${plan.monthly_analyses} analyses per month`);
    }
    
    if (plan.report_type === 'custom') {
      features.push('Custom reports & branding');
    } else if (plan.report_type === 'advanced') {
      features.push('Advanced reports & analytics');
    } else {
      features.push('Basic reports');
    }
    
    if (plan.languages_supported === -1) {
      features.push('All languages supported');
    } else if (plan.languages_supported > 5) {
      features.push(`${plan.languages_supported} languages`);
    } else if (plan.languages_supported > 1) {
      features.push(`${plan.languages_supported} languages`);
    } else {
      features.push('English only');
    }
    
    if (plan.api_access) {
      features.push('API access included');
    }
    
    if (plan.phone_support) {
      features.push('24/7 phone support');
    } else {
      features.push('Email support');
    }
    
    return features.slice(0, 4);
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {plan.id === 'free' ? 'Start Free Trial' : 'Subscribe to SafetyLens.pro'}
            </h2>
            {plan.is_popular && (
              <div className="ml-3 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name} Plan</h3>
                <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
              </div>
              <div className="text-right">
                {plan.id === 'free' ? (
                  <div className="text-3xl font-bold text-gray-900">Free</div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${monthlyPrice}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                    {billingCycle === 'yearly' && (
                      <div className="text-xs text-green-600 font-medium">
                        Billed annually (${price})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Plan Features */}
            <div className="space-y-2">
              {getPlanFeatures(plan).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
            
            {billingCycle === 'yearly' && plan.price_yearly > 0 && (
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                <Check className="w-4 h-4 mr-1" />
                Save 20% with annual billing
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Free Plan Button */}
          {plan.id === 'free' ? (
            <button
              onClick={handleFreeSubscription}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Setting up your free trial...
                </div>
              ) : (
                'Start Free Trial - No Credit Card Required'
              )}
            </button>
          ) : (
            <>
              {/* Trial Info for Paid Plans */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900">14-Day Free Trial Included</div>
                    <div className="text-sm text-green-700">
                      Try all {plan.name} features free for 14 days. Cancel anytime during the trial period with no charges.
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Lock className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Choose Payment Method</span>
                </div>
                
                {/* Payment Method Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setSelectedPaymentMethod('stripe')}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      selectedPaymentMethod === 'stripe'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Credit/Debit Card
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('paypal')}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      selectedPaymentMethod === 'paypal'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    PayPal
                  </button>
                </div>

                {/* Stripe Payment Form */}
                {selectedPaymentMethod === 'stripe' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-3">
                      We accept Visa, Mastercard, American Express, and Discover
                    </div>
                    
                    <div className="border border-gray-300 rounded-lg p-3">
                      <div id="stripe-card-element" className="min-h-[40px]">
                        {!stripeLoaded && (
                          <div className="flex items-center justify-center py-4 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Loading secure payment form...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleStripePayment}
                      disabled={loading || !stripeLoaded}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing payment...
                        </div>
                      ) : (
                        `Subscribe for $${monthlyPrice}/month`
                      )}
                    </button>
                  </div>
                )}

                {/* PayPal Payment */}
                {selectedPaymentMethod === 'paypal' && (
                  <div>
                    <div id="paypal-button-container" className="min-h-[50px]">
                      {!paypalLoaded && (
                        <div className="flex items-center justify-center py-6 bg-gray-50 rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-gray-600">Loading PayPal...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500 text-center">
                  <Shield className="w-4 h-4 inline mr-1" />
                  256-bit SSL encryption • PCI DSS compliant • Your data is secure
                </div>
              </div>
            </>
          )}

          {/* Money Back Guarantee */}
          {plan.id !== 'free' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">30-Day Money-Back Guarantee</div>
                  <div className="text-blue-700">Not satisfied? Get a full refund within 30 days, no questions asked.</div>
                </div>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="text-xs text-gray-500 text-center">
            By subscribing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
            {plan.id !== 'free' && ' You can cancel your subscription at any time from your account settings.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

