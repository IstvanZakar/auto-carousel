(function() {
  const LOG_PREFIX = "[Faceify Modal]";

  // Added 'triggerClass' to the arguments
  function createModal(targetId, carrdTargetId, instanceConfig, triggerClass) {
    console.log(`${LOG_PREFIX} Initializing Cloner for: #${targetId}`);

    if (carrdTargetId) {
      const originalNode = document.getElementById(carrdTargetId);
      
      if (originalNode) {
        // 1. SELECT THE WRAPPER & SCRAPE WIDTH
        const wrapper = originalNode.querySelector('.wrapper') || originalNode;
        const computedStyle = window.getComputedStyle(wrapper);
        
        let cssWidth = computedStyle.maxWidth !== 'none' ? computedStyle.maxWidth : computedStyle.width;
        let finalPixelWidth = 0;

        if (cssWidth && cssWidth.includes('px')) {
            finalPixelWidth = parseFloat(cssWidth);
        } else if (cssWidth && cssWidth.includes('rem')) {
            finalPixelWidth = parseFloat(cssWidth) * 16;
        }

        if (instanceConfig.preferredWidth) {
            finalPixelWidth = instanceConfig.preferredWidth;
        } else if (finalPixelWidth < 50) {
            finalPixelWidth = 684; 
        }

        const totalModalWidth = Math.ceil(finalPixelWidth) + 40;
        instanceConfig.dynamicMaxWidth = totalModalWidth + 'px';

        // 2. CLONE AND SANITIZE
        const clonedNode = originalNode.cloneNode(true);
        
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
            node.style.setProperty('padding', '0', 'important');
            node.style.setProperty('margin', '0', 'important');
            node.style.setProperty('width', '100%', 'important');
          }
        });

        // 3. TARGET THE BUTTON LIST (UL)
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

            // Extract the Trigger Button
            const triggerUl = ul.cloneNode(false); 
            const triggerLi = listItems[0].cloneNode(true); 
            const triggerA = triggerLi.querySelector('a');
            // Neutralize the cloned link so our onclick wrapper handles the event
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
    // 4. INJECT BUTTON INTO ALL REMOTE CONTROLS
    // ==========================================
    if (triggerClass && instanceConfig.triggerHtml) {
        // Find every element on the page with this class
        const triggerDivs = document.querySelectorAll('.' + triggerClass);
        
        triggerDivs.forEach(div => {
            div.innerHTML = instanceConfig.triggerHtml;
            console.log(`${LOG_PREFIX} Injected remote control button into .${triggerClass}`);
        });
    }

    // Safety check: Make sure the Central Hub actually exists on the page
    if (!document.getElementById(targetId)) return;

    // ==========================================
    // 5. INITIALIZE CENTRAL VUE MODAL
    // ==========================================
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
    });

    // ==========================================
    // 6. EXPOSE VUE TO WINDOW FOR REMOTE CONTROLS
    // ==========================================
    window.FaceifyModals = window.FaceifyModals || {};
    window.FaceifyModals[targetId] = vm;
    console.log(`${LOG_PREFIX} Successfully initialized Central Modal Hub: #${targetId}`);
  }

  // QUEUE HANDLING
  var queue = window.FaceifyModalQueue || [];
  // Notice we added item.triggerClass to the mapping below
  queue.forEach(item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config, item.triggerClass));
  window.FaceifyModalQueue = { push: item => createModal(item.targetId, item.carrdButtonsId || item.carrdContainerId, item.config, item.triggerClass) };
})();
