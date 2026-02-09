export function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('outclick', { detail: node }));
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
}
