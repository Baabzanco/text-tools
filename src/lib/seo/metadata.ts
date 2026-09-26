import { SEOData, ToolDefinition } from '../../types';

/**
 * Updates head metadata and JSON-LD structured data dynamically for SEO compliance.
 */
export function updatePageMetadata(seo: SEOData, path = ''): void {
  if (typeof document === 'undefined') return;

  // 1. Title
  document.title = seo.title;

  // Helper function to update or create meta tags
  const setMeta = (nameAttr: string, attrVal: string, contentVal: string) => {
    let element = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(nameAttr, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', contentVal);
  };

  // 2. Standard Meta
  setMeta('name', 'description', seo.description);
  if (seo.keywords && seo.keywords.length > 0) {
    setMeta('name', 'keywords', seo.keywords.join(', '));
  }

  // 3. Open Graph
  setMeta('property', 'og:title', seo.title);
  setMeta('property', 'og:description', seo.description);
  setMeta('property', 'og:type', 'website');
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = seo.canonical || `${origin}${path}`;
  setMeta('property', 'og:url', currentUrl);

  // 4. Twitter Cards
  setMeta('name', 'twitter:title', seo.title);
  setMeta('name', 'twitter:description', seo.description);
  setMeta('name', 'twitter:card', 'summary_large_image');

  // 5. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', currentUrl);
}

/**
 * Embeds Schema.org JSON-LD structured data into document head.
 */
export function injectStructuredData(tool?: ToolDefinition): void {
  if (typeof document === 'undefined') return;

  // Clean previous custom structured data scripts
  const existingScript = document.getElementById('text-tools-jsonld');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = 'text-tools-jsonld';
  script.type = 'application/ld+json';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://text-tools.app';

  if (tool) {
    // Tool Specific WebApplication + FAQPage + BreadcrumbList
    const schemas: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': tool.title,
        'description': tool.description,
        'url': `${baseUrl}/tools/${tool.slug}`,
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': baseUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Text Tools',
            'item': `${baseUrl}/text-tools`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': tool.title,
            'item': `${baseUrl}/tools/${tool.slug}`
          }
        ]
      }
    ];

    if (tool.faq && tool.faq.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': tool.faq.map((f) => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      });
    }

    script.textContent = JSON.stringify(schemas);
  } else {
    // Platform WebSite schema
    const siteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Text Tools',
      'url': baseUrl,
      'description': 'Free online text utilities and text analyzer platform running locally in your browser.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${baseUrl}/text-tools?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
    script.textContent = JSON.stringify(siteSchema);
  }

  document.head.appendChild(script);
}
