// for smooth scrool to object
import scrollTo from "./parts/_scrollTo.js";
// init and destroy slider on resize
// import responsiveSlider from "./parts/_responsiveSlider.js";

jQuery(document).ready(function($) {
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        let isScrolled = scrollTo( this.getAttribute("href") )
    });

    // $('.slider').ResponsiveSlider({
    //     maxWidth: 992,

    //     init: function($slider) {
    //         $slider.slick({
    //             infinite: true,
    //             autoplay: false,
    //             autoplaySpeed: 4000,
    //             arrows: true,
    //             dots: false,
    //             slidesToShow: 4,
    //             slidesToScroll: 1,
    //             responsive: [{
    //                 breakpoint: 576,
    //                 settings: {
    //                     autoplay: true,
    //                     slidesToShow: 1,
    //                 }
    //             }]
    //         }); // or this.$slider.owlCarousel( thisconfig..opts );
    //     }
    // });

    /**
     * Set event when DOM element in appearance
     * @param  Int (in piexels) | String (in percents) | callable  offset
     */
    // $('.site-header').waypoint({
    //     handler: function(event, direction) {
    //         console.log(direction, this, event);
    //     },
    //     offset: 50
    // });
});
