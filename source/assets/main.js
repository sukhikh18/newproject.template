const Settings = {
  is_mobile: false,
  sticky: false, // || 'everywhere' || 'mobile',
  stickySelector: false, // || '#main.navbar',
  wow: false, // || 'everywhere' || 'desktop',
  appearJs: false, // || true,
  countTo: false, // || '.counter',
  popovers: false, // || '[data-toggle="popover"]',
  fancybox: false, // || '.zoom',
  masonry: false, // || '.grid',
  masonryOpts: {
    itemSelector: '.grid-item',
    columnWidth: 200,
  },
}

jQuery(document).ready(function($) {
    // sticky
    if( Settings.stickySelector ){
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
        if( 'desktop' == Settings.wow && !Settings.is_mobile || Settings.wow == 'everywhere' ){
            new WOW().init();
        }
    }

    if( Settings.appearJs ){
        if( Settings.countTo ){
            $( Settings.countTo ).appear();
            $( Settings.countTo ).on("appear", function(event, $all_appeared_elements) {
                if( ! $(this).data("appeared") )
                    $(this).countTo();

                $(this).data("appeared", 1);
            });
        }
    }
    else if( Settings.countTo ){
        $( Settings.countTo ).countTo();
    }

    if( Settings.popovers ) {
        var $popovers = $(Settings.popovers);

        function loadPopoverContent( $self, $target ) {
            var $clone = $target.clone(1).css('display', 'block');
            var href = $self.attr('href');

            if( href.length > 1 ) {
                $target.remove();

                $.ajax({
                    type: 'POST',
                    url: href,
                    data: {is_ajax : 'Y'},
                    success: function(response) {
                        $clone.append(response);
                    }
                });
            }

            return $clone;
        }

        $popovers.each(function(index, el) {
            var $self = $(this);

            $(this).on('click', function(event) {
                event.preventDefault();
            });

            var popProps = {
                placement: $self.data('placement') || 'bottom'
            };

            var target = $self.data('content-target') || '';
            var $target = $( target );

            if( $target.length ) {
                popProps = {
                    html: true,
                    content: function() {
                        return loadPopoverContent($self, $target);
                    },
                }
            }

            var $popover = $self.popover(popProps);
        });

        /**
         * Close button in popover content
         */
         $(document).on("click", ".popover .close" , function(){
            $(this).parents(".popover").popover('hide');
        });

        /**
         * Hide all the Popovers if clicked on button or inside popover
         */
         $(document).on("click", function (e) {
            var $target = $(e.target);
            var isPopover = $target.is('[data-toggle="popover"]'),
            inPopover = $target.closest('.popover').length > 0

            if (!isPopover && !inPopover) $popovers.popover('hide');
        });
    }

    if( Settings.fancybox ) {
        $( Settings.fancybox ).fancybox();
    }

    if( Settings.masonry ) {
        $( Settings.masonry ).masonry( Settings.masonryOpts );
    }

    // $('.responsive-slider').slick({
    //     autoplay: true,
    //     autoplaySpeed: 4000,
    //     dots: true,
    //     infinite: false,
    //     speed: 300,
    //     slidesToShow: 4,
    //     slidesToScroll: 4,
    //     responsive: [
    //     {
    //         breakpoint: 1024,
    //         settings: {
    //             slidesToShow: 3,
    //             slidesToScroll: 3,
    //             infinite: true,
    //             dots: true
    //         }
    //     },
    //     {
    //         breakpoint: 600,
    //         settings: {
    //             slidesToShow: 2,
    //             slidesToScroll: 2
    //         }
    //     },
    //     {
    //         breakpoint: 480,
    //         settings: {
    //             slidesToShow: 1,
    //             slidesToScroll: 1
    //         }
    //     }
    //     ]
    // });
});