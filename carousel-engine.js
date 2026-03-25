(function() {
  function createCarousel(targetId, galleryId, instanceConfig) {
    
    // THE SCRAPER: Tailored specifically for Carrd's lazy-loaded galleries
    if (galleryId) {
      const galleryElement = document.getElementById(galleryId);
      if (galleryElement) {
        const images = galleryElement.querySelectorAll('img');
        if (images.length > 0) {
          instanceConfig.slides = []; // Clear the fallback array
          
          images.forEach((img, idx) => {
            let validUrl = "";
            
            // Check for Carrd's data-src attribute (lazy loading)
            if (img.hasAttribute('data-src') && img.getAttribute('data-src') !== "") {
              // Convert the relative path into a fully qualified absolute URL
              validUrl = new URL(img.getAttribute('data-src'), window.location.href).href;
            } 
            // Fallback to standard src if lazy loading is off
            else if (img.getAttribute('src') && img.getAttribute('src') !== "") {
              validUrl = img.src;
            }

            // Ensure the URL isn't broken or pointing to the root domain
            if (validUrl && validUrl !== window.location.href && !validUrl.endsWith("/")) {
              instanceConfig.slides.push({
                title: img.alt && img.alt !== "Untitled" ? img.alt : "Image " + (idx + 1),
                image: validUrl
              });
            }
          });
        }
      } else {
        console.warn("Faceify Carousel: Could not find hidden gallery ID: " + galleryId);
      }
    }

    new Vue({
      el: "#" + targetId,
      data: {
        config: instanceConfig,
        lightboxOpen: false,
        currentLightboxImage: '',
        percentX: 0,
        isHovered: false,
        isDragging: false,
        startX: 0,
        draggedDistance: 0,
        animationFrameId: null,
      },
      computed: {
        cssVariables() {
          return {
            '--bg-color': this.config.backgroundColor,
            '--text-color': this.config.textColor,
            '--separator-color': this.config.separatorColor,
            '--separator-width': this.config.separatorWidth,
            '--title-size': this.config.titleFontSize,
            '--aspect-ratio': this.config.imageAspectRatio,
            '--image-padding': this.config.imagePadding,
            '--container-radius': this.config.containerRadius,
            '--image-radius': this.config.imageRadius
          }
        },
        duplicatedSlides() {
          if (!this.config.slides || this.config.slides.length === 0) return [];
          return [...this.config.slides, ...this.config.slides];
        },
        trackStyle() {
          if (this.duplicatedSlides.length === 0) return { width: '100%' };
          return { width: `calc(100% * (${this.duplicatedSlides.length} / ${this.config.visibleImages}))` };
        },
        itemStyle() {
          if (this.duplicatedSlides.length === 0) return { width: '100%' };
          return { width: `calc(100% / ${this.duplicatedSlides.length})` };
        }
      },
      methods: {
        animate() {
          if (!this.isHovered && !this.isDragging) {
            this.percentX -= this.config.speed;
          }
          if (this.percentX <= -50) this.percentX += 50;
          if (this.percentX > 0) this.percentX -= 50;
          this.animationFrameId = requestAnimationFrame(this.animate);
        },
        startDrag(e) {
          this.isDragging = true;
          this.draggedDistance = 0;
          this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        },
        onDrag(e) {
          if (!this.isDragging) return;
          const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
          const deltaX = currentX - this.startX;
          this.draggedDistance += Math.abs(deltaX);
          const trackWidthInPixels = this.$refs.track.offsetWidth;
          const deltaPercent = (deltaX / trackWidthInPixels) * 100;
          this.percentX += deltaPercent;
          this.startX = currentX;
        },
        endDrag() {
          this.isDragging = false;
          this.isHovered = false;
        },
        handleSlideClick(imageUrl) {
          if (this.draggedDistance > 5) return;
          this.openLightbox(imageUrl);
        },
        openLightbox(imageUrl) {
          this.currentLightboxImage = imageUrl;
          this.lightboxOpen = true;
        },
        closeLightbox() {
          this.lightboxOpen = false;
          this.currentLightboxImage = '';
        }
      },
      mounted() {
        if (this.duplicatedSlides.length > 0) {
          this.animationFrameId = requestAnimationFrame(this.animate);
        }
      },
      beforeDestroy() {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
      }
    });
  }

  var queue = window.FaceifyCarouselQueue || [];
  queue.forEach(function(item) {
    createCarousel(item.targetId, item.galleryId, item.config);
  });

  window.FaceifyCarouselQueue = {
    push: function(item) {
      createCarousel(item.targetId, item.galleryId, item.config);
    }
  };
})();
