import { useState, useEffect } from 'react';

const useImagePreloader = (imageUrl) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      setImageError(true);
      return;
    }

    setIsLoading(true);
    setImageError(false);
    setImageLoaded(false);

    const img = new Image();
    
    const handleLoad = () => {
      setImageLoaded(true);
      setIsLoading(false);
      setImageError(false);
    };

    const handleError = () => {
      setImageError(true);
      setIsLoading(false);
      setImageLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    img.src = imageUrl;

    // Cleanup
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageUrl]);

  return { imageLoaded, imageError, isLoading };
};

export default useImagePreloader;
