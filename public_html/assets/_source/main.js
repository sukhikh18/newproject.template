jQuery(document).ready(function($) {
    // @see about https://github.com/wilddeer/stickyfill
    // Sticky removed in favour native css

    var Plugins = {
        appearJs: false, // || true,
        countTo: false, // || '.counter',
    }

    if( Plugins.appearJs ) {
        appear({
            init: function init() {
                console.log('dom is ready');
            },
            elements: function elements() {
                return document.getElementsByClassName('appear');
            },
            appear: function appear(el) {
                if( !$(el).hasClass('appeared') ) {
                    var appear = $(el).data('appear') || 0;

                    $(el).data('appear', appear++).addClass('appeared');

                    if( appear <= 1 ) {
                        $( Plugins.countTo ).countTo();
                    }
                }
            },
            disappear: function disappear(el) {
                $(el).removeClass('appeared');
            },
            bounds: 200,
            reappear: true
        });
    }
    else if( Plugins.countTo ) {
        $( Plugins.countTo ).countTo();
    }

    // Do you want some animate?
    // new WOW().init();

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
    window.showPreloader = function( message, timeout ) {
        if( !$.fancybox ) return false;
        if(!message) message = 'Загрузка..';
        var $preload = $('<p>'+ message +'</p>').css({
            'margin-top': '50px',
            'margin-bottom': '-40px',
            'padding-bottom': '',
            'color': '#ddd'
        });;

        $.fancybox.open({
            content  : $preload,
            type     : 'html',
            smallBtn : false,
            buttons : ["close"],
            afterLoad: function(instance, current) {
                $('.fancybox-content', instance.$refs['fancybox-stage']).css('background', 'none');
            },
            afterShow: function(instance, current) {
                $('body').addClass(preloaderClass);
                instance.showLoading( current );
            },
            afterClose: function(instance, current) {
                $('body').removeClass(preloaderClass);
                instance.hideLoading( current );
            }
        });

        if( timeout ) { setTimeout(function() { window.hidePreloader(); }, timeout); }
    };

    window.hidePreloader = function() {
        if( !$.fancybox ) return false;

        if( $('body').hasClass(preloaderClass) ) {
            $.fancybox.getInstance().close();
        }
    };

    /********************************* Slick **********************************/
    var initSlick = function( $slick, args ) {
        if(!$slick.length || $slick.hasClass('slick-initialized')) return;

        // change classes for compatability
        $slick.closest('.row').each(function() {
            $(this).attr('data-restore-class', $(this).attr('class'))
                .removeAttr('class')
                .addClass('slick-row');
        });

        $('> [class^="col"]', $slick).each(function() {
            $(this).attr('data-restore-class', $(this).attr('class'))
                .removeAttr('class')
                .addClass('slick-col');
        });

        $slick.slick( args );
    }

    var stopSlick = function( $slick ) {
        if(!$slick.length || !$slick.hasClass('slick-initialized')) return;

        // return classes for css columns rules
        $slick.closest('.slick-row').each(function() {
            $(this).attr('class', $(this).attr('data-restore-class'));
        });

        $('.slick-col', $slick).each(function() {
            $(this).attr('class', $(this).attr('data-restore-class'))
        });

        $slick.slick('unslick');
    }

    var slickResponsive = function( target, args = {}, maxWidth = 768 ) {
        var $slick = target instanceof jQuery ? target : $(target);
        if( !$().slick ) {
            if( $(this).width() < maxWidth ) console.error('"Slick" is not loaded');
            else console.log('"Slick" required for mobile devices');
            return;
        }

        $(window).on('resize', function(e) {
            if( $(this).width() < maxWidth ) {
                initSlick( $slick, args );
            } else {
                stopSlick( $slick );
            }
        });

        setTimeout(function() {
            $(window).trigger('resize');
        }, 500);
    }

    slickResponsive('.slick', {
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
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
            }
        }]
    }, 992);
});
