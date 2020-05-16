document.addEventListener('DOMContentLoaded', function() {

    const lazyAttribute = 'data-lazy-src',
          lazySetAttribute = 'data-lazy-srcset',
          lazyBackgroundAttribute = 'data-lazy-bg',
          lazyImages = [].slice.call(document.querySelectorAll('[' + lazyAttribute + ']')),
          lazyBackgrounds = [].slice.call(document.querySelectorAll('[' + lazyBackgroundAttribute + ']'));

    const lazyLoad = (lazyImage) => {
        let srcset = lazyImage.getAttribute(lazySetAttribute);
        lazyImage.setAttribute('src', lazyImage.getAttribute(lazyAttribute));
        if(srcset) lazyImage.setAttribute('srcset', srcset);

        lazyImage.onload = function() {
            lazyImage.removeAttribute(lazyAttribute);
            if(srcset) lazyImage.removeAttribute(lazySetAttribute);
        };
    };

    // Usage .element:not([data-lazy-bg]) { background-image: url('lazy.png') } for lazy css background
    // or data-lazy-bg="lazy.png" attribute for set style background on observe.
    const lazyBackground = (lazyBackgroundElem) => {
        let bg = lazyBackgroundElem.getAttribute(lazyBackgroundAttribute);
        if(bg.length > 0 && 'true' !== bg) {
            lazyBackgroundElem.style.backgroundImage = `url(${bg})`;
        }

        lazyBackgroundElem.removeAttribute(lazyBackgroundAttribute);
    };

    const lazyStyles = () => {
        let css = `
            img { opacity: 1; transition: opacity .3s }
            [${lazyAttribute}] { opacity: 0 }`,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        head.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    // You may use "delete window.IntersectionObserver;" for fallback check.
    if ('IntersectionObserver' in window) {
        lazyStyles();

        let lazyImageObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
                lazyLoad(entry.target);
                lazyImageObserver.unobserve(entry.target);
            }
        }));

        lazyImages.forEach((lazyImage) => lazyImageObserver.observe(lazyImage));

        let lazyBackgroundObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
                lazyBackground(entry.target);
                lazyBackgroundObserver.unobserve(entry.target);
            }
        }));

        lazyBackgrounds.forEach((lazyBackgroundElem) => lazyBackgroundObserver.observe(lazyBackgroundElem));
    }
    else {
        lazyImages.forEach(lazyLoad);
        lazyBackgrounds.forEach(lazyBackground);
    }
});
