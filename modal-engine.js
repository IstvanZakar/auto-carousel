(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdTargetId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing Cloner for: #${targetId}`);

    if (carrdTargetId) {
      const originalNode = document.getElementById(carrdTargetId);
      
      if (originalNode) {
        // 1. Clone the entire node (Works whether you target a Container OR Buttons directly)
        const clonedNode = originalNode.cloneNode(true);
        
        // ==========================================
        // 🧹 THE LAYOUT SANITIZER 🧹
        // Target only structural wrappers (divs and uls). 
        // We completely ignore 'li' and 'a' tags to protect the hover animations!
        // ==========================================
        const layoutNodes = [clonedNode, ...clonedNode.querySelectorAll('div, ul')];
        
        layoutNodes.forEach(node => {
          // 1. Wake up every layout layer (Fixes the .inner opacity issue)
          node.classList.remove('hidden', 'deferred', 'is-deferred', 'onvisible');
          if (node.style) {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
            node.style.setProperty('transform', 'none', 'important');
            
            // 2. Kill the Black Hole! (Strip any inherited Carrd backgrounds)
            node.style.setProperty('background-color', 'transparent', 'important');
            node.style.setProperty('background', 'transparent', 'important');
          }
        });
        // ==========================================

        // Find the actual button list, whether it's the root node or nested inside a container
        const ul = clonedNode.tagName.toLowerCase() === 'ul' ? clonedNode : clonedNode.querySelector('ul');

        if (ul) {
          ul.style.setProperty('display', 'flex', 'important');

          const listItems = ul.querySelectorAll('li');

          if (listItems.length > 0) {
            // Extract the Trigger Button
            const triggerUl = ul.cloneNode(false); 
            const triggerLi = listItems[0].cloneNode(true); 
            
            const triggerA = triggerLi.querySelector('a');
            if (triggerA) {
              triggerA.setAttribute('href', 'javascript:void(0);');
            }
            
            triggerUl.appendChild(triggerLi);
            instanceConfig.triggerHtml = triggerUl.outerHTML;

            // Build the Modal Content 
            listItems[0].remove(); 
            
            // Use the sanitized clonedNode (which could be the UL or the Container)
            instanceConfig.modalHtml = clonedNode.outerHTML;

            console.log(`${LOG_PREFIX} Successfully sanitized layouts and cloned buttons!`);
          }
        } else {
          console.warn(`${LOG_PREFIX} Found #${carrdTargetId}, but no UL inside.`);
        }
      } else {
        console.error(`${LOG_PREFIX} FATAL: Could not find Target ID: #${carrdTargetId}`);
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
    // Note: Kept the variable name carrdButtonsId in your embed config for compatibility
    createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config); 
  });

  window.FaceifyModalQueue = {
    push: function(item) {
      createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config);
    }
  };
})();
