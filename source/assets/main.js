jQuery(document).ready(function($) {
    var Settings = {
        is_mobile: false,
        sticky: false, // || 'everywhere' || 'mobile',
        stickySelector: false, // || '#main.navbar',
        wow: false, // || 'everywhere' || 'desktop',
        appearJs: false, // || true,
        countTo: false, // || '.counter',
    }

    // sticky
    if( Settings.stickySelector ) {
        if( 'mobile' == Settings.sticky && Settings.is_mobile || Settings.sticky == 'everywhere' ) {
            var $panel = $('#wpadminbar, #bx-panel');
            var space = ( $panel.length ) ? $panel.height() : 0;

            var $container = $( Settings.stickySelector );
            $container.sticky({
                topSpacing:space,
                zIndex:1100}
            );
            $container.parent('.sticky-wrapper').css('margin-bottom', $container.css('margin-bottom') );
        }
    }

    if( Settings.wow ) {
        if( 'desktop' == Settings.wow && !Settings.is_mobile || Settings.wow == 'everywhere' ) {
            new WOW().init();
        }
    }

    if( Settings.appearJs ) {
        if( Settings.countTo ) {
            $( Settings.countTo ).appear();
            $( Settings.countTo ).on("appear", function(event, $all_appeared_elements) {
                if( ! $(this).data("appeared") )
                    $(this).countTo();

                $(this).data("appeared", 1);
            });
        }
    }
    else if( Settings.countTo ) {
        $( Settings.countTo ).countTo();
    }

    // $('.responsive-slider').slick({
    //     autoplay: true,
    //     autoplaySpeed: 4000,
    //     dots: true,
    //     infinite: false,
    //     speed: 300,
    //     slidesToShow: 4,
    //     slidesToScroll: 4
    // });
});