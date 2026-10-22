// Single shared Lenis instance for smooth scrolling on content pages.
let instance = null;

export const setLenis = (l) => { instance = l; };
export const getLenis = () => instance;

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
