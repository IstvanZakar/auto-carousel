(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  function createModal(targetId, carrdTargetId, instanceConfig) {
    if (carrdTargetId) {
      const originalNode = document.getElementById(carrdTargetId);
      
      if (originalNode) {
        // 🚨 TARGET: THE WRAPPER 🚨
        // We look for the '.wrapper' div to find the hardcoded width
        const wrapper = originalNode.querySelector('.wrapper') || originalNode;
        const computedStyle = window.getComputedStyle(wrapper);
        
        // Carrd often puts the width in 'width' or 'max-width'
        let cssWidth = computedStyle.maxWidth !== 'none' ? computedStyle.maxWidth : computedStyle.width;
        
        let finalPixelWidth = 504; // Default fallback
        
        if (cssWidth && cssWidth.includes('px')) {
            finalPixelWidth = parseFloat(cssWidth);
        } else if (cssWidth && cssWidth.includes('rem')) {
            finalPixelWidth = parseFloat(cssWidth) * 16;
        }

        // If the section break killed the width (0px), we use the default
        if (finalPixelWidth < 50) finalPixelWidth = 504;

        // Add 80px for modal padding (40px each side)
        instanceConfig.dynamicMaxWidth = Math.ceil(finalPixelWidth) + 80 + 'px';
        
        const clonedNode = originalNode.cloneNode(true);
        
        // Kill Backgrounds
        const bgLayers = clonedNode.querySelectorAll('.bg, .container-bg, .wrapper-bg, [class*="-bg"]');
        bgLayers.forEach(bg => bg.remove());
        
        // Sanitize Layouts
        const layoutNodes = [clonedNode, ...clonedNode.querySelectorAll('div, ul')];
        layoutNodes.forEach(node => {
          node.classList.remove('hidden', 'deferred', 'is-deferred', 'onvisible');
          if (node.style) {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
            node.style.setProperty('transform', 'none', 'important');
            node.style.setProperty('background', 'transparent', 'important');
            node.style.setProperty('box-shadow', 'none', 'important');

            // 🚨 THE FIX: Nuke Carrd's internal padding/margins 🚨
            // This prevents the "50px too short" issue!
            node.style.setProperty('padding', '0', 'important');
            node.style.setProperty('margin', '0', 'important');
            node.style.setProperty('width', '100%', 'important');
            node.style.setProperty('max-width', '100%', 'important');
          }
        });

        const ul = clonedNode.tagName.toLowerCase() === 'ul' ? clonedNode : clonedNode.querySelector('ul');

        if (ul) {
          ul.style.setProperty('display', 'flex', 'important');
          ul.style.setProperty('flex-direction', 'column', 'important');
          ul.style.setProperty('align-items', 'stretch', 'important'); 
          ul.style.setProperty('width', '100%', 'important');

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
            if (triggerA) triggerA.setAttribute('href', 'javascript:void(0);');
            
            triggerUl.appendChild(triggerLi);
            instanceConfig.triggerHtml = triggerUl.outerHTML;
            listItems[0].remove(); 
            instanceConfig.modalHtml = clonedNode.outerHTML;
          }
        }
      }
    }

    if (!document.getElementById(targetId)) return;

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

  var queue = window.FaceifyModalQueue || [];
  queue.forEach(item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config));
  window.FaceifyModalQueue = { push: item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config) };
})();
