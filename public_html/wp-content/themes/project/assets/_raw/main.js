jQuery(document).ready(function($) {
    // @see about https://github.com/wilddeer/stickyfill
    // Sticky removed in favour native css

    var Plugins = {
        appearJs: false, // || true,
        countTo: false, // || '.counter',
    }

    // Do you want some animate?
    // new WOW().init();

    if( Plugins.appearJs ) {
        if( Plugins.countTo ) {
            $( Plugins.countTo ).appear();
            $( Plugins.countTo ).on("appear", function(event, $all_appeared_elements) {
                if( ! $(this).data("appeared") )
                    $(this).countTo();

                $(this).data("appeared", 1);
            });
            // $(Plugins.countTo).on('disappear', function(event, $all_disappeared_elements) {
            // });
        }
    }
    else if( Plugins.countTo ) {
        $( Plugins.countTo ).countTo();
    }

    window.scrollTo = function(selector, topOffset, delay) {
        if( !selector || selector.length <= 1 ) return;

        if( !topOffset ) topOffset = 40;
        if( !delay ) delay = 500;

        // try get jQuery object by selector
        var $obj = $( selector ),
        // try get by classic anchors (if is not found)
            offset = ($obj.length && $obj.offset()) || $('a[name='+selector.slice(1)+']').offset()

        if( offset ) {
            $('html, body').animate({ scrollTop: offset.top - topOffset }, delay);
        }
        // not found
        else {
            console.log('Element not exists.');
        }
    }

    /******************************** Fancybox ********************************/
    /**
     * Fancybox preloader
     */
    var preloaderClass = 'fb-loading';
    window.showPreloader = function( message ) {
        if( !$.fancybox ) return false;
        if(!message) message = 'Загрузка..';
        var $preload = $('<p>'+ message +'</p>').css({
            'margin-top': '50px',
            'margin-bottom': '-40px',
            'padding-bottom': '',
            'color': '#ddd'
        });;

        var $body = $('body');

        $.fancybox.open({
            content  : $preload,
            type     : 'html',
            smallBtn : false,
            buttons : ["close"],
            afterLoad: function(instance, current) {
                $('.fancybox-content', instance.$refs['fancybox-stage']).css('background', 'none');
            },
            afterShow: function(instance, current) {
                $body.addClass(preloaderClass);
                instance.showLoading( current );
            },
            afterClose: function(instance, current) {
                $body.removeClass(preloaderClass);
                instance.hideLoading( current );
            }
        });
    };

    window.hidePreloader = function() {
        if( !$.fancybox ) return false;
        var $body = $('body');

        if( $body.hasClass(preloaderClass) ) {
            $.fancybox.getInstance().close();
        }
    };

    /********************************* Slick **********************************/
    window.slickSlider = function(target, props) {
        var _defaults = {
            autoplay: true,
            autoplaySpeed: 4000,
            dots: true,
            infinite: false,
            slidesToShow: 4,
            slidesToScroll: 4,
            responsive: [
            {
                breakpoint: 576,
                settings: {}
            },
            ]
        };

        try {
            if( !props ) props = {};
            this.props = Object.assign(_defaults, props);
        } catch(e) {
            console.log('Init props is demaged.');
            this.props = _defaults;
        }

        this.$slider = $( target );
        this.isInit = false;
    }

    window.slickSlider.prototype = {
        init: function( minWidth ) {
            if( !this.$slider.length ) return false;

            try {
                if( !this.isInit ) {
                    if( undefined !== this.$slider.slick ) {
                        this.$slider.slick( this.props );
                        this.isInit = this.$slider.hasClass('slick-initialized');
                    }
                    else {
                        console.error('Slick library is not available!');
                    }
                }
            } catch(e) {
                console.error(e);
            }
        },
        responsive: function( minWidth ) {
            var self = this;

            if( !minWidth ) minWidth = 992;
            if( !this.$slider.length ) return false;

            $(window).on('load resize', function(e) {
                if( minWidth < $(window).width() ) {
                    if( self.isInit ) {
                        self.$slider.slick('unslick');
                        self.isInit = false;
                    }
                }
                else {
                    self.init();
                }
            });
        }
    };

    var slick = new slickSlider('.slider', {slidesToShow: 3, slidesToScroll: 1, responsive: [{
            breakpoint: 576,
            settings: {
                slidesToShow: 1
            }
        }]});
    slick.responsive();

    /********************************* Custom *********************************/
    // On front page only
    if( 3 == window.location.href.match(/\//g).length ) {
        // Preloader demonstration
        showPreloader( 'What is love?' );

        // Hide after 3 sec
        setTimeout(function() {
            hidePreloader();

            // $.fancybox.open({
            //     content  : 'Hello world!',
            //     type     : 'html',
            // });
        }, 3000);
    }
});
