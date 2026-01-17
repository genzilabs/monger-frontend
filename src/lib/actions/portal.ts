export function portal(node: HTMLElement, target = 'body') {
  async function update(newTarget: string) {
    const targetEl = document.querySelector(newTarget);
    if (targetEl) {
      targetEl.appendChild(node);
    } else {
      // If target doesn't exist yet (sapper/server-side), wait? 
      // In SvelteKit client-side, body usually exists.
      document.body.appendChild(node);
    }
  }

  function destroy() {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  update(target);

  return {
    update,
    destroy
  };
}
