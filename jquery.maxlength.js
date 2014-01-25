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
	},
	/* Retrieve or reconfigure the settings for a control.
		@param target   (element) the control to affect
		@param options  (object) the new options for this instance or 
						(string) an individual property name
		@param value    (any) the individual property value
						(omit if options is an object or to retrieve the value of a setting)
		@return (any) if retrieving a value */	
	_optionPlugin: function (target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if ( !options || ( typeof options == 'string' && value == null ) ) {
			// Get option
			var name = options;
			options = (inst || {}).options;
			return ( options && name ? options[name] : options );
		}

		if ( !target.hasClass(this.markerClassName) ) {
			return;
		}

		options = options || {};
		if ( typeof options == 'string' ) {
			// If updating a single value, turn into a map, so that it's possible
			// to use $.extend
			var name = options;
			options = {};
			options[name] = value;
		}
		$.extend(inst.options, options);

		// Maxlength options
		if ( inst.feedbackTarget.length > 0 ) {
			// Remove old feedback element
			if ( inst.hadFeedbackTarget ) {
				inst.feedbackTarget.empty().val('').
					removeClass(this._feedbackClass + ' ' + this._fullClass + ' ' + this._overflowClass);
			}
			else {
				inst.feedbackTarget.remove();
			}
		}
		if ( inst.options.showFeedback ) {
			// Add new feedback element
			inst.hadFeedbackTarget = !!inst.options.feedbackTarget;
			if ( $.isFunction(inst.options.feedbackTarget) ) {
				inst.feedbackTarget = 
					inst.options.feedbackTarget.apply(target[0], []);
			}
			else if ( inst.options.feedbackTarget ) {
				inst.feedbackTarget = $(inst.options.feedbackTarget);
			}
			else {
				inst.feedbackTarget = $('<span></span>').insertAfter(target);
			}
			inst.feedbackTarget.addClass(this._feedbackClass);
		}
		target.unbind('mouseover.maxlength focus.maxlength mouseout.maxlength blur.maxlength');
		if ( inst.options.showFeedback == 'active' ) {
			// Additional event handlers
			target.bind('mouseover.maxlength', function (){
				inst.feedbackTarget.css('visibility', 'visible');
				}).bind('mouseout.maxlength', function () {
					if ( !inst.focussed ) {
						inst.feedbackTarget.css('visibility', 'hidden');
					}
				}).bind('focus.maxlength', function () {
					inst.focussed = true;
					inst.feedbackTarget.css('visibility', 'visible');
				}).bind('blur.maxlength', function () {
					inst.focussed = false;
					inst.feedbackTarget.css('visibility', 'hidden');
				});
			inst.feedbackTarget.css('visibility', 'hidde');
		}

		this._checkLength(target);
	},
	/* Enable the control.
		@param target (element) the control to affect */
	_enablePlugin: function (target) {
		target = $(target);
		if ( !target.hasClass(this.markerClassName) ) {
			return;
		}
		target.prop('disabled', false).removeClass('maxlength-disabled');
		var inst = target.data(this.propertyName);
		inst.feedbackTarget.removeClass('maxlength-disabled');
	},
	/* Disable the control.
		@param target (element) the control to affect */
	_disablePlugin: function (target) {
		target = $(target);
		if ( !target.hasClass(this.markerClassName) ) {
			return;
		}
		target.prop('disabled', true).addClass('maxlength-disabled');
		var inst = target.data(this.propertyName);
		inst.feedbackTarget.addClass('maxlength-disabled');
	},
	/* Check the length of the text and notify accordingly.
		@param target (jQuery) the control to check */
	_checkLength: function (target) {
		var inst = target.data(this.propertyName);
		var value = target.val();
		var len = value.replace(/\r\n/g, '~~').replace(/\n/g, '~~'.length);

		//other code

		if ( len >= inst.options.max && $.isFunction(inst.options.onFull) ) {
			inst.options.onFull.apply(target, [len > inst.options.max]);
		}
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