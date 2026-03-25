(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdButtonsId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing DOM Cloner for: #${targetId}`);

    if (carrdButtonsId) {
      const originalUl = document.getElementById(carrdButtonsId);
      
      if (originalUl) {
        // 1. Clone the entire UL so we don't destroy the hidden original
        const clonedUl = originalUl.cloneNode(true);
        const listItems = clonedUl.querySelectorAll('li');

        if (listItems.length > 0) {
          // 2. Build the Trigger Button HTML
          const triggerUl = clonedUl.cloneNode(false); // Copies the UL wrapper and its classes, but empty
          const triggerLi = listItems[0].cloneNode(true); // Copies the first item
          
          const triggerA = triggerLi.querySelector('a');
          if (triggerA) {
            // Swap the href so it doesn't navigate away, but keeps hover effects!
            triggerA.setAttribute('href', 'javascript:void(0);');
          }
          triggerUl.appendChild(triggerLi);
          instanceConfig.triggerHtml = triggerUl.outerHTML;

          // 3. Build the Modal Links HTML
          clonedUl.removeChild(listItems[0]); // Remove the first item from the modal list
          instanceConfig.modalHtml = clonedUl.outerHTML;

          console.log(`${LOG_PREFIX} Successfully cloned Carrd DOM structure.`);
        }
      } else {
        console.error(`${LOG_PREFIX} FATAL: Could not find hidden Carrd list: #${carrdButtonsId}`);
      }
    }

    if (!document.getElementById(targetId)) {
      console.error(`${LOG_PREFIX} FATAL: Target #${targetId} not found.`);
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
            '--modal-bg': this.config.modalBackgroundColor || '#F4E6C8'
          }
        }
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
