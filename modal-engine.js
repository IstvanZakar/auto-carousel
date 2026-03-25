(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdButtonsId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing DOM Cloner for: #${targetId}`);

    if (carrdButtonsId) {
      const originalUl = document.getElementById(carrdButtonsId);
      
      if (originalUl) {
        // 1. Clone the entire UL (Keeps the ID intact so Carrd styles still apply!)
        const clonedUl = originalUl.cloneNode(true);
        
        // 2. Strip away common Carrd "hidden" animation classes
        clonedUl.classList.remove('deferred', 'is-deferred', 'hidden', 'onvisible');
        
        // 3. FIX: Force visibility ONLY on the wrapper, and LEAVE TRANSFORM ALONE! 🚨
        clonedUl.style.setProperty('opacity', '1', 'important');
        clonedUl.style.setProperty('visibility', 'visible', 'important');
        clonedUl.style.setProperty('display', 'flex', 'important');
        
        // 4. Force visibility on ALL child elements (li, a, svg, span)
        const allNodes = clonedUl.querySelectorAll('*');
        allNodes.forEach(node => {
          if (node.style) {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
            node.style.setProperty('transform', 'none', 'important');
            node.style.setProperty('pointer-events', 'auto', 'important');
          }
        });

        const listItems = clonedUl.querySelectorAll('li');

        if (listItems.length > 0) {
          // 5. Build the Trigger Button HTML
          const triggerUl = clonedUl.cloneNode(false); // Copies the sanitized UL wrapper
          const triggerLi = listItems[0].cloneNode(true); 
          
          const triggerA = triggerLi.querySelector('a');
          if (triggerA) {
            // Prevent the trigger button from navigating away
            triggerA.setAttribute('href', 'javascript:void(0);');
          }
          
          triggerUl.appendChild(triggerLi);
          instanceConfig.triggerHtml = triggerUl.outerHTML;

          // 6. Build the Modal Links HTML
          clonedUl.removeChild(listItems[0]); 
          instanceConfig.modalHtml = clonedUl.outerHTML;

          console.log(`${LOG_PREFIX} Successfully cloned Carrd DOM and forced visibility.`);
        } else {
          console.warn(`${LOG_PREFIX} Element #${carrdButtonsId} found, but no links inside.`);
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
    console.log(`${LOG_PREFIX} Vue instance successfully mounted!`);
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
