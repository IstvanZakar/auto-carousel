(function() {
  const LOG_PREFIX = "[Faceify Widget]";

  function createCarousel(targetId, galleryId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing carousel for Target ID: #${targetId}`);

    // THE SCRAPER
    if (galleryId) {
      console.log(`${LOG_PREFIX} Searching DOM for hidden gallery ID: #${galleryId}`);
      const galleryElement = document.getElementById(galleryId);
      
      if (galleryElement) {
        const images = galleryElement.querySelectorAll('img');
        console.log(`${LOG_PREFIX} Found ${images.length} image nodes in gallery.`);
        
        if (images.length > 0) {
          instanceConfig.slides = []; // Clear the fallback array
          let validImageCount = 0;
          
          images.forEach((img, idx) => {
            let validUrl = "";
            
            // 1. Check for Carrd's lazy-loading attribute
            if (img.hasAttribute('data-src') && img.getAttribute('data-src') !== "") {
              validUrl = new URL(img.getAttribute('data-src'), window.location.href).href;
            } 
            // 2. Fallback to standard src
            else if (img.getAttribute('src') && img.getAttribute('src') !== "") {
              validUrl = img.src;
            }

            // 3. Validation: Ensure it's not pointing to the root domain
            if (validUrl && validUrl !== window.location.href && !validUrl.endsWith("/")) {
              validImageCount++;
              instanceConfig.slides.push({
                title: img.alt && img.alt !== "Untitled" ? img.alt : "Image " + (idx + 1),
                image: validUrl
              });
              console.log(`${LOG_PREFIX} Loaded Image ${validImageCount}:`, validUrl);
            } else {
              console.warn(`${LOG_PREFIX} Skipped invalid or empty image URL at index ${idx}`);
            }
          });
          
          console.log(`${LOG_PREFIX} Successfully loaded ${validImageCount} valid images into the config.`);
        } else {
          console.warn(`${LOG_PREFIX} Gallery #${galleryId} exists but contains no <img> tags.`);
        }
      } else {
        console.error(`${LOG_PREFIX} FATAL: Could not find hidden gallery ID: #${galleryId} on the page.`);
      }
    }

    // Initialize Vue
    if (!document.getElementById(targetId)) {
      console.error(`${LOG_PREFIX} FATAL: Could not find Target HTML element: #${targetId}. Vue cannot mount.`);
      return; 
    }

    console.log(`${LOG_PREFIX} Mounting Vue instance to #${targetId}...`);
    
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
          if (!this.config.slides || this.config.slides.length === 0) {
            console.warn(`${LOG_PREFIX} Vue is rendering with an empty slides array.`);
            return [];
          }
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
        console.log(`${LOG_PREFIX} Vue instance successfully mounted on #${targetId}`);
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

  // Engine Startup
  console.log(`${LOG_PREFIX} Engine Loaded. Processing Command Queue...`);
  var queue = window.FaceifyCarouselQueue || [];
  
  if (queue.length === 0) {
    console.log(`${LOG_PREFIX} Queue is empty. Waiting for Carrd to inject embeds.`);
  }

  queue.forEach(function(item) {
    createCarousel(item.targetId, item.galleryId, item.config);
  });

  // Hijack the queue so future pushes instantly execute
  window.FaceifyCarouselQueue = {
    push: function(item) {
      console.log(`${LOG_PREFIX} New embed detected on the fly! Pushing to factory...`);
      createCarousel(item.targetId, item.galleryId, item.config);
    }
  };
})();
