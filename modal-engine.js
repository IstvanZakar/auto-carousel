(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdContainerId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing Container Cloner for: #${targetId}`);

    if (carrdContainerId) {
      const originalContainer = document.getElementById(carrdContainerId);
      
      if (originalContainer) {
        // 1. Clone the ENTIRE Carrd Container
        const clonedContainer = originalContainer.cloneNode(true);
        
        // 2. Wake the Container up! (Strip Carrd's hidden wrapper classes)
        clonedContainer.classList.remove('hidden', 'deferred', 'is-deferred', 'onvisible');
        clonedContainer.style.setProperty('display', 'flex', 'important');
        clonedContainer.style.setProperty('opacity', '1', 'important');
        clonedContainer.style.setProperty('visibility', 'visible', 'important');
        
        // Ensure it centers itself beautifully inside your modal box
        clonedContainer.style.setProperty('margin', '0 auto', 'important'); 
        clonedContainer.style.setProperty('padding', '0', 'important'); 

        // 3. Find the button list inside the cloned container
        const ul = clonedContainer.querySelector('ul');

        if (ul) {
          const listItems = ul.querySelectorAll('li');

          if (listItems.length > 0) {
            // 4. Extract the Trigger Button
            const triggerUl = ul.cloneNode(false); 
            const triggerLi = listItems[0].cloneNode(true); 
            
            const triggerA = triggerLi.querySelector('a');
            if (triggerA) {
              triggerA.setAttribute('href', 'javascript:void(0);');
            }
            
            triggerUl.appendChild(triggerLi);
            instanceConfig.triggerHtml = triggerUl.outerHTML;

            // 5. Build the Modal Content (The Container minus the first button)
            listItems[0].remove(); 
            instanceConfig.modalHtml = clonedContainer.outerHTML;

            console.log(`${LOG_PREFIX} Successfully cloned Carrd Container!`);
          }
        } else {
          console.warn(`${LOG_PREFIX} Found #${carrdContainerId}, but no UL inside.`);
        }
      } else {
        console.error(`${LOG_PREFIX} FATAL: Could not find Container ID: #${carrdContainerId}`);
      }
    }

    if (!document.getElementById(targetId)) {
      console.error(`${LOG_PREFIX} FATAL: Target #${targetId} not found.`);
      return;
    }

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

  var queue = window.FaceifyModalQueue || [];
  queue.forEach(function(item) {
    createModal(item.targetId, item.carrdContainerId, item.config);
  });

  window.FaceifyModalQueue = {
    push: function(item) {
      createModal(item.targetId, item.carrdContainerId, item.config);
    }
  };
})();
