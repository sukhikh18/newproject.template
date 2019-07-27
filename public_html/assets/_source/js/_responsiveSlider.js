jQuery(document).ready(function($) {
    /**
     * @how to use it
     * var slickGallery = new ResponsiveSlider('.row', { props: {
     *     infinite: true,
     *     autoplay: false,
     *     autoplaySpeed: 4000,
     *     arrows: true,
     *     dots: false,
     *     slidesToShow: 4,
     *     slidesToScroll: 1,
     *     responsive: [{
     *         breakpoint: 576,
     *         settings: {
     *             autoplay: true,
     *             slidesToShow: 1,
     *         }
     *     }]
     * }}).init();
     */

    window.ResponsiveSlider = function( target, args ) {
        if( !args.maxWidth ) args.maxWidth = 768;

        this.$slider = target instanceof jQuery ? target : $(target);
        this.props = args.props || {};
        this.maxWidth = 0 + args.maxWidth;

        this.onInit = function() {};
        this.onBeforeStart = function() {};
        this.onAfterStart = function() {};
        this.onBeforeStop = function() {};
        this.onAfterStop = function() {};
    }

    window.ResponsiveSlider.prototype = {
        isInited: function() {
            return this.$slider.hasClass('slick-initialized'); // 'owl-loaded'
        },

        init: function() {
            if( !this.$slider.length ) return;

            this.onInit.call(this);
            var i = this;

            $(window).on('resize', function(e) {
                if( $(this).width() < i.maxWidth ) {
                    i.start();
                } else {
                    i.stop();
                }
            });

            setTimeout(function() {
                $(window).trigger('resize');
            }, 500);
        },

        start: function() {
            if(this.isInited()) return;
            this.onBeforeStart.call(this);

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

            this.$slider.slick( this.props ); // or this.$slider.owlCarousel( this.props );
            this.onAfterStart.call(this);
        },

        stop: function() {
            if(!this.isInited()) return;
            this.onBeforeStop.call(this);

            // return classes for css columns rules
            this.$slider.closest('.slider-row').each(function() {
                $(this).attr('class', $(this).attr('data-restore-class'));
            });

            $('.slider-col', this.$slider).each(function() {
                $(this).attr('class', $(this).attr('data-restore-class'))
            });

            this.$slider.slick('unslick'); // or this.$slider.trigger('destroy.owl.carousel');
            this.onAfterStop.call(this);
        }
    }
});