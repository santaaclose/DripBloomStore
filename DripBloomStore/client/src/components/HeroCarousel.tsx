import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/currency';
import type { Product } from '@shared/schema';

interface HeroCarouselProps {
  products: Product[];
}

interface CarouselSlide {
  imageUrl: string;
  product: Product;
  imageIndex: number;
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const [, setLocation] = useLocation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Create slides from all product images
  const slides: CarouselSlide[] = products.flatMap(product => 
    product.images.map((imageUrl, imageIndex) => ({
      imageUrl,
      product,
      imageIndex
    }))
  );

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;

    const autoPlay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(autoPlay);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const handleProductClick = (productId: string) => {
    setLocation(`/product/${productId}`);
  };

  if (!products.length || !slides.length) return null;

  return (
    <div className="relative overflow-hidden rounded-b-[40px] bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <div className="embla" ref={emblaRef} data-testid="hero-carousel">
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <motion.div
              key={`${slide.product.id}-${slide.imageIndex}`}
              className="embla__slide flex-shrink-0 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleProductClick(slide.product.id)}
                data-testid={`hero-slide-${slide.product.id}-${slide.imageIndex}`}
              >
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={`${slide.product.name} - Image ${slide.imageIndex + 1}`}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 image-high-quality"
                    style={{ 
                      objectFit: 'cover',
                      imageRendering: 'crisp-edges'
                    }}
                    data-testid={`img-hero-${slide.product.id}-${slide.imageIndex}`}
                  />
                  
                  {/* Enhanced overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  
                  {/* Product info overlay with proper padding */}
                  <div className="absolute bottom-8 left-0 right-0 text-white" style={{ padding: '8px 12px 16px' }}>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="max-w-sm mx-auto text-center md:text-left md:mx-0"
                    >
                      <h2 
                        className="text-lg md:text-xl lg:text-2xl font-bold leading-tight break-words hero-text-shadow"
                        data-testid={`text-hero-name-${slide.product.id}-${slide.imageIndex}`}
                        style={{
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(255, 255, 255, 0.2)',
                          lineHeight: '1.2'
                        }}
                      >
                        {slide.product.name}
                      </h2>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-white shadow-lg'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            data-testid={`carousel-indicator-${index}`}
          />
        ))}
      </div>
    </div>
  );
}