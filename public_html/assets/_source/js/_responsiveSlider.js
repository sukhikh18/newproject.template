const ResponsiveSlider = (($) => {

    const NAME = 'ResponsiveSlider'
    const JQUERY_NO_CONFLICT = $.fn[NAME]

    const __default = {
        maxWidth: 768,
        initClass: 'slick-initialized', // 'owl-loaded'

        opts: {
            infinite: true,
            autoplay: false,
            autoplaySpeed: 4000,
            arrows: true,
            dots: false,
            slidesToShow: 4,
            slidesToScroll: 1,
            responsive: [{
                breakpoint: 576,
                settings: {
                    autoplay: true,
                    slidesToShow: 1,
                }
            }]
        },

        onInit: () => {},
        onBeforeStart: () => {},
        onAfterStart: () => {},
        onBeforeStop: () => {},
        onAfterStop: () => {},
    }

    class ResponsiveSlider
    {
        static get Default() {
            return Default
        }

        isInited() {
            return this.$slider.hasClass(this.config.initClass)
        }

        constructor(target, config) {
            this.config = $.extend({}, __default, config)

            this.$slider = target instanceof jQuery ? target : $(target)
            this.config.maxWidth = parseFloat( this.config.maxWidth );

            if( !this.$slider.length ) return;
            if(this.isInited()) return;

            this.config.onInit.call(this);

            let $window = $(window);
            $window.on('resize', (event) => {
                if( $window.width() < this.config.maxWidth ) {
                    this.start();
                } else {
                    this.stop();
                }
            });

            setTimeout(function() {
                $window.trigger('resize');
            }, 500);
        }

        start() {
            if(this.isInited()) return;
            this.config.onBeforeStart.call(this);

            // change classes for compatability
            this.$slider.closest('.row').each(function() {
                $(this).attr('data-restore-class', $(this).attr('class'))
                    .removeAttr('class')
                    .addClass('slider-row');
            });

            $('> [class^="col"]', this.$slider).each(function() {
                $(this).attr('data-restore-class', $(this).attr('class'))
                    .removeAttr('class')
                    .addClass('slider-col');
            });

            this.$slider.slick( this.config.opts ); // or this.$slider.owlCarousel( thisconfig..opts );
            this.config.onAfterStart.call(this);
        }

        stop() {
            if(!this.isInited()) return;
            this.config.onBeforeStop.call(this);

            // return classes for css columns rules
            this.$slider.closest('.slider-row').each(function() {
                $(this).attr('class', $(this).attr('data-restore-class'));
            });

            $('.slider-col', this.$slider).each(function() {
                $(this).attr('class', $(this).attr('data-restore-class'))
            });

            this.$slider.slick('unslick'); // or this.$slider.trigger('destroy.owl.carousel');
            this.config.onAfterStop.call(this);
        }

        static _jQueryInterface(config) {
            config = config || {}
            return this.each(() => {
                let $this = $(this)
                let config = $.extend({}, ResponsiveSlider.__default, $this.data(), typeof config === 'object' && config )

                new ResponsiveSlider(this, config)
            })
        }
    }

    $.fn[NAME]             = ResponsiveSlider._jQueryInterface
    $.fn[NAME].Constructor = ResponsiveSlider

    $.fn[NAME].noConflict  = () => {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return ResponsiveSlider._jQueryInterface
    }

    return ResponsiveSlider
})(jQuery);

export default ResponsiveSlider
