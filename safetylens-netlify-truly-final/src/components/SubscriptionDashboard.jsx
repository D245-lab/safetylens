import React, { useState, useEffect } from 'react';
import { User, CreditCard, BarChart3, Settings, Calendar, CheckCircle, AlertCircle, TrendingUp, Download, RefreshCw } from 'lucide-react';

const SubscriptionDashboard = ({ user, onUpgrade, onManageSubscription }) => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription details
      const subResponse = await fetch('https://0vhlizcp3lqd.manus.space/api/subscription/current', {
        credentials: 'include'
      });
      const subData = await subResponse.json();
      
      if (subResponse.ok) {
        setSubscription(subData);
      }
      
      // Fetch usage data
      const usageResponse = await fetch('https://0vhlizcp3lqd.manus.space/api/analysis/usage', {
        credentials: 'include'
      });
      const usageData = await usageResponse.json();
      
      if (usageResponse.ok) {
        setUsage(usageData);
      }
      
      // Fetch billing history
      const billingResponse = await fetch('https://0vhlizcp3lqd.manus.space/api/subscription/billing-history', {
        credentials: 'include'
      });
      const billingData = await billingResponse.json();
      
      if (billingResponse.ok) {
        setBillingHistory(billingData);
      }
      
    } catch (error) {
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!usage || !subscription) return 0;
    if (subscription.plan.monthly_analyses === -1) return 0; // Unlimited
    return Math.min(100, (usage.current_usage / subscription.plan.monthly_analyses) * 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }
    
    try {
      const response = await fetch('https://0vhlizcp3lqd.manus.space/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchSubscriptionData(); // Refresh data
        alert('Subscription cancelled successfully. You will retain access until the end of your billing period.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your SafetyLens.pro subscription and usage</p>
            </div>
            <button
              onClick={fetchSubscriptionData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Current Plan
                </h2>
                {subscription?.status === 'active' && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                )}
              </div>

              {subscription ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{subscription.plan.name}</h3>
                      <p className="text-gray-600">{subscription.plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${subscription.plan.price_monthly}/month
                      </div>
                      {subscription.billing_cycle === 'yearly' && (
                        <div className="text-sm text-green-600">Billed annually</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {subscription.plan.monthly_analyses === -1 ? '∞' : subscription.plan.monthly_analyses}
                      </div>
                      <div className="text-sm text-gray-600">Analyses/month</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {subscription.plan.languages_supported === -1 ? 'All' : subscription.plan.languages_supported}
                      </div>
                      <div className="text-sm text-gray-600">Languages</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {subscription.plan.api_access ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-600">API Access</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {subscription.plan.phone_support ? '24/7' : 'Email'}
                      </div>
                      <div className="text-sm text-gray-600">Support</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={onUpgrade}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upgrade Plan
                    </button>
                    <button
                      onClick={onManageSubscription}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Manage Subscription
                    </button>
                    {subscription.plan.id !== 'free' && (
                      <button
                        onClick={handleCancelSubscription}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No active subscription found</p>
                  <button
                    onClick={onUpgrade}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose a Plan
                  </button>
                </div>
              )}
            </div>

            {/* Usage Statistics */}
            {usage && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Usage This Month
                </h2>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Analyses Used</span>
                    <span className="text-sm text-gray-600">
                      {usage.current_usage} / {subscription?.plan.monthly_analyses === -1 ? '∞' : subscription?.plan.monthly_analyses}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage() >= 90 ? 'bg-red-500' :
                        getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, getUsagePercentage())}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${getUsageColor()}`}>
                    <div className="text-2xl font-bold">{usage.current_usage}</div>
                    <div className="text-sm">Analyses Used</div>
                  </div>
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
                    <div className="text-2xl font-bold">
                      {subscription?.plan.monthly_analyses === -1 ? '∞' : 
                       Math.max(0, subscription?.plan.monthly_analyses - usage.current_usage)}
                    </div>
                    <div className="text-sm">Remaining</div>
                  </div>
                  <div className="p-4 bg-purple-50 text-purple-600 rounded-lg">
                    <div className="text-2xl font-bold">{usage.total_analyses || 0}</div>
                    <div className="text-sm">Total All Time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Billing History
              </h2>

              {billingHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((bill, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{formatDate(bill.date)}</td>
                          <td className="py-3 px-4">{bill.description}</td>
                          <td className="py-3 px-4 font-medium">${bill.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                              bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {bill.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-blue-600 hover:text-blue-700 flex items-center">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No billing history available
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <div className="text-gray-900">{user?.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="text-gray-900">{user?.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <div className="text-gray-900">{formatDate(user?.created_at)}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={onUpgrade}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <TrendingUp className="w-4 h-4 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Upgrade Plan</div>
                    <div className="text-sm text-gray-600">Get more features</div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="w-4 h-4 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Download Reports</div>
                    <div className="text-sm text-gray-600">Export your data</div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Settings className="w-4 h-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Account Settings</div>
                    <div className="text-sm text-gray-600">Update preferences</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Our support team is here to help you get the most out of SafetyLens.pro
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;

