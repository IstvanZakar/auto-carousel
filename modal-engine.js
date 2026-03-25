(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdTargetId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing Cloner for: #${targetId}`);

    if (carrdTargetId) {
      const originalNode = document.getElementById(carrdTargetId);
      
      if (originalNode) {
        // 1. Clone the node
        const clonedNode = originalNode.cloneNode(true);
        
        // ==========================================
        // 🧹 THE ULTIMATE LAYOUT SANITIZER 🧹
        // ==========================================
        const layoutNodes = [clonedNode, ...clonedNode.querySelectorAll('div, ul')];
        
        layoutNodes.forEach(node => {
          node.classList.remove('hidden', 'deferred', 'is-deferred', 'onvisible');
          if (node.style) {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
            node.style.setProperty('transform', 'none', 'important');
            
            // 1. Nuke the gray box (Stripping colors, gradients, and shadows)
            node.style.setProperty('background-color', 'transparent', 'important');
            node.style.setProperty('background', 'transparent', 'important');
            node.style.setProperty('background-image', 'none', 'important'); 
            node.style.setProperty('box-shadow', 'none', 'important');
            
            // 2. Force wrappers to expand
            node.style.setProperty('width', '100%', 'important');
          }
        });
        // ==========================================

        const ul = clonedNode.tagName.toLowerCase() === 'ul' ? clonedNode : clonedNode.querySelector('ul');

        if (ul) {
          // Force the UL to stack properly and stretch
          ul.style.setProperty('display', 'flex', 'important');
          ul.style.setProperty('flex-direction', 'column', 'important');
          ul.style.setProperty('width', '100%', 'important');
          ul.style.setProperty('padding', '0', 'important'); 
          ul.style.setProperty('margin', '0', 'important');

          const listItems = ul.querySelectorAll('li');

          if (listItems.length > 0) {
            // Force EVERY individual button to stretch to the edges
            listItems.forEach(li => {
                if (li.style) {
                    li.style.setProperty('width', '100%', 'important');
                }
            });

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
            instanceConfig.modalHtml = clonedNode.outerHTML;

            console.log(`${LOG_PREFIX} Successfully sanitized layouts and stretched buttons!`);
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
    createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config); 
  });

  window.FaceifyModalQueue = {
    push: function(item) {
      createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config);
    }
  };
})();
