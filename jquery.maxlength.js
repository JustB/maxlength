(function($){
	/* Max length manager */
	function MaxLength() {
		// Add localization with $('#text1').maxlength($.maxlength.regional['fr']);
		this.regional = []; // regional settings
		this.regional[''] = { // Default regional settings
			feedbackText: '{r} characters remaining ({m} maximum)'
		};
		this._defaults = {
			max: 200 // Maximum length
		};
		$.extend(this._defaults, this.regional['']);
	}

	$.extend(MaxLength.prototype, {});

	/* Attach the max length functionality to a jQuery selection.
		@param options (objec) the new settings to use for these instances (optional)
		@return (jQuery) for chaining further calls */
	$.fn.maxlength = function (options) {
		// this refers to a jQuery collection, it should not be wrapper in jQuery
		return this.each(function (){
			plugin._attachPlugin(this, options || {});
		});
	};

	/* Initialize the max length functionality */
	var plugin = $.maxlength = new MaxLength();
}(jQuery));