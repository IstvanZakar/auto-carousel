(function() {
  // Factory Function to build a unique Vue instance
  function createCarousel(targetId, galleryId, instanceConfig) {
    
    // THE SCRAPER: Check if a Carrd Gallery ID was provided
    if (galleryId) {
      const galleryElement = document.getElementById(galleryId);
      if (galleryElement) {
        const images = galleryElement.querySelectorAll('img');
        if (images.length > 0) {
          // Clear fallback slides and replace with scraped data
          instanceConfig.slides = [];
          images.forEach((img, idx) => {
            // Carrd often wraps gallery images in a link to the hi-res version.
            // We want the hi-res href if it exists, otherwise fallback to the thumbnail src.
            const hiResUrl = img.parentElement.tagName === 'A' ? img.parentElement.href : img.src;
            instanceConfig.slides.push({
              title: img.alt || "Gallery Image " + (idx + 1),
              image: hiResUrl
            });
          });
        }
      } else {
        console.warn("Faceify Widget: Could not find hidden gallery with ID ->", galleryId);
      }
    }

    // Initialize Vue for this specific Target ID
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
          // Fallback in case scraping failed and the array is empty
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

  // Process the command queue
  var queue = window.FaceifyCarouselQueue || [];
  queue.forEach(function(item) {
    createCarousel(item.targetId, item.galleryId, item.config);
  });

  // Hijack the queue so future pushes instantly execute
  window.FaceifyCarouselQueue = {
    push: function(item) {
      createCarousel(item.targetId, item.galleryId, item.config);
    }
  };
})();
