const ResponsiveSlider = (($) => {

    const NAME = 'ResponsiveSlider'
    const JQUERY_NO_CONFLICT = $.fn[NAME]

    const __default = {
        maxWidth: 768,

        wrapClass: '',
        rowClass: 'slider-row',
        colClass: 'slider-col',

        onBeforeInit: () => {},
        init: ($slider) => {},
        destroy: ($slider) => {},
    }

    class ResponsiveSlider
    {
        static get Default() {
            return Default
        }

        constructor(target, config) {
            this.config = $.extend({}, __default, config)
            this.config.maxWidth = parseFloat( this.config.maxWidth );
            this.$target = target instanceof jQuery ? target : $(target);
            this.$slider = null;

            if( !this.$target.length ) return;

            this.config.onBeforeInit.call(this);

            let $window = $(window);
            $window.on('resize', (event) => {
                if( $window.width() < this.config.maxWidth ) {
                    if( !this.$slider ) {
                        this.$slider = this.$target.clone(true);

                        // remove bootstrap row
                        this.$slider
                            .removeClass('row')
                            .addClass(this.config.rowClass)

                        let id = this.$slider.attr('id');
                        if( id ) this.$slider.attr('id', id + '-cloned' );

                        // remove column class
                        $('> [class*="col"]', this.$slider).each((index, el) => {
                            $(el).removeAttr('class').addClass(this.config.colClass);
                        });

                        this.$target.after( this.$slider ).hide();
                        this.config.init.call(this, this.$slider);
                    }
                } else {
                    if( this.$slider ) {
                        this.config.destroy.call(this, this.$slider);
                        this.$slider.remove();
                        this.$slider = null;

                        this.$target.show();
                    }
                }
            });

            $window.trigger('resize');
        }

        static _jQueryInterface(config) {
            config = config || {}

            return this.each(function () {
                let $this = $(this)
                config = $.extend({}, ResponsiveSlider.__default, $this.data(), typeof config === 'object' && config )

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