import React from 'react';

const SEOHead = ({ 
  title = "SafetyLens.pro - AI-Powered Workplace Safety Analysis", 
  description = "Transform workplace safety with AI-powered photo analysis. Get instant OSHA compliance reports, hazard detection, and safety recommendations for your workplace.",
  keywords = "workplace safety, AI safety analysis, OSHA compliance, hazard detection, safety management, workplace inspection, safety software",
  canonicalUrl = "https://safetylens.pro",
  ogImage = "/og-image.jpg",
  structuredData = null
}) => {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SafetyLens.pro",
    "description": "AI-powered workplace safety analysis platform for OSHA compliance and hazard detection",
    "url": "https://safetylens.pro",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "29",
      "highPrice": "299",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "billingIncrement": "P1M"
      }
    },
    "provider": {
      "@type": "Organization",
      "name": "SafetyLens.pro",
      "url": "https://safetylens.pro",
      "logo": "https://safetylens.pro/logo.png"
    },
    "featureList": [
      "AI-powered workplace photo analysis",
      "OSHA compliance checking",
      "Multi-language support",
      "Regional safety standards",
      "Automated hazard detection",
      "Safety recommendations",
      "Compliance reporting"
    ]
  };

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="SafetyLens.pro" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="SafetyLens.pro" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:site" content="@SafetyLens" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#1e40af" />
      
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData || defaultStructuredData)
        }}
      />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
    </>
  );
};

export default SEOHead;

