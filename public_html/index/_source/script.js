jQuery(document).ready(function($) {
	if( 768 > $(window).width() ) {
		$('.slick.slider').slick({
			rows: 0,
			slidesToShow: 3,
			slidesToScroll: 1,
			responsive: [
				{
					breakpoint: 600,
					settings: {
						slidesToShow: 2
					}
				}
			]
		});
	}
});
