(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdTargetId, instanceConfig) {
    console.log(`${LOG_PREFIX} Initializing Cloner for: #${targetId}`);

    if (carrdTargetId) {
      const originalNode = document.getElementById(carrdTargetId);
      
      if (originalNode) {
        
        // 🚨 NEW: MEASURE THE ORIGINAL NODE! 🚨
        // We measure it, and add 60px to account for the padding inside the popup box.
        const exactWidth = originalNode.getBoundingClientRect().width;
        instanceConfig.dynamicMaxWidth = Math.ceil(exactWidth) + 60 + 'px';
        
        // 1. Clone the node
        const clonedNode = originalNode.cloneNode(true);
        
        // ==========================================
        // 🔪 THE CARRD ASSASSIN 🔪
        // ==========================================
        const bgLayers = clonedNode.querySelectorAll('.bg, .container-bg, .wrapper-bg, [class*="-bg"]');
        bgLayers.forEach(bg => bg.remove());
        
        const layoutNodes = [clonedNode, ...clonedNode.querySelectorAll('div, ul')];
        layoutNodes.forEach(node => {
          node.classList.remove('hidden', 'deferred', 'is-deferred', 'onvisible');
          if (node.style) {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
            node.style.setProperty('transform', 'none', 'important');
            node.style.setProperty('background', 'transparent', 'important');
            node.style.setProperty('box-shadow', 'none', 'important');
          }
        });
        // ==========================================

        const ul = clonedNode.tagName.toLowerCase() === 'ul' ? clonedNode : clonedNode.querySelector('ul');

        if (ul) {
          ul.style.setProperty('display', 'flex', 'important');
          ul.style.setProperty('flex-direction', 'column', 'important');
          ul.style.setProperty('align-items', 'stretch', 'important'); 
          ul.style.setProperty('width', '100%', 'important');
          ul.style.setProperty('padding', '0', 'important'); 
          ul.style.setProperty('margin', '0', 'important');

          const listItems = ul.querySelectorAll('li');

          if (listItems.length > 0) {
            const links = ul.querySelectorAll('a');
            links.forEach(link => {
                if (link.style) {
                    link.style.setProperty('width', '100%', 'important');
                    link.style.setProperty('box-sizing', 'border-box', 'important');
                }
            });

            const triggerUl = ul.cloneNode(false); 
            const triggerLi = listItems[0].cloneNode(true); 
            
            const triggerA = triggerLi.querySelector('a');
            if (triggerA) {
              triggerA.setAttribute('href', 'javascript:void(0);');
            }
            
            triggerUl.appendChild(triggerLi);
            instanceConfig.triggerHtml = triggerUl.outerHTML;

            listItems[0].remove(); 
            instanceConfig.modalHtml = clonedNode.outerHTML;

            console.log(`${LOG_PREFIX} Successfully cloned buttons and scraped width: ${exactWidth}px`);
          }
        }
      }
    }

    if (!document.getElementById(targetId)) return;

    new Vue({
      el: "#" + targetId,
      data: {
        config: instanceConfig,
        isOpen: false
      },
      computed: {
        cssVariables() {
          return {
            '--modal-bg': this.config.modalBackgroundColor || '#F4E6C8',
            // 🚨 NEW: INJECT THE SCRAPED WIDTH INTO VUE! 🚨
            '--modal-max-width': this.config.dynamicMaxWidth || '600px'
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
