import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyImageProps {
  src: string;
  alt: string;
  sx?: any;
  height?: number | string | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  width?: number | string;
  borderRadius?: number | string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  sx = {}, 
  height = 200, 
  width = '100%',
  borderRadius = 2 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={imgRef}
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius,
        ...sx
      }}
    >
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ position: 'absolute', top: 0, left: 0, borderRadius }}
        />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 1 : 0,
          }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </Box>
  );
};

export default LazyImage;
