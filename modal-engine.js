(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdButtonsId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing modal for Target ID: #${targetId}`);

    if (carrdButtonsId) {
      const buttonsList = document.getElementById(carrdButtonsId);
      
      if (buttonsList) {
        const listItems = buttonsList.querySelectorAll('li > a');
        let parsedButtons = [];
        
        if (listItems.length > 0) {
          
          // ==========================================
          // 🎨 THE STYLE SCRAPER: Steal Carrd's CSS
          // ==========================================
          const styleSource = listItems[0]; // Look at the first Carrd button
          const computed = window.getComputedStyle(styleSource);
          
          console.log(`${LOG_PREFIX} Scraping computed styles from Carrd...`);
          
          // Only overwrite background if Carrd actually set one
          if (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
            instanceConfig.buttonColor = computed.backgroundColor;
          } else {
            // Fallback if Carrd's background is on the parent <li> instead of the <a>
            const parentComputed = window.getComputedStyle(styleSource.parentElement);
            instanceConfig.buttonColor = parentComputed.backgroundColor;
          }

          instanceConfig.textColor = computed.color;
          instanceConfig.buttonFontSize = computed.fontSize;
          instanceConfig.buttonBorderRadius = computed.borderRadius;
          instanceConfig.buttonPaddingVertical = computed.paddingTop;
          instanceConfig.buttonPaddingHorizontal = computed.paddingLeft;
          // ==========================================

          // THE DATA SCRAPER
          listItems.forEach((btn) => {
            let url = btn.getAttribute('href') || "#";
            const labelEl = btn.querySelector('.label');
            const label = labelEl ? labelEl.textContent.trim() : '';
            const svgEl = btn.querySelector('svg');
            const svgHtml = svgEl ? svgEl.outerHTML : '';
            
            parsedButtons.push({ url, label, svgHtml });
          });

          instanceConfig.mainButton = parsedButtons[0];
          instanceConfig.links = parsedButtons.slice(1);
          console.log(`${LOG_PREFIX} Successfully scraped ${parsedButtons.length} buttons and their styles.`);
        }
      } else {
        console.error(`${LOG_PREFIX} FATAL: Could not find hidden buttons ID: #${carrdButtonsId}`);
      }
    }

    if (!document.getElementById(targetId)) {
      console.error(`${LOG_PREFIX} FATAL: Could not find Target HTML element: #${targetId}`);
      return;
    }

    // Initialize Vue
    new Vue({
      el: "#" + targetId,
      data: {
        config: instanceConfig,
        isOpen: false
      },
      computed: {
        cssVariables() {
          return {
            // These are now populated by the scraper!
            '--btn-bg': this.config.buttonColor || '#E4A074',
            '--btn-text': this.config.textColor || '#7C533A',
            '--btn-font-size': this.config.buttonFontSize || '18px',
            '--btn-pad-y': this.config.buttonPaddingVertical || '15px',
            '--btn-pad-x': this.config.buttonPaddingHorizontal || '20px',
            '--btn-radius': this.config.buttonBorderRadius || '8px',
            
            // This still comes from your Carrd embed config
            '--modal-bg': this.config.modalBackgroundColor || '#F4E6C8'
          }
        }
      },
      mounted() {
        // Teleport to body to break out of Carrd stacking contexts
        document.body.appendChild(this.$el);
      }
    });
  }

  // Engine Startup
  var queue = window.FaceifyModalQueue || [];
  queue.forEach(function(item) {
    createModal(item.targetId, item.carrdButtonsId, item.config);
  });

  window.FaceifyModalQueue = {
    push: function(item) {
      createModal(item.targetId, item.carrdButtonsId, item.config);
    }
  };
})();
