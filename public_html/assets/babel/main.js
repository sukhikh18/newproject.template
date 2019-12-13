// for smooth scrool to object
import scrollTo from "./parts/_scrollTo.js";

jQuery(document).ready(function($) {
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        scrollTo( this.getAttribute("href") );
    });

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
