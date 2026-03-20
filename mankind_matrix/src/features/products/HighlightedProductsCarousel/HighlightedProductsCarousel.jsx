import React, { useEffect, useMemo, useRef } from 'react';
import Slider from 'react-slick';
import ProductHighlightCard from './ProductHighlightCard';
import useProducts from '../../../hooks/useProducts';
import './HighlightedProductsCarousel.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Memoize the ProductHighlightCard component
const MemoizedProductHighlightCard = React.memo(ProductHighlightCard);

const HighlightedProductsCarousel = React.memo(() => {
  const { 
    featuredProducts,
    loading, 
    error, 
    getFeaturedProducts 
  } = useProducts();
  
  const featuredLoading = loading.featured;

  // Use ref to track if data has been fetched
  const hasFetchedRef = useRef(false);
  const fetchTimeoutRef = useRef(null);

  // Fetch featured products only once on mount
  useEffect(() => {
    // Handle undefined featuredLoading as false
    const isLoading = featuredLoading === true;
    
    if (!hasFetchedRef.current && !isLoading) {
      // Use a small timeout to prevent double calls in StrictMode
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          hasFetchedRef.current = true;
          await getFeaturedProducts();
        } catch (err) {
          // Error is handled by the error state
          hasFetchedRef.current = false; // Reset on error to allow retry
        }
      }, 100);
    }
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [getFeaturedProducts, featuredLoading]); // Restored featuredLoading to dependencies

  // Memoize products array and calculations
  const { products } = useMemo(() => {
    const productsArray = Array.isArray(featuredProducts) ? featuredProducts : [];
    return {
      products: productsArray
    };
  }, [featuredProducts]);
  
  // Memoize slider settings
  const settings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true
        }
      }
    ]
  }), []);

  // Reference to the slider
  const sliderRef = useRef(null);

  // Memoize the main content
  const mainContent = useMemo(() => (
    <div className="highlighted-products-container">
      <Slider ref={sliderRef} {...settings}>
        {products.map(product => (
          <div key={product.id} className="carousel-item">
            <MemoizedProductHighlightCard product={product} />
          </div>
        ))}
      </Slider>
    </div>
  ), [products, settings]);

  // Memoize loading state
  const loadingContent = useMemo(() => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading featured products...</p>
    </div>
  ), []);

  // Memoize error state
  const errorContent = useMemo(() => (
    <div className="error-container">
      <h2>Error Loading Featured Products</h2>
      <p>{error}</p>
    </div>
  ), [error]);

  // Memoize empty state
  const emptyContent = useMemo(() => (
    <div className="product-not-found">
      <h2>No Featured Products</h2>
      <p>No featured products available at this time.</p>
    </div>
  ), []);

  // Return appropriate content based on state
  // Handle undefined featuredLoading as false
  if (featuredLoading === true) return loadingContent;
  if (error) return errorContent;
  if (!products.length) return emptyContent;
  return mainContent;
});

HighlightedProductsCarousel.displayName = 'HighlightedProductsCarousel';

export default HighlightedProductsCarousel;