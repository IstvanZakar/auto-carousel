(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdButtonsId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing modal for Target ID: #${targetId}`);

    // THE SCRAPER
    if (carrdButtonsId) {
      console.log(`${LOG_PREFIX} Searching DOM for hidden buttons ID: #${carrdButtonsId}`);
      const buttonsList = document.getElementById(carrdButtonsId);
      
      if (buttonsList) {
        const listItems = buttonsList.querySelectorAll('li > a');
        let parsedButtons = [];
        
        listItems.forEach((btn) => {
          let url = btn.getAttribute('href') || "#";
          const labelEl = btn.querySelector('.label');
          const label = labelEl ? labelEl.textContent.trim() : '';
          const svgEl = btn.querySelector('svg');
          const svgHtml = svgEl ? svgEl.outerHTML : '';
          
          parsedButtons.push({ url, label, svgHtml });
        });

        if (parsedButtons.length > 0) {
          instanceConfig.mainButton = parsedButtons[0];
          instanceConfig.links = parsedButtons.slice(1);
          console.log(`${LOG_PREFIX} Successfully scraped ${parsedButtons.length} buttons.`);
        } else {
          console.warn(`${LOG_PREFIX} Found #${carrdButtonsId} but it contains no links.`);
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
            '--btn-bg': this.config.buttonColor,
            '--btn-text': this.config.textColor,
            '--modal-bg': this.config.modalBackgroundColor,
            '--btn-font-size': this.config.buttonFontSize,
            '--btn-pad-y': this.config.buttonPaddingVertical,
            '--btn-pad-x': this.config.buttonPaddingHorizontal,
            '--btn-radius': this.config.buttonBorderRadius
          }
        }
      }
    });
    console.log(`${LOG_PREFIX} Vue instance successfully mounted on #${targetId}`);
  }

  // Engine Startup
  console.log(`${LOG_PREFIX} Engine Loaded. Processing Command Queue...`);
  var queue = window.FaceifyModalQueue || [];
  
  queue.forEach(function(item) {
    createModal(item.targetId, item.carrdButtonsId, item.config);
  });

  // Hijack the queue for future dynamic injections
  window.FaceifyModalQueue = {
    push: function(item) {
      console.log(`${LOG_PREFIX} New embed detected! Pushing to factory...`);
      createModal(item.targetId, item.carrdButtonsId, item.config);
    }
  };
})();