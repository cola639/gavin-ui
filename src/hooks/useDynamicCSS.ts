import { useEffect } from 'react';

const useDynamicCSS = (href, disable) => {
  useEffect(() => {
    const linkElement = document.querySelector(`link[href="${href}"]`);
    if (disable && linkElement) {
      linkElement.parentNode.removeChild(linkElement);
    }

    return () => {
      if (linkElement) {
        const newLinkElement = document.createElement('link');
        newLinkElement.rel = 'stylesheet';
        newLinkElement.href = '/normalize.css';
        document.head.appendChild(newLinkElement);
      }
    };
  }, []);
};

export default useDynamicCSS;
