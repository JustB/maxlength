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

	$.extend(MaxLength.prototype, {
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

	/* Attach the max length functionality to a jQuery selection.
		@param options (object) the new settings to use for these instances (optional)
		@return (jQuery) for chaining further calls */
	$.fn.maxlength = function (options) {
		var otherArgs = Array.prototype.slice.call(arguments, 1);
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