jQuery(document).ready(function($) {
    var SETTINGS = {
        sticky: 'everywhere', // false || mobile
        stickySelector: '.site-header, .site-navigation',
        stickyHeight: 45
        // wow: false, // || 'everywhere' || 'desktop',
        // appearJs: false, // || true,
        // countTo: false, // || '.counter',
    }

    if( SETTINGS.stickySelector ) {
        if( 'mobile' == SETTINGS.sticky && SETTINGS.is_mobile || SETTINGS.sticky == 'everywhere' ) {
            var $panel = $('#wpadminbar, #bx-panel');
            var space = ( $panel.length ) ? $panel.height() : 0;

            var $container = $( SETTINGS.stickySelector );

            if( $container.length ) {
                try {
                    $container.sticky({
                        topSpacing: space,
                        zIndex: 1100,
                        height: SETTINGS.stickyHeight,
                    });

                    $container.parent('.sticky-wrapper').css('margin-bottom', $container.css('margin-bottom') );
                } catch(e) {
                    console.error('Sticky library is not available!');
                }
            }
        }
    }

    if( SETTINGS.wow ) {
        if( 'desktop' == SETTINGS.wow && !SETTINGS.is_mobile || SETTINGS.wow == 'everywhere' ) {
            new WOW().init();
        }
    }

    if( SETTINGS.appearJs ) {
        if( SETTINGS.countTo ) {
            $( SETTINGS.countTo ).appear();
            $( SETTINGS.countTo ).on("appear", function(event, $all_appeared_elements) {
                if( ! $(this).data("appeared") )
                    $(this).countTo();

                $(this).data("appeared", 1);
            });
        }
    }
    else if( SETTINGS.countTo ) {
        $( SETTINGS.countTo ).countTo();
    }

    /******************************** Fancybox ********************************/
    $.fancybox.defaults.buttons = [
        "zoom",
        //"share",
        "slideShow",
        "fullScreen",
        //"download",
        // "thumbs",
        "close"
    ];

    $.fancybox.defaults.lang = "ru";
    $.fancybox.defaults.i18n.ru = {
        CLOSE: "Закрыть",
        NEXT: "Следующий",
        PREV: "Предыдущий",
        ERROR: "Контент по запросу не найден. <br/> Пожалуйста попробуйте снова, позже.",
        PLAY_START: "Начать слайдшоу",
        PLAY_STOP: "Пауза",
        FULL_SCREEN: "На весь экран",
        THUMBS: "Превью",
        DOWNLOAD: "Скачать",
        SHARE: "Поделиться",
        ZOOM: "Приблизить"
    }

    window.showPreloader = function( message ) {
        if(!message) message = 'Загрузка..';
        $preload = $('<p>'+ message +'</p>').css({
            'margin-top': '50px',
            'margin-bottom': '-40px',
            'padding-bottom': '',
            'color': '#ddd'
        });;

        $.fancybox.open({
            content  : $preload,
            type     : 'html',
            smallBtn : false,
            afterLoad: function(instance, current) {
                $('.fancybox-content', instance.$refs['fancybox-stage']).css('background', 'none');
            },
            afterShow: function(instance, current) {
                instance.showLoading( current );
            },
            afterClose: function(instance, current) {
                instance.hideLoading( current );
            }
        });
    }

    // showPreloader( 'What is love?' );
    // setTimeout(function(){
    //     $.fancybox.getInstance().close();
    //     $.fancybox.open({
    //         content  : 'Hello world!',
    //         type     : 'html',
    //     });
    // }, 3000);

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
            console.log('Init props is distorted.');
            this.props = _defaults;
        }

        console.log( this.props );

        this.$slider = $( target );
        this.isInit = false;
    }

    window.slickSlider.prototype = {
        init: function( minWidth ) {
            if( !this.$slider.length ) return false;

            if( !this.isInit ) {
                try {
                    this.$slider.slick( this.props );
                    this.isInit = this.$slider.hasClass('slick-initialized');
                } catch(e) {
                    console.error('Slick library is not available!');
                }
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
});
