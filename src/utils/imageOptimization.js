// Image optimization utilities for better performance

export const optimizeImage = (src, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 85,
    format = 'webp'
  } = options;

  // For production, this would integrate with a service like Cloudinary or ImageKit
  // For now, we'll use browser-native lazy loading and responsive images
  return {
    src,
    srcSet: `${src} 1x, ${src} 2x`,
    loading: 'lazy',
    decoding: 'async',
    style: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover'
    }
  };
};

export const createImagePlaceholder = (width, height) => {
  // Create a low-quality placeholder for better perceived performance
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a gradient placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f5e6d3');
  gradient.addColorStop(1, '#e8d5c4');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  }
};

export const preloadCriticalImages = (imagePaths) => {
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
};

