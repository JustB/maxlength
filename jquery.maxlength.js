(function($){
	/* Max length manager */
	function MaxLength() {
		// Add localization with $('#text1').maxlength($.maxlength.regional['fr']);
		this.regional = []; // regional settings
		this.regional[''] = { // Default regional settings
			feedbackText: '{r} characters remaining ({m} maximum)'
		};
		this._defaults = {
			max: 200 // Maxmim length
		};
		$.extend(this._defaults, this.regional['']);
	}

	$.extend(MaxLength.prototype, {});

	/* Initialize the max length functionality */
	var plugin = $.maxlength = new MaxLength();
}(jQuery));