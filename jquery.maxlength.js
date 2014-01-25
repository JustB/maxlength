(function($){
/* Max length manager */
function MaxLength() {
	// Add localization with $('#text1').maxlength($.maxlength.regional['fr']);
	this.regional = []; // regional settings
	this.regional[''] = { // Default regional settings
		feedbackText: '{r} characters remaining ({m} maximum)',
		overflowText: '{o} characters too many ({m} maximum)'
	};
	this._defaults = {
		max: 200, // Maximum length
		truncate: true, // True to disallow further input, 'active' for hover/focus only
		feedbackTarget: null, // jQuery selector or function for element to fill with feedback
		onFull: null //Callback when full or overflowing, receives one parameter: true if overflowing, false if not
	};
	$.extend(this._defaults, this.regional['']);
}

$.extend(MaxLength.prototype, {
	/* Override the default settings for all max length instances.
		@param options (object) the new settings to use as defaults
		@return (MaxLength) this object */
	setDefaults: function (options) {
		$.extend(this._defaults, options || {});
		return this;
	},
	_attachPlugin: function(target, options) {
		target = $(target);
		if ( target.hasClass(this.markerClassName) ) {
			return;
		}
		// We use an empty object because otherwise any changes to _defaults would
		// interfere with subsequent use of the plugin.
		var inst = {options: $.extend({}, this._defaults), feedbackTarget: $([])};

		target.addClass(this.markerClassName).
			data(this.propertyName, inst).
			bind('keypress.maxlength', function(event) {
				if (!inst.options.truncate) {
					return true;
				}
				var ch = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
				return (event.ctrlKey || event.metaKey || ch == '\u0000' || $(this).val().length < inst.options.max);
			}).
			bind('keyup.maxlength', function() {
				plugin._checkLength($(this));
			});
		// Apply user settings
		this._optionPlugin(target, options);
	}
});

// List of methods that return values and don't permit chaining
var getters = ['curLength'];
/* Determine whether a method is a getter and doesn't permit chaining.
	@param method (string, optional) the method to run
	@param otherArgs ([], optional) any other arguments for the method
	@return true if the method is a getter, false if not */
function isNotChained(method, otherArgs) {
	// Check whether we are getting the attribute from the option method
	if ( method == 'option' && (otherArgs.length == 0 || 
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string') ) ) {
		return true;
	}
	return $.inArray(method, getters) > -1;
}

/* Attach the max length functionality to a jQuery selection.
	@param options (object) the new settings to use for these instances (optional)
	@return (jQuery) for chaining further calls */
$.fn.maxlength = function (options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if ( isNotChained(options, otherArgs) ) {
		return plugin['_' + options + 'Plugin'].
			apply(plugin, [this[0]].concat(otherArgs));
	}
	// this refers to a jQuery collection, it should not be wrapper in jQuery
	return this.each(function (){
		if ( typeof options == 'string' ) {
			if ( !plugin['_' + options + 'Plugin']) {
				throw 'Unknown method: ' + options;
			}
			// The apply() method calls a function with a given this value and arguments provided as an array 
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
			plugin['_' + options + 'Plugin'].
				apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

/* Initialize the max length functionality */
var plugin = $.maxlength = new MaxLength();
}(jQuery));