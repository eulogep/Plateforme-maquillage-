// Performance optimization utilities

// Debounce function for search and form inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer for animations
export const createAnimationObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };

  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, defaultOptions);
  }
  return null;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = function() {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  });
};

// Optimize scroll performance
export const optimizeScrollPerformance = () => {
  let ticking = false;

  const updateScrollPosition = () => {
    // Update scroll-dependent elements
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax effect for hero section
    const hero = document.querySelector('#accueil');
    if (hero) {
      hero.style.transform = `translateY(${rate}px)`;
    }
    
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });
};

// Reduce layout shifts
export const preventLayoutShifts = () => {
  // Add aspect ratio containers for images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.style.aspectRatio && img.width && img.height) {
      img.style.aspectRatio = `${img.width} / ${img.height}`;
    }
  });
};

// Critical CSS inlining (for production)
export const inlineCriticalCSS = (css) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// Resource hints
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
};

// Bundle size optimization
export const loadComponentsLazily = () => {
  // Dynamic imports for non-critical components
  const lazyComponents = {
    gallery: () => import('../components/GallerySection.jsx'),
    booking: () => import('../components/BookingSection.jsx'),
    testimonials: () => import('../components/TestimonialsSection.jsx')
  };

  return lazyComponents;
};

// Performance monitoring
export const measurePerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          request: perfData.responseStart - perfData.requestStart,
          response: perfData.responseEnd - perfData.responseStart,
          dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          load: perfData.loadEventEnd - perfData.loadEventStart,
          total: perfData.loadEventEnd - perfData.navigationStart
        };
        
        console.log('Performance Metrics:', metrics);
        
        // Send to analytics if needed
        // analytics.track('page_performance', metrics);
      }, 0);
    });
  }
};

