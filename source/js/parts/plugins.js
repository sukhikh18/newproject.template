var DTools = {
  is_mobile: false,
  sticky: false || 'forever' || 'phone_only',
  sticky_selector: '#main.navbar',
  wow: false || 'forever' || 'desktop',
  appearJs: false || true,
  countTo: false || '.counter',
}

// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());

jQuery(document).ready(function($) {
  // sticky
  if( DTools.sticky_selector ){
    if( DTools.is_mobile && DTools.sticky == 'phone_only' || DTools.sticky == 'forever' ){
      var space = ( $('#wpadminbar').length ) ? 32 : 0;

      var $container = $( DTools.sticky_selector );
      $container.sticky({topSpacing:space,zIndex:1100});
      $container.parent('.sticky-wrapper').css('margin-bottom', $container.css('margin-bottom') );
    }
  }

  //
  if( DTools.wow ){
    if( ! DTools.is_mobile && DTools.wow == 'desktop' || DTools.wow == 'forever' ){
      new WOW().init();
    }
  }

  if( DTools.appearJs ){
    if( DTools.countTo ){
      $( DTools.countTo ).appear();
      $( DTools.countTo ).on("appear", function(event, $all_appeared_elements) {
        if( ! $(this).attr("data-appeared") )
          $(this).countTo();

        $(this).attr("data-appeared", 1);
      });
    }
  }
  else if( DTools.countTo ){
    $( DTools.countTo ).countTo();
  }
});

// Place any jQuery/helper plugins in here.
// $('.zoom').fancybox({
//   // Options will go here
// });

// $('.responsive-slider').slick({
//   autoplay: true,
//   autoplaySpeed: 4000,
//   dots: true,
//   infinite: false,
//   speed: 300,
//   slidesToShow: 4,
//   slidesToScroll: 4,
//   responsive: [
//     {
//       breakpoint: 1024,
//       settings: {
//         slidesToShow: 3,
//         slidesToScroll: 3,
//         infinite: true,
//         dots: true
//       }
//     },
//     {
//       breakpoint: 600,
//       settings: {
//         slidesToShow: 2,
//         slidesToScroll: 2
//       }
//     },
//     {
//       breakpoint: 480,
//       settings: {
//         slidesToShow: 1,
//         slidesToScroll: 1
//       }
//     }
//     // You can unslick at a given breakpoint now by adding:
//     // settings: "unslick"
//     // instead of a settings object
//   ]
// });

// $('.grid').masonry({
//   // options
//   itemSelector: '.grid-item',
//   columnWidth: 200
// });