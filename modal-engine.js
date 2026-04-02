(function() {
  
  function createModal(targetId, carrdTargetId, instanceConfig) {

    if (carrdTargetId) {
      const originalNode = document.getElementById(carrdTargetId);
      
      if (originalNode) {
        // 1. SELECT THE WRAPPER
        const wrapper = originalNode.querySelector('.wrapper') || originalNode;
        const computedStyle = window.getComputedStyle(wrapper);
        
       
        // 2. SCRAPE THE WIDTH
        // We look for max-width (Carrd's favorite) first, then fallback to width.
        let cssWidth = computedStyle.maxWidth !== 'none' ? computedStyle.maxWidth : computedStyle.width;
        let finalPixelWidth = 0;

        if (cssWidth && cssWidth.includes('px')) {
            finalPixelWidth = parseFloat(cssWidth);
        } else if (cssWidth && cssWidth.includes('rem')) {
            finalPixelWidth = parseFloat(cssWidth) * 16;
        }

        // 3. APPLY OVERRIDE OR FALLBACK
        // If the section break killed the width (reported as 0 or 100%), 
        // we use the preferredWidth from your HTML config or a safe 684px.
        if (instanceConfig.preferredWidth) {
            finalPixelWidth = instanceConfig.preferredWidth;
        } else if (finalPixelWidth < 50) {
            finalPixelWidth = 684; 
        }

        // 4. FINAL CALCULATION
        // We take the button width + 40px (for your 20px + 20px beige box padding)
        const totalModalWidth = Math.ceil(finalPixelWidth) + 40;
        instanceConfig.dynamicMaxWidth = totalModalWidth + 'px';

        // 5. CLONE AND SANITIZE
        const clonedNode = originalNode.cloneNode(true);
        
        // Assassinate Carrd's hidden background layers
        const bgLayers = clonedNode.querySelectorAll('.bg, .container-bg, .wrapper-bg, [class*="-bg"]');
        bgLayers.forEach(bg => bg.remove());
        
        // Wake up layout wrappers and strip their internal "gutters"
        const layoutNodes = [clonedNode, ...clonedNode.querySelectorAll('div, ul')];
        layoutNodes.forEach(node => {
          node.classList.remove('hidden', 'deferred', 'is-deferred', 'onvisible');
          if (node.style) {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
            node.style.setProperty('transform', 'none', 'important');
            node.style.setProperty('background', 'transparent', 'important');
            node.style.setProperty('box-shadow', 'none', 'important');
            node.style.setProperty('padding', '0', 'important');
            node.style.setProperty('margin', '0', 'important');
            node.style.setProperty('width', '100%', 'important');
          }
        });

        // 6. TARGET THE BUTTON LIST (UL)
        const ul = clonedNode.tagName.toLowerCase() === 'ul' ? clonedNode : clonedNode.querySelector('ul');

        if (ul) {
          ul.style.setProperty('display', 'flex', 'important');
          ul.style.setProperty('flex-direction', 'column', 'important');
          ul.style.setProperty('align-items', 'stretch', 'important'); 
          ul.style.setProperty('width', '100%', 'important');

          const listItems = ul.querySelectorAll('li');
          if (listItems.length > 0) {
            // Force the actual links to stretch
            const links = ul.querySelectorAll('a');
            links.forEach(link => {
                if (link.style) {
                    link.style.setProperty('width', '100%', 'important');
                    link.style.setProperty('box-sizing', 'border-box', 'important');
                }
            });

            // Extract the Trigger Button
            const triggerUl = ul.cloneNode(false); 
            const triggerLi = listItems[0].cloneNode(true); 
            const triggerA = triggerLi.querySelector('a');
            if (triggerA) triggerA.setAttribute('href', 'javascript:void(0);');
            
            triggerUl.appendChild(triggerLi);
            instanceConfig.triggerHtml = triggerUl.outerHTML;

            // Remove trigger from modal content
            listItems[0].remove(); 
            instanceConfig.modalHtml = clonedNode.outerHTML;
          }
        }
      }
    }

    // ==========================================
    // NEW: Inject Button into the Remote Control
    // ==========================================
    // (item is passed in from the queue below)
    const queueItem = window.FaceifyModalQueue.find(q => q.targetId === targetId);
    if (queueItem && queueItem.triggerId) {
        const triggerDiv = document.getElementById(queueItem.triggerId);
        if (triggerDiv && instanceConfig.triggerHtml) {
            triggerDiv.innerHTML = instanceConfig.triggerHtml;
        }
    }

    if (!document.getElementById(targetId)) return;

    // 7. INITIALIZE VUE
    const vm = new Vue({
      el: "#" + targetId,
      data: { config: instanceConfig, isOpen: false },
      computed: {
        cssVariables() {
          return {
            '--modal-bg': this.config.modalBackgroundColor || '#F4E6C8',
            '--modal-max-width': this.config.dynamicMaxWidth
          }
        }
      }
      // Note: You can completely delete the mounted() / appendChild script now!
    });

    // ==========================================
    // NEW: Expose Vue to Window
    // ==========================================
    window.FaceifyModals = window.FaceifyModals || {};
    window.FaceifyModals[targetId] = vm;
  }

  // QUEUE HANDLING
  var queue = window.FaceifyModalQueue || [];
  queue.forEach(item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config));
  window.FaceifyModalQueue = { push: item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config) };
})();

    // 7. INITIALIZE VUE
    new Vue({
      el: "#" + targetId,
      data: { config: instanceConfig, isOpen: false },
      computed: {
        cssVariables() {
          return {
            '--modal-bg': this.config.modalBackgroundColor || '#F4E6C8',
            '--modal-max-width': this.config.dynamicMaxWidth
          }
        }
      }
    });
  }

  // QUEUE HANDLING
  var queue = window.FaceifyModalQueue || [];
  queue.forEach(item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config));
  window.FaceifyModalQueue = { push: item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config) };
})();
