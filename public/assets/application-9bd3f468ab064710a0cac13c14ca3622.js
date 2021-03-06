/**
 * Template JS for standard pages
 */


(function($)
{
	/**
	 * List of functions required to enable template effects/hacks
	 * @var array
	 */
	var templateSetup = new Array();
	
	/**
	 * Add a new template function
	 * @param function func the function to be called on a jQuery object
	 * @param boolean prioritary set to true to call the function before all others (optional)
	 * @return void
	 */
	$.fn.addTemplateSetup = function(func, prioritary)
	{
		if (prioritary)
		{
			templateSetup.unshift(func);
		}
		else
		{
			templateSetup.push(func);
		}
	};
	
	/**
	 * Call every template function over a jQuery object (for instance : $('body').applyTemplateSetup())
	 * @return void
	 */
	$.fn.applyTemplateSetup = function()
	{
		var max = templateSetup.length;
		for (var i = 0; i < max; ++i)
		{
			templateSetup[i].apply(this);
		}
		
		return this;
	};
	
	// Common (mobile and standard) template setup
	$.fn.addTemplateSetup(function()
	{
		// Collapsible fieldsets
		this.find('fieldset legend > a, .fieldset .legend > a').click(function(event)
		{
			$(this).toggleFieldsetOpen();
			event.preventDefault();
		});
		this.find('fieldset.collapse, .fieldset.collapse').toggleFieldsetOpen().removeClass('collapse');
		
		// Equalize tab content-blocks heights
		this.find('.tabs.same-height, .side-tabs.same-height, .mini-tabs.same-height, .controls-tabs.same-height').equalizeTabContentHeight();
		
		// Update tabs
		this.find('.js-tabs').updateTabs();
		
		// Input switches
		this.find('input[type=radio].switch, input[type=checkbox].switch').hide().after('<span class="switch-replace"></span>').next().click(function() {
			$(this).prev().click();
		}).prev('.with-tip').next().addClass('with-tip').each(function()
		{
			$(this).attr('title', $(this).prev().attr('title'));
		});
		this.find('input[type=radio].mini-switch, input[type=checkbox].mini-switch').hide().after('<span class="mini-switch-replace"></span>').next().click(function() {
			$(this).prev().click();
		}).prev('.with-tip').next().addClass('with-tip').each(function()
		{
			$(this).attr('title', $(this).prev().attr('title'));
		});
		
		// Tabs links behaviour
		this.find('.js-tabs').initTabs();
	});
	
	// Document initial setup
	$(document).ready(function()
	{
		// Template setup
		$(document.body).applyTemplateSetup();
		
		// Listener
		$(window).bind('hashchange', function()
		{
			$(document.body).find('.js-tabs').updateTabs();
		});
		
	});
	
	/**
	 * Init tab group
	 */
	$.fn.initTabs = function()
	{
		// Reset first to handle tabs changes, then add behavior
		this.find('a[href^="#"]').unbind('click', onTabClick).bind('click', onTabClick);
	};
	
	/**
	 * Function called when a tab is clicked
	 */
	function onTabClick(event)
	{
		event.preventDefault();
		
		// If hashtag enabled
		if ($.fn.updateTabs.enabledHash)
		{
			// Retrieve hash parts
			var element = $(this);
			var hash = $.trim(window.location.hash || '');
			if (hash.length > 1)
			{
				// Remove hash from other tabs of the group
				var hashParts = hash.substring(1).split('&');
				var dummyIndex;
				while ((dummyIndex = $.inArray('', hashParts)) > -1)
				{
					hashParts.splice(dummyIndex, 1);
				}
				while ((dummyIndex = $.inArray('none', hashParts)) > -1)
				{
					hashParts.splice(dummyIndex, 1);
				}
				element.parent().parent().find('a[href^="#"]').each(function(i)
				{
					var index = $.inArray($(this).attr('href').substring(1), hashParts);
					if (index > -1)
					{
						hashParts.splice(index, 1);
					}
				});
			}
			else
			{
				var hashParts = [];
			}
			
			// Add current tab to hash (not if default)
			var defaultTab = getDefaultTabIndex(element.parent().parent());
			if (element.parent().index() != defaultTab)
			{
				hashParts.push(element.attr('href').substring(1));
			}
			
			// If only one tab, add a empty id to prevent document from jumping to selected content
			if (hashParts.length == 1)
			{
				hashParts.unshift('');
			}
			
			// Put hash, will trigger refresh
			window.location.hash = (hashParts.length > 0) ? '#'+hashParts.join('&') : '#none';
		}
		else
		{
			var li = $(this).closest('li');
			li.addClass('current').siblings().removeClass('current');
			li.parent().updateTabs();
		}
	};
	
	/**
	 * Get tab group default tab
	 */
	function getDefaultTabIndex(tabGroup)
	{
		var defaultTab = tabGroup.data('defaultTab');
		if (defaultTab === null || defaultTab === '' || defaultTab === undefined)
		{
			var firstTab = tabGroup.children('.current:first');
			defaultTab = (firstTab.length > 0) ? firstTab.index() : 0;
			tabGroup.data('defaultTab', defaultTab);
		}
		
		return defaultTab;
	};
	
	/**
	 * Update tabs
	 */
	$.fn.updateTabs = function()
	{
		// If hashtags enabled
		if ($.fn.updateTabs.enabledHash)
		{
			var hash = $.trim(window.location.hash || '');
			var hashParts = (hash.length > 1) ? hash.substring(1).split('&') : [];
		}
		else
		{
			var hash = '';
			var hashParts = [];
		}
		
		// Check all tabs
		var hasHash = (hashParts.length > 0);
		this.each(function(i)
		{
			// Check if already inited
			var tabGroup = $(this);
			var defaultTab = getDefaultTabIndex(tabGroup);
			
			// Look for current tab
			var current = false;
			if ($.fn.updateTabs.enabledHash)
			{
				if (hasHash)
				{
					var links = tabGroup.find('a[href^="#"]');
					links.each(function(i)
					{
						var linkHash = $(this).attr('href').substring(1);
						if (linkHash.length > 0)
						{
							var index = $.inArray(linkHash, hashParts);
							if (index > -1)
							{
								current = $(this).parent();
								return false;
							}
						}
					});
				}
			}
			else
			{
				current = tabGroup.children('.current:first');
			}
			
			// If none found : get the default tab
			if (!current)
			{
				current = tabGroup.children(':eq('+defaultTab+')');
			}
			
			if (current.length > 0)
			{
				// Display current tab content block
				hash = $.trim(current.children('a').attr('href').substring(1));
				if (hash.length > 0)
				{
					// Highlight current
					current.addClass('current');
					var tabContainer = $('#'+hash),
						tabHidden = tabContainer.is(':hidden');
					
					// Show if hidden
					if (tabHidden)
					{
						tabContainer.show();
					}
					
					// Hide others
					current.siblings().removeClass('current').children('a').each(function(i)
					{
						var hash = $.trim($(this).attr('href').substring(1));
						if (hash.length > 0)
						{
							var tabContainer = $('#'+hash);
							
							// Hide if visible
							if (tabContainer.is(':visible'))
							{
								tabContainer.trigger('tabhide').hide();
							}
							// Or init if first round
							else if (!tabContainer.data('tabInited'))
							{
								tabContainer.trigger('tabhide');
								tabContainer.data('tabInited', true);
							}
						}
					});
					
					// Callback
					if (tabHidden)
					{
						tabContainer.trigger('tabshow');
					}
					// Or init if first round
					else if (!tabContainer.data('tabInited'))
					{
						tabContainer.trigger('tabshow');
						tabContainer.data('tabInited', true);
					}
				}
			}
		});
		
		return this;
	};
	
	/**
	 * Indicate whereas JS tabs hashtag is enabled
	 * @var boolean
	 */
	$.fn.updateTabs.enabledHash = true;
	
	/**
	 * Reset tab content blocks heights
	 */
	$.fn.resetTabContentHeight = function()
	{
		this.find('a[href^="#"]').each(function(i)
		{
			var hash = $.trim($(this).attr('href').substring(1));
			if (hash.length > 0)
			{
				$('#'+hash).css('height', '');
			}
		});
		
		return this;
	}
	
	/**
	 * Equalize tab content blocks heights
	 */
	$.fn.equalizeTabContentHeight = function()
	{
		var i;
		var g;
		var maxHeight;
		var tabContainers;
		var block;
		var blockHeight;
		var marginAdjustTop;
		var marginAdjustBot;
		var first;
		var last;
		var firstMargin;
		var lastMargin;
		
		// Process in reverse order to equalize sub-tabs first
		for (i = this.length-1; i >= 0; --i)
		{
			// Look for max height
			maxHeight = -1;
			tabContainers = [];
			this.eq(i).find('a[href^="#"]').each(function(i)
			{
				var hash = $.trim($(this).attr('href').substring(1));
				if (hash.length > 0)
				{
					block = $('#'+hash);
					if (block.length > 0)
					{
						blockHeight = block.outerHeight()+parseInt(block.css('margin-bottom'));
						
						// First element top-margin affects real height
						marginAdjustTop = 0;
						first = block.children(':first');
						if (first.length > 0)
						{
							firstMargin = parseInt(first.css('margin-top'));
							if (!isNaN(firstMargin) && firstMargin < 0)
							{
								marginAdjustTop = firstMargin;
							}
						}
						
						// Same for last element bottom-margin
						marginAdjustBot = 0;
						last = block.children(':last');
						if (last.length > 0)
						{
							lastMargin = parseInt(last.css('margin-bottom'));
							if (!isNaN(lastMargin) && lastMargin < 0)
							{
								marginAdjustBot = lastMargin;
							}
						}
						
						if (blockHeight+marginAdjustTop+marginAdjustBot > maxHeight)
						{
							maxHeight = blockHeight+marginAdjustTop+marginAdjustBot;
						}
						
						tabContainers.push([block, marginAdjustTop]);
					}
				}
			});
			
			// Setup height
			for (g = 0; g < tabContainers.length; ++g)
			{
				tabContainers[g][0].height(maxHeight-parseInt(tabContainers[g][0].css('padding-top'))-parseInt(tabContainers[g][0].css('padding-bottom'))-parseInt(tabContainers[g][0].css('margin-bottom'))-tabContainers[g][1]);
				
				// Only the first tab remains visible
				if (g > 0)
				{
					tabContainers[g][0].hide();
				}
			}
		}
		
		return this;
	};
	
	/**
	 * Display the selected tab (apply on tab content-blocks, not tabs, ie: $('#my-tab').showTab(); )
	 */
	$.fn.showTab = function()
	{
		this.each(function(i)
		{
			$('a[href="#'+this.id+'"]').trigger('click');
		});
		
		return this;
	};
	
	/**
	 * Add a listener fired when a tab is shown
	 * @param function callback any function to call when the listener is fired.
	 * @param boolean runOnce if true, the callback will be run one time only. Default: false - optional
	 */
	$.fn.onTabShow = function(callback, runOnce)
	{
		if (runOnce)
		{
			var runOnceFunc = function()
			{
				callback.apply(this, arguments);
				$(this).unbind('tabshow', runOnceFunc);
			}
			this.bind('tabshow', runOnceFunc);
		}
		else
		{
			this.bind('tabshow', callback);
		}
		
		return this;
	};
	
	/**
	 * Add a listener fired when a tab is hidden
	 * @param function callback any function to call when the listener is fired.
	 * @param boolean runOnce if true, the callback will be run one time only. Default: false - optional
	 */
	$.fn.onTabHide = function(callback, runOnce)
	{
		if (runOnce)
		{
			var runOnceFunc = function()
			{
				callback.apply(this, arguments);
				$(this).unbind('tabhide', runOnceFunc);
			}
			this.bind('tabhide', runOnceFunc);
		}
		else
		{
			this.bind('tabhide', callback);
		}
		
		return this;
	};
	
	/**
	 * Insert a message into a block
	 * @param string|array message a message, or an array of messages to inserted
	 * @param object options optional object with following values:
	 * 		- type: one of the available message classes : 'info' (default), 'warning', 'error', 'success', 'loading'
	 * 		- position: either 'top' (default) or 'bottom'
	 * 		- animate: true to show the message with an animation (default), else false
	 * 		- noMargin: true to apply the no-margin class to the message (default), else false
	 */
	$.fn.blockMessage = function(message, options)
	{
		var settings = $.extend({}, $.fn.blockMessage.defaults, options);
		
		this.each(function(i)
		{
			// Locate content block
			var block = $(this);
			if (!block.hasClass('block-content'))
			{
				block = block.find('.block-content:first');
				if (block.length == 0)
				{
					block = $(this).closest('.block-content');
					if (block.length == 0)
					{
						return;
					}
				}
			}
			
			// Compose message
			var messageClass = (settings.type == 'info') ? 'message' : 'message '+settings.type;
			if (settings.noMargin)
			{
				messageClass += ' no-margin';
			}
			var finalMessage = (typeof message == 'object') ? '<ul class="'+messageClass+'"><li>'+message.join('</li><li>')+'</li></ul>' : '<p class="'+messageClass+'">'+message+'</p>';
			
			// Insert message
			if (settings.position == 'top')
			{
				var children = block.find('h1, .h1, .block-controls, .block-header, .wizard-steps');
				if (children.length > 0)
				{
					var lastHeader = children.last();
					var next = lastHeader.next('.message');
					while (next.length > 0)
					{
						lastHeader = next;
						next = lastHeader.next('.message');
					}
					var messageElement = lastHeader.after(finalMessage).next();
				}
				else
				{
					var messageElement = block.prepend(finalMessage).children(':first');
				}
			}
			else
			{
				var children = block.find('.block-footer:last-child');
				if (children.length > 0)
				{
					var messageElement = children.before(finalMessage).prev();
				}
				else
				{
					var messageElement = block.append(finalMessage).children(':last');
				}
			}
			
			if (settings.animate)
			{
				messageElement.expand();
			}
		});
		
		return this;
	};
	
	// Default config for the blockMessage function
	$.fn.blockMessage.defaults = {
		type: 'info',
		position: 'top',
		animate: true,
		noMargin: true
	};
	
	/**
	 * Remove all messages from the block
	 * @param object options optional object with following values:
	 * 		- only: string or array of strings of message classes which will be removed
	 * 		- except: string or array of strings of message classes which will not be removed (ignored if 'only' is provided)
	 * 		- animate: true to remove the message with an animation (default), else false
	 */
	$.fn.removeBlockMessages = function(options)
	{
		var settings = $.extend({}, $.fn.removeBlockMessages.defaults, options);
		
		this.each(function(i)
		{
			// Locate content block
			var block = $(this);
			if (!block.hasClass('block-content'))
			{
				block = block.find('.block-content:first');
				if (block.length == 0)
				{
					block = $(this).closest('.block-content');
					if (block.length == 0)
					{
						return;
					}
				}
			}
			
			var messages = block.find('.message');
			if (settings.only)
			{
				if (typeof settings.only == 'string')
				{
					settings.only = [settings.only];
				}
				messages = messages.filter('.'+settings.only.join(', .'));
			}
			else if (settings.except)
			{
				if (typeof settings.except == 'string')
				{
					settings.except = [settings.except];
				}
				messages = messages.not('.'+settings.except.join(', .'));
			}
			
			if (settings.animate)
			{
				messages.foldAndRemove();
			}
			else
			{
				messages.remove();
			}
		});
		
		return this;
	};
	
	// Default config for the blockMessage function
	$.fn.removeBlockMessages.defaults = {
		only: false,				// string or array of strings of message classes which will be removed
		except: false,				// except: string or array of strings of message classes which will not be removed (ignored if only is provided)
		animate: true				// animate: true to remove the message with an animation (default), else false
	};
	
	/**
	 * Fold an element
	 * @param string|int duration a string (fast, normal or slow) or a number of millisecond. Default: 'normal'. - optional
	 * @param function callback any function to call at the end of the effect. Default: none. - optional
	 */
	$.fn.fold = function(duration, callback)
	{
		this.each(function(i)
		{
			var element = $(this);
			var marginTop = parseInt(element.css('margin-top'));
			var marginBottom = parseInt(element.css('margin-bottom'));
			
			var anim = {
				'height': 0,
				'paddingTop': 0,
				'paddingBottom': 0
			};
			
			// IE8 and lower do not understand border-xx-width
			// http://forum.jquery.com/topic/ie-invalid-argument
			if (!$.browser.msie || $.browser.version > 8)
			{
				// Border width is not set to 0 because it does not allow fluid movement 
				anim.borderTopWidth = '1px';
				anim.borderBottomWidth = '1px';
			}
			
			// Detection of elements sticking to their predecessor
			var prev = element.prev();
			if (prev.length === 0 && parseInt(element.css('margin-bottom'))+marginTop !== 0)
			{
				anim.marginTop = Math.min(0, marginTop);
				anim.marginBottom = Math.min(0, marginBottom);
			}
			
			// Effect
			element.stop(true).css({
				'overflow': 'hidden'
			}).animate(anim, {
				'duration': duration,
				'complete': function()
				{
					// Reset properties
					$(this).css({
						'display': 'none',
						'overflow': '',
						'height': '',
						'paddingTop': '',
						'paddingBottom': '',
						'borderTopWidth': '',
						'borderBottomWidth': '',
						'marginTop': '',
						'marginBottom': ''
					});
					
					// Callback function
					if (callback)
					{
						callback.apply(this);
					}
				}
			});
		});
		
		return this;
	};
	
	/*
	 * Expand an element
	 * @param string|int duration a string (fast, normal or slow) or a number of millisecond. Default: 'normal'. - optional
	 * @param function callback any function to call at the end of the effect. Default: none. - optional
	 */
	$.fn.expand = function(duration, callback)
	{
		this.each(function(i)
		{
			// Init
			var element = $(this);
			element.css('display', 'block');
			
			// Reset and get values
			element.stop(true).css({
				'overflow': '',
				'height': '',
				'paddingTop': '',
				'paddingBottom': '',
				'borderTopWidth': '',
				'borderBottomWidth': '',
				'marginTop': '',
				'marginBottom': ''
			});
			var height = element.height();
			var paddingTop = parseInt(element.css('padding-top'));
			var paddingBottom = parseInt(element.css('padding-bottom'));
			var marginTop = parseInt(element.css('margin-top'));
			var marginBottom = parseInt(element.css('margin-bottom'));
			
			// Initial and target values
			var css = {
				'overflow': 'hidden',
				'height': 0,
				'paddingTop': 0,
				'paddingBottom': 0
			};
			var anim = {
				'height': height,
				'paddingTop': paddingTop,
				'paddingBottom': paddingBottom
			};
			
			// IE8 and lower do not understand border-xx-width
			// http://forum.jquery.com/topic/ie-invalid-argument
			if (!$.browser.msie || $.browser.version > 8)
			{
				var borderTopWidth = parseInt(element.css('border-top-width'));
				var borderBottomWidth = parseInt(element.css('border-bottom-width'));
				
				// Border width is not set to 0 because it does not allow fluid movement 
				css.borderTopWidth = '1px';
				css.borderBottomWidth = '1px';
				anim.borderTopWidth = borderTopWidth;
				anim.borderBottomWidth = borderBottomWidth;
			}
			
			// Detection of elements sticking to their predecessor
			var prev = element.prev();
			if (prev.length === 0 && parseInt(element.css('margin-bottom'))+marginTop !== 0)
			{
				css.marginTop = Math.min(0, marginTop);
				css.marginBottom = Math.min(0, marginBottom);
				anim.marginTop = marginTop;
				anim.marginBottom = marginBottom;
			}
			
			// Effect
			element.stop(true).css(css).animate(anim, {
				'duration': duration,
				'complete': function()
				{
					// Reset properties
					$(this).css({
						'display': '',
						'overflow': '',
						'height': '',
						'paddingTop': '',
						'paddingBottom': '',
						'borderTopWidth': '',
						'borderBottomWidth': '',
						'marginTop': '',
						'marginBottom': ''
					});
					
					// Callback function
					if (callback)
					{
						callback.apply(this);
					}
					
					// Required for IE7 - don't ask me why...
					if ($.browser.msie && $.browser.version < 8)
					{
						$(this).css('zoom', 1);
					}
				}
			});
		});
		
		return this;
	};
	
	/**
	 * Remove an element with folding effect
	 * @param string|int duration a string (fast, normal or slow) or a number of millisecond. Default: 'normal'. - optional
	 * @param function callback any function to call at the end of the effect. Default: none. - optional
	 */
	$.fn.foldAndRemove = function(duration, callback)
	{
		$(this).fold(duration, function()
		{
			// Callback function
			if (callback)
			{
				callback.apply(this);
			}
			
			$(this).remove();
		});
		
		return this;
	}
	
	/**
	 * Remove an element with fading then folding effect
	 * @param string|int duration a string (fast, normal or slow) or a number of millisecond. Default: 'normal'. - optional
	 * @param function callback any function to call at the end of the effect. Default: none. - optional
	 */
	$.fn.fadeAndRemove = function(duration, callback)
	{
		this.animate({'opacity': 0}, {
			'duration': duration,
			'complete': function()
			{
				// No folding required if the element has position: absolute (not in the elements flow)
				if ($(this).css('position') == 'absolute')
				{
					// Callback function
					if (callback)
					{
						callback.apply(this);
					}
					
					$(this).remove();
				}
				else
				{
					$(this).slideUp(duration, function()
					{
						// Callback function
						if (callback)
						{
							callback.apply(this);
						}
						
						$(this).remove();
					});
				}
			}
		});
		
		return this;
	};
	
	/**
	 * Open/close fieldsets
	 */
	$.fn.toggleFieldsetOpen = function()
	{
		this.each(function()
		{
			/*
			 * Tip: if you want to add animation or do anything that should not occur at startup closing, 
			 * check if the element has the class 'collapse':
			 * if (!$(this).hasClass('collapse')) { // Anything that sould no occur at startup }
			 */
			
			// Change
			$(this).closest('fieldset, .fieldset').toggleClass('collapsed');
		});
		
		return this;
	};
	
	/**
	 * Add a semi-transparent layer in front of an element
	 */
	$.fn.addEffectLayer = function(options)
	{
		var settings = $.extend({}, $.fn.addEffectLayer.defaults, options);
		
		this.each(function(i)
		{
			var element = $(this);
			
			// Add layer
			var refElement = getNodeRefElement(this);
			var layer = $('<div class="loading-mask"><span>'+settings.message+'</span></div>').insertAfter(refElement);
			
			// Position
			var elementOffset = element.position();
			layer.css({
				top: elementOffset.top+'px',
				left: elementOffset.left+'px'
			}).width(element.outerWidth()).height(element.outerHeight());
			
			// Effect
			var span = layer.children('span');
			var marginTop = parseInt(span.css('margin-top'));
			span.css({'opacity':0, 'marginTop':(marginTop-40)+'px'});
			layer.css({'opacity':0}).animate({'opacity':1}, {
				'complete': function()
				{
					span.animate({'opacity': 1, 'marginTop': marginTop+'px'});
				}
			});
		});
		
		return this;
	};
	
	/**
	 * Retrieve the reference element after which the layer will be inserted
	 * @param HTMLelement node the node on which the effect is applied
	 * @return HTMLelement the reference node
	 */
	function getNodeRefElement(node)
	{
		var element = $(node);
		
		// Special case
		if (node.nodeName.toLowerCase() == 'document' || node.nodeName.toLowerCase() == 'body')
		{
			var refElement = $(document.body).children(':last').get(0);
		}
		else
		{
			// Look for the reference element, the one after which the layer will be inserted
			var refElement = node;
			var offsetParent = element.offsetParent().get(0);
			
			// List of elements in which we can add a div
			var absPos = ['absolute', 'relative'];
			while (refElement && refElement !== offsetParent && !$.inArray($(refElement.parentNode).css('position'), absPos))
			{
				refElement = refElement.parentNode;
			}
		}
		
		return refElement;
	}
	
	// Default params for the loading effect layer
	$.fn.addEffectLayer.defaults = {
		message: 'Please wait...'
	};
	
	/**
	 * jQuery load() method wrapper : add a visual effect on the load() target
	 * Parameters are the same as load()
	 */
	$.fn.loadWithEffect = function()
	{
		// Add effect layer
		this.addEffectLayer({
			message: $.fn.loadWithEffect.defaults.message
		});
		
		// Rewrite callback function
		var target = this;
		var callback = false;
		var args = $.makeArray(arguments);
		var index = args.length;
		if (args[2] && typeof args[2] == 'function')
		{
			callback = args[2];
			index = 2;
		}
		else if (args[1] && typeof args[1] == 'function')
		{
			callback = args[1];
			index = 1;
		}
		
		// Custom callback
		args[index] = function(responseText, textStatus, XMLHttpRequest)
		{
			// Get the effect layer
			var refElement = getNodeRefElement(this);
			var layer = $(refElement).next('.loading-mask');
			var span = layer.children('span');
			
			// If success
			if (textStatus == 'success' || textStatus == 'notmodified')
			{
				// Initial callback
				if (callback)
				{
					callback.apply(this, arguments);
				}
				
				// Remove effect layer
				layer.stop(true);
				span.stop(true);
				var currentMarginTop = parseInt(span.css('margin-top'));
				var marginTop = parseInt(span.css('margin-top', '').css('margin-top'));
				span.css({'marginTop':currentMarginTop+'px'}).animate({'opacity':0, 'marginTop':(marginTop-40)+'px'}, {
					'complete': function()
					{
						layer.fadeAndRemove();
					}
				});
			}
			else
			{
				span.addClass('error').html($.fn.loadWithEffect.defaults.errorMessage+'<br><a href="#">'+$.fn.loadWithEffect.defaults.retry+'</a> / <a href="#">'+$.fn.loadWithEffect.defaults.cancel+'</a>');
				span.children('a:first').click(function(event)
				{
					event.preventDefault();
					
					// Relaunch request
					$.fn.load.apply(target, args);
					
					// Reset
					span.removeClass('error').html($.fn.loadWithEffect.defaults.message).css('margin-left', '');
				});
				span.children('a:last').click(function(event)
				{
					event.preventDefault();
					
					// Remove effect layer
					layer.stop(true);
					span.stop(true);
					var currentMarginTop = parseInt(span.css('margin-top'));
					var marginTop = parseInt(span.css('margin-top', '').css('margin-top'));
					span.css({'marginTop':currentMarginTop+'px'}).animate({'opacity':0, 'marginTop':(marginTop-40)+'px'}, {
						'complete': function()
						{
							layer.fadeAndRemove();
						}
					});
				});
				
				// Centering
				span.css('margin-left', -Math.round(span.outerWidth()/2));
			}
		};
		
		// Redirect to jQuery load
		$.fn.load.apply(target, args);
		
		return this;
	};
	
	// Default texts for the loading effect layer
	$.fn.loadWithEffect.defaults = {
		message: 'Loading...',
		errorMessage: 'Error while loading',
		retry: 'Retry',
		cancel: 'Cancel'
	};
	
	/**
	 * Enable any button with workaround for IE lack of :disabled selector
	 */
	$.fn.enableBt = function()
	{
		$(this).attr('disabled', false);
		if ($.browser.msie && $.browser.version < 9)
		{
			$(this).removeClass('disabled');
		}
	}
	
	/**
	 * Disable any button with workaround for IE lack of :disabled selector
	 */
	$.fn.disableBt = function()
	{
		$(this).attr('disabled', true);
		if ($.browser.msie && $.browser.version < 9)
		{
			$(this).addClass('disabled');
		}
	}
	
})(jQuery);
/**
 * The accessibleList plugin provides two transformations to improve lists display:
 * - truncate list to a given length, and add a 'more' button to reveal the whole list
 * - paginate long lists so they are easier to read
 * Each effect can be used without the other, or simultaneously
 */


(function($)
{
	/**
	 * Add controls to a list
	 */
	$.fn.accessibleList = function(options)
	{
		var settings = $.extend({}, $.fn.accessibleList.defaults, options);
		var inited = false;
		
		this.each(function(i)
		{
			var list = $(this);
			var lines = list.children();
			var listNode = list;
			var currentPage;
			var pagination = false;
			
			// Detect lag in rendering (IE...)
			if (list.height() == 0)
			{
				setTimeout(function() { list.accessibleList(options); }, 20);
				return;
			}
			
			// Setup
			list.css('overflow', 'hidden').addClass('relative');
			var listHeight = list.height();
			
			if (settings.pageSize && lines.length > settings.pageSize)
			{
				var nbPages = Math.max(1, Math.ceil(lines.length/settings.pageSize));
				currentPage = Math.max(1, Math.min(nbPages, settings.startPage));
				
				// Setup pages
				var width = list.width();
				list.width(width);
				var linePage = 0;
				var lineRow = 0;
				var height = 0;
				listHeight = 0;
				lines.addClass('absolute').css({
					width: (width-parseInt(lines.css('padding-left'))-parseInt(lines.css('padding-right')))+'px',
					overflow: 'hidden',
					textOverflow: 'ellipsis'
				}).each(function(i)
				{
					var line = $(this);
					line.css('top', height+'px').css('left', (linePage*100)+'%');
					height += line.outerHeight();
					
					++lineRow;
					if (lineRow == settings.pageSize)
					{
						// Detect listHeight
						if (height > listHeight)
						{
							listHeight = height;	
						}
						
						++linePage;
						lineRow = 0;
						height = 0;
					}
					else
					{
						height += parseInt(line.css('margin-bottom'));
					}
					
				}).attr('scrollLeft', (currentPage-1)*width);
				list.height(listHeight);
				
				// Create pagination
				pagination = listNode.after('<ul class="small-pagination"></ul>').next();
				for (number = 0; number < nbPages; ++number)
				{
					pagination.append(' <li><a href="#" title="Page '+(number+1)+'">'+(number+1)+'</a></li>');
				}
				var links = pagination.find('a');
				links.click(function(event)
				{
					// Stop link action
					event.preventDefault();
					var element = $(this);
					
					// Page number
					currentPage = parseInt(element.text());
					if (isNaN(currentPage))
					{
						currentPage = 1;
					}
					
					// Show page
					var scrollVal = (currentPage-1)*width;
					if (inited && settings.animate)
					{
						list.animate({scrollLeft: scrollVal});
					}
					else
					{
						list.attr('scrollLeft', scrollVal);
					}
					
					// Style
					element.parent().addClass('current').siblings().removeClass('current');
					if (currentPage == 1)
					{
						pagination.find('li.prev').css('visibility', 'hidden');
					}
					else
					{
						pagination.find('li.prev').css('visibility', 'visible');
					}
					if (currentPage == nbPages)
					{
						pagination.find('li.next').css('visibility', 'hidden');
					}
					else
					{
						pagination.find('li.next').css('visibility', 'visible');
					}
					
					// Callback
					if (settings.after)
					{
						settings.after.call(list.get(0));
					}
				});
				
				// Prev / next buttons
				pagination.prepend('<li class="prev"><a href="#">Prev</a></li>').find('li.prev a').click(function()
				{
					pagination.find('li.current').prev().not('.prev').children('a').trigger('click');
				});
				pagination.append(' <li class="next"><a href="#">Next</a></li>').find('li.next a').click(function()
				{
					pagination.find('li.current').next().not('.next').children('a').trigger('click');
				});
				
				// First update
				links.eq(currentPage-1).trigger('click');
				
				// Prepare for next condition
				listNode = pagination;
			}
			
			if (settings.moreAfter && lines.length > settings.moreAfter)
			{
				var expanded = true;
				
				var more = $('<a href="#" class="search-less">'+settings.lessText+'</a>').insertAfter(listNode).click(function(event)
				{
					// Stop link action
					event.preventDefault();
					
					// Detect mode
					if (!expanded)
					{
						if (inited && settings.animate)
						{
							list.animate({'height':listHeight});
						}
						else
						{
							list.css({'height':listHeight});
						}
						
						// Pagination
						if (pagination)
						{
							if (inited && settings.animate)
							{
								pagination.expand();
							}
							else
							{
								pagination.show();
							}
						}
						
						// More button
						more.removeClass('search-more').addClass('search-less').text(settings.lessText);
						expanded = true;
					}
					else
					{
						// Gather visible elements
						if (settings.pageSize && lines.length > settings.pageSize)
						{
							var visibleLines = lines;
							var rangeStart = (currentPage-1)*settings.pageSize;
							if (rangeStart > 0)
							{
								visibleLines = visibleLines.filter(':gt('+(rangeStart-1)+')');
							}
							visibleLines = visibleLines.filter(':lt('+settings.moreAfter+')');
						}
						else
						{
							var visibleLines = lines.filter(':lt('+settings.moreAfter+')');
						}
						
						// Calculate visible height
						var visibleHeight = 0;
						var visibleCount = visibleLines.length;
						visibleLines.each(function(i)
						{
							visibleHeight += $(this).outerHeight();
							if (i < visibleCount-1)
							{
								visibleHeight += parseInt($(this).css('margin-bottom'));
							}
						});
						
						if (inited && settings.animate)
						{
							list.animate({'height': visibleHeight});
						}
						else
						{
							list.css({'height': visibleHeight});
						}
						
						// Pagination
						if (pagination)
						{
							if (inited && settings.animate)
							{
								pagination.fold();
							}
							else
							{
								pagination.hide();
							}
						}
						
						// More button
						more.removeClass('search-less').addClass('search-more').text(settings.moreText);
						expanded = false;
					}
					
					// Callback
					if (settings.after)
					{
						settings.after.call(list.get(0));
					}
				});
				
				if (!settings.openedOnStart)
				{
					more.trigger('click');
				}
			}
		});
		
		// List ready
		inited = true;
		
		return this;
	};
	
	$.fn.accessibleList.defaults = {
		/**
		 * Max number of visible lines in each list above 'more' button (0 for no masking)
		 * @var int
		 */
		moreAfter: 2,
		
		/**
		 * Number of visible matches per page (0 for no pagination)
		 * @var int
		 */
		pageSize: 7,
		
		/**
		 * Number of page displayed on startup
		 * @var int
		 */
		startPage: 1,
		
		/**
		 * Tell wether the list should be expanded on startup (ignored if moreAfter is on 0)
		 * @var boolean
		 */
		openedOnStart: false,
		
		/**
		 * Enable animation on list expand/page change
		 * @var boolean
		 */
		animate: true,
		
		/**
		 * Text for the 'more' button
		 * @var string
		 */
		moreText: 'More',
		
		/**
		 * Text for the 'less' button
		 * @var string
		 */
		lessText: 'Less',
		
		/**
		 * Callback function after collapsing/expading/changing page. 'this' is the target list
		 * @var function|boolean
		 */
		after: false
	};

})(jQuery);
/**
 * Enables the context menu for elements bound to the 'contextMenu' event
 */


(function($)
{
	/*
	 * Enable context menu
	 */
	document.oncontextmenu = function(event)
	{
		var e = window.event || event;
		var target = $(e.target || e.srcElement);
		var list = [];
		target.trigger('contextMenu', [list]);
		
		// If some menu elements added
		if (list.length > 0)
		{
			// Mouse position
			var posx = 0;
			var posy = 0;
			if (e.pageX || e.pageY)
			{
				posx = e.pageX;
				posy = e.pageY;
			}
			else if (e.clientX || e.clientY)
			{
				posx = e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
				posy = e.clientY+document.body.scrollTop+document.documentElement.scrollTop;
			}
			
			$('#contextMenu').html(buildMenuLevel(list)).css({
				top: posy+'px',
				left: posx+'px'
			}).show().openDropDownMenu();
			
			// Listener
			$(document).bind('click', closeContextMenu);
			
			// Prevent browser menu
			return false;
		}
	};
	
	/*
	 * Simple functions for closing menu
	 */
	function closeContextMenu()
	{
		$('#contextMenu').empty().hide();
		removeBinding();
	};
	function removeBinding()
	{
		$(document).unbind('click', closeContextMenu);
	};
	
	// Insert menu element
	$(document).ready(function()
	{
		$(document.body).append('<div id="contextMenu" class="menu"></div>');
	});
	
	/**
	 * Builds a level of the menu (recursive function)
	 * @param array list the menu elements list
	 */
	function buildMenuLevel(list)
	{
		var html = '<ul>';
		var defaults = {
			text: 'Link',
			alt: '',
			link: '',
			subs: [],
			icon: ''
		};
		
		for (var element in list)
		{
			// If separation
			if (typeof(list[element]) != 'object')
			{
				html += '<li class="sep"></li>';
			}
			else
			{
				var el = $.extend({}, defaults, list[element]);
				var alt = (el.alt.length > 0) ? ' title="'+el.alt+'"' : '';
				var icon = (el.icon.length > 0) ? ' class="icon_'+el.icon+'"' : '';
				if (el.link.length > 0)
				{
					var opener = 'a href="'+el.link+'"';
					var closer = 'a';
				}
				else
				{
					var opener = 'span';
					var closer = 'span';
				}
				
				// Opening
				html += '<li'+icon+'><'+opener+alt+'>'+el.text+'</'+closer+'>';
				
				// If sub menus
				if (typeof(el.subs) == 'object' && el.subs.length > 0)
				{
					html += buildMenuLevel(el.subs);
				}
				
				// Close
				html += '</li>';
			}
		}
		
		return html+'</ul>';
	};

})(jQuery);
/**
 * Modal window extension
 */


(function($)
{
	/**
	 * Opens a new modal window
	 * @param object options an object with any of the following options
	 * @return object the jQuery object of the new window
	 */
	$.modal = function(options)
	{
		var settings = $.extend({}, $.modal.defaults, options),
			root = getModalDiv(),
			
			// Vars for resizeFunc and moveFunc
			winX = 0,
			winY = 0,
			contentWidth = 0,
			contentHeight = 0,
			mouseX = 0,
			mouseY = 0,
			resized, content = '', contentObj;
		
		// Title
		var titleClass = settings.title ? '' : ' no-title';
		var title = settings.title ? '<h1>'+settings.title+'</h1>' : '';
		
		// Borders
		var borderOpen = settings.border ? '"><div class="block-content'+titleClass : titleClass;
		var borderClose = settings.border ? '></div' : '';
		
		// If iframe
		if (settings.useIframe)
		{
			// Content size
			var sizeParts = new Array();
			if (settings.width)
			{
				sizeParts.push('width="'+settings.width+'"');
			}
			else if (settings.maxWidth)
			{
				sizeParts.push('width="'+settings.maxWidth+'"');
			}
			else
			{
				sizeParts.push('width="'+settings.minWidth+'"');
			}
			if (settings.height)
			{
				sizeParts.push('height="'+settings.height+'"');
			}
			else if (settings.maxHeight)
			{
				sizeParts.push('height="'+settings.maxHeight+'"');
			}
			else
			{
				sizeParts.push('height="'+settings.minHeight+'"');
			}
			
			// Bloc style
			var contentWrapper = '<div class="modal-iframe-wrapper"><iframe src="'+settings.url+'" class="modal-content" frameborder="0" '+sizeParts.join(' ')+'></iframe></div>';
		}
		else
		{
			// Get contents
			if (settings.content)
			{
				if (typeof(settings.content) == 'string')
				{
					content = settings.content;
				}
				else
				{
					contentObj = settings.content.clone(true).show();
				}
			}
			else
			{
				// No content
				content = '';
			}
			
			// Content size
			var sizeParts = new Array();
			sizeParts.push('min-width:'+settings.minWidth+'px;');
			sizeParts.push('min-height:'+settings.minHeight+'px;');
			if (settings.width)
			{
				sizeParts.push('width:'+settings.width+'px; ');
			}
			if (settings.height)
			{
				sizeParts.push('height:'+settings.height+'px; ');
			}
			if (settings.maxWidth)
			{
				sizeParts.push('max-width:'+settings.maxWidth+'px; ');
			}
			if (settings.maxHeight)
			{
				sizeParts.push('max-height:'+settings.maxHeight+'px; ');
			}
			var contentStyle = (sizeParts.length > 0) ? ' style="'+sizeParts.join(' ')+'"' : '';
			
			// Scrolling
			var scrollClass = settings.scrolling ? ' modal-scroll' : '';
			
			// Bloc style
			var contentWrapper = '<div class="modal-content'+scrollClass+'"'+contentStyle+'>'+content+'</div>';
		}
		
		// Insert window
		var win = $('<div class="modal-window block-border'+borderOpen+'">'+title+contentWrapper+'</div'+borderClose+'>').appendTo(root);
		var contentBlock = win.find('.modal-content');
		var contentBlockWrapper = settings.useIframe ? contentBlock.parent() : contentBlock;
		if (contentObj)
		{
			contentObj.appendTo(contentBlockWrapper);
		}
		
		// If resizable
		if (settings.resizable && settings.border)
		{
			// Custom function (to use correct var scope)
			var resizeFunc = function(event)
			{
					// Mouse offset
				var offsetX = event.pageX-mouseX,
					offsetY = event.pageY-mouseY,
				
					// New size
					newWidth = Math.max(settings.minWidth, contentWidth+(resized.width*offsetX)),
					newHeight = Math.max(settings.minHeight, contentHeight+(resized.height*offsetY)),
					
					// Position correction
					correctX = 0,
					correctY = 0;
				
				// If max sizes are defined
				if (settings.maxWidth && newWidth > settings.maxWidth)
				{
					correctX = newWidth-settings.maxWidth;
					newWidth = settings.maxWidth;
				}
				if (settings.maxHeight && newHeight > settings.maxHeight)
				{
					correctY = newHeight-settings.maxHeight;
					newHeight = settings.maxHeight;
				}
				
				if (settings.useIframe)
				{
					contentBlock.attr('width', newWidth).attr('height', newHeight);
				}
				else
				{
					contentBlock.css({
						width: newWidth+'px',
						height: newHeight+'px'
					});
				}
				win.css({
					left: (winX+(resized.left*(offsetX+correctX)))+'px',
					top: (winY+(resized.top*(offsetY+correctY)))+'px'
				});
			};
			
			// Create resize handlers
			$('<div class="modal-resize-tl"></div>').appendTo(win).data('modal-resize', {
				top: 1, left: 1,
				height: -1, width: -1
				
			}).add(
				$('<div class="modal-resize-t"></div>').appendTo(win).data('modal-resize', {
					top: 1, left: 0,
					height: -1, width: 0
				})
			).add(
				$('<div class="modal-resize-tr"></div>').appendTo(win).data('modal-resize', {
					top: 1, left: 0,
					height: -1, width: 1
				})
			).add(
				$('<div class="modal-resize-r"></div>').appendTo(win).data('modal-resize', {
					top: 0, left: 0,
					height: 0, width: 1
				})
			).add(
				$('<div class="modal-resize-br"></div>').appendTo(win).data('modal-resize', {
					top: 0, left: 0,
					height: 1, width: 1
				})
			).add(
				$('<div class="modal-resize-b"></div>').appendTo(win).data('modal-resize', {
					top: 0, left: 0,
					height: 1, width: 0
				})
			).add(
				$('<div class="modal-resize-bl"></div>').appendTo(win).data('modal-resize', {
					top: 0, left: 1,
					height: 1, width: -1
				})
			).add(
				$('<div class="modal-resize-l"></div>').appendTo(win).data('modal-resize', {
					top: 0, left: 1,
					height: 0, width: -1
				})
			).mousedown(function(event)
			{
				// Detect positions
				contentWidth = contentBlock.width();
				contentHeight = contentBlock.height();
				var position = win.position();
				winX = position.left;
				winY = position.top;
				mouseX = event.pageX;
				mouseY = event.pageY;
				resized = $(this).data('modal-resize');
				
				// Prevent text selection
				event.preventDefault();
				
				$(document).bind('mousemove', resizeFunc);
				
			})
			root.mouseup(function()
			{
				$(document).unbind('mousemove', resizeFunc);
			});
		}
		
		// Put in front
		win.mousedown(function()
		{
			$(this).putModalOnFront();
		});
		
		// If movable
		if (settings.draggable && title)
		{
			// Custom functions (to use correct var scope)
			var moveFunc = function(event)
			{
				// Window and document sizes
				var width = win.outerWidth(),
					height = win.outerHeight();
				
				// New position
				win.css({
					left: Math.max(0, Math.min(winX+(event.pageX-mouseX), $(root).width()-width))+'px',
					top: Math.max(0, Math.min(winY+(event.pageY-mouseY), $(root).height()-height))+'px'
				});
			};
			
			// Listeners
			win.find('h1:first').mousedown(function(event)
			{
				// Detect positions
				var position = win.position();
				winX = position.left;
				winY = position.top;
				mouseX = event.pageX;
				mouseY = event.pageY;
				
				// Prevent text selection
				event.preventDefault();
				
				$(document).bind('mousemove', moveFunc);
				
			});
			root.mouseup(function()
			{
				$(document).unbind('mousemove', moveFunc);
			});

		}
		
		// Close button
		if (settings.closeButton)
		{
			$('<ul class="action-tabs right"><li><a href="#" title="Close window"><img src="images/icons/fugue/cross-circle.png" width="16" height="16"></a></li></ul>')
				.prependTo(win)
				.find('a').click(function(event)
				{
					event.preventDefault();
					$(this).closest('.modal-window').closeModal();
				});
		}
		
		// Bottom buttons
		var buttonsFooter = false;
		$.each(settings.buttons, function(key, value)
		{
			// Button zone
			if (!buttonsFooter)
			{
				buttonsFooter = $('<div class="block-footer align-'+settings.buttonsAlign+'"></div>').insertAfter(contentBlockWrapper);
			}
			else
			{
				// Spacing
				buttonsFooter.append('&nbsp;');
			}
			
			$('<button type="button">'+key+'</button>').appendTo(buttonsFooter).click(function(event)
			{																			   
				value.call(this, $(this).closest('.modal-window'), event);
			});
		});
		
		// Close function
		if (settings.onClose)
		{
			win.bind('closeModal', settings.onClose);
		}
		
		// Apply template setup
		win.applyTemplateSetup();
		
		// Effect
		if (!root.is(':visible'))
		{
			win.hide();
			root.fadeIn('normal', function()
			{
				win.show().centerModal();
			});
		}
		else
		{
			win.centerModal();
		}
		
		// Store as current
		$.modal.current = win;
		$.modal.all = root.children('.modal-window');
				
		// Callback
		if (settings.onOpen)
		{
			settings.onOpen.call(win.get(0));
		}
		
		// If content url
		if (settings.url)
		{
			win.loadModalContent(settings.url, settings);
		}
		
		return win;
	};
	
	/**
	 * Shortcut to the current window
	 * @var jQuery|boolean
	 */
	$.modal.current = false;
	
	/**
	 * jQuery selection of all opened modal windows
	 * @var jQuery
	 */
	$.modal.all = $();
	
	/**
	 * Wraps the selected elements content in a new modal window
	 * @param object options same as $.modal()
	 * @return jQuery the new windows
	 */
	$.fn.modal = function(options)
	{
		var modals = $();
		
		this.each(function()
		{
			modals.add($.modal($.extend(options, {content: $(this).clone(true).show()})));
		});
		
		return modals;
	};
	
	/**
	 * Use this method to retrieve the content div in the modal window
	 */
	$.fn.getModalContentBlock = function()
	{
		return this.find('.modal-content');
	}
	
	/**
	 * Use this method to retrieve the modal window from any element within it
	 */
	$.fn.getModalWindow = function()
	{
		return this.closest('.modal-window');
	}
	
	/**
	 * Set window content (only if not using iframe)
	 * @param string|jQuery content the content to put: HTML or a jQuery object
	 * @param boolean resize use true to resize window to fit content (height only)
	 */
	$.fn.setModalContent = function(content, resize)
	{
		this.each(function()
		{
			var contentBlock = $(this).getModalContentBlock().not('iframe');
			
			// Only if not iframe
			if (contentBlock.length > 0)
			{
				// Set content
				if (typeof(content) == 'string')
				{
					contentBlock.html(content);
				}
				else
				{
					content.clone(true).show().appendTo(contentBlock);
				}
				contentBlock.applyTemplateSetup();
				
				// Resizing
				if (resize)
				{
					contentBlock.setModalContentSize(true, false);
				}
			}
		});
		
		return this;
	}
	
	/**
	 * Set window content-block size
	 * @param int|boolean width the width to set, true to keep current or false for fluid width (false only works if not iframe)
	 * @param int|boolean height the height to set, true to keep current or false for fluid height (false only works if not iframe)
	 */
	$.fn.setModalContentSize = function(width, height)
	{
		this.each(function()
		{
			var contentBlock = $(this).getModalContentBlock(),
				useIframe = contentBlock.is('iframe');
			
			// Resizing
			if (width !== true)
			{
				if (useIframe)
				{
					if (width)
					{
						contentBlock.attr('width', width);
					}
				}
				else
				{
					contentBlock.css('width', width ? width+'px' : '');
				}
			}
			if (height !== true)
			{
				if (useIframe)
				{
					if (height)
					{
						contentBlock.attr('height', height);
					}
				}
				else
				{
					contentBlock.css('height', height ? height+'px' : '');
				}
			}
		});
		
		return this;
	}
	
	/**
	 * Load AJAX content
	 * @param string url the content url
	 * @param object options (only if not using iframe) an object with any of the following options:
	 * 		- string loadingMessage any message to display while loading (may contain HTML), or leave empty to keep current content
	 * 		- string|object data a map or string that is sent to the server with the request (same as jQuery.load())
	 * 		- function complete a callback function that is executed when the request completes. (same as jQuery.load())
	 * 		- boolean resize use true to resize window on loading message and when content is loaded. To define separately, use options below:
	 * 		- boolean resizeOnMessage use true to resize window on loading message
	 * 		- boolean resizeOnLoad use true to resize window when content is loaded
	 */
	$.fn.loadModalContent = function(url, options)
	{
		var settings = $.extend({
			loadingMessage: '',
			data: {},
			complete: function(responseText, textStatus, XMLHttpRequest) {},
			resize: true,
			resizeOnMessage: false,
			resizeOnLoad: false
		}, options)
		
		this.each(function()
		{
			var win = $(this),
				contentBlock = win.getModalContentBlock(),
				useIframe = contentBlock.is('iframe');
			
			if (useIframe)
			{
				contentBlock.attr('src', url);
			}
			else
			{
				// If loading message
				if (settings.loadingMessage)
				{
					win.setModalContent('<div class="modal-loading">'+settings.loadingMessage+'</div>', (settings.resize || settings.resizeOnMessage));
				}
				
				contentBlock.load(url, settings.data, function(responseText, textStatus, XMLHttpRequest)
				{
					var hidden = false;
					if (win.is(':hidden'))
					{
						win.show();
						hidden = true;
					}
					
					// Template functions
					contentBlock.applyTemplateSetup();
					
					if (settings.resize || settings.resizeOnLoad)
					{
						contentBlock.setModalContentSize(true, false);
					}
					
					// Callback
					settings.complete.call(this, responseText, textStatus, XMLHttpRequest);
					
					// Reset state
					if (hidden)
					{
						win.hide();
					}
				});
			}
		});
		
		return this;
	}
	
	/**
	 * Set modal title
	 * @param string newTitle the new title (may contain HTML), or an empty string to remove the title
	 */
	$.fn.setModalTitle = function(newTitle)
	{
		this.each(function()
		{
			var win = $(this),
				title = $(this).find('h1'),
				contentBlock = win.hasClass('block-content') ? win : win.children('.block-content:first');
			
			if (newTitle.length > 0)
			{
				if (title.length == 0)
				{
					contentBlock.removeClass('no-title');
					title = $('<h1>'+newTitle+'</h1>').prependTo(contentBlock);
				}
				
				title.html(newTitle);
			}
			else if (title.length > 0)
			{
				title.remove();
				contentBlock.addClass('no-title');
			}
		});
		
		return this;
	}
	
	/**
	 * Add or replace window's buttons - credits to Saruman (http://themeforest.net/user/saruman)
	 * @param object buttons Map of bottom buttons, with text as key and function on click as value - Ex: {'Close' : function(win) { win.closeModal(); } }
	 * @param boolean clear true to remove existing buttons
	 */
	$.fn.addButtons = function(buttons, clear)
	{
		var win = $.modal.current,
			buttonsFooter = win.find('.block-footer');
			contentDiv = win.find('.modal-content');
		
		// Remove previous buttons
		if (clear)
		{
			buttonsFooter.children().remove();
		}
		
		// Add new buttons
		$.each(buttons, function(key, value)
		{
			// Spacing
			buttonsFooter.append('&nbsp;');
			
			// Button
			$('<button type="button">'+key+'</button>').appendTo(buttonsFooter).click(function(event)
			{
				value.call(this, $(this).getModalWindow(), event);
			});
		});
	};
	
	/**
	 * Center the window
	 * @param boolean animate true to animate the window movement
	 */
	$.fn.centerModal = function(animate)
	{
		var root = getModalDiv(),
			rootW = root.width()/2,
			rootH = root.height()/2;
		
		this.each(function()
		{
			var win = $(this),
				winW = Math.round(win.outerWidth()/2),
				winH = Math.round(win.outerHeight()/2);
			
			win[animate ? 'animate' : 'css']({
				left: (rootW-winW)+'px',
				top: (rootH-winH)+'px'
			});
		});
		
		return this;
	};
	
	/**
	 * Put modal on front
	 */
	$.fn.putModalOnFront = function()
	{
		if ($.modal.all.length > 1)
		{
			var root = getModalDiv();
			this.each(function()
			{
				if ($(this).next('.modal-window').length > 0)
				{
					$(this).detach().appendTo(root);
				}
			});
		}
		
		return this;
	};
	
	/**
	 * Closes the window
	 */
	$.fn.closeModal = function()
	{
		this.each(function()
		{
			var event = $.Event('closeModal'),
				win = $(this);
			
			// Events on close
			win.trigger(event);
			if (!event.isDefaultPrevented())
			{
				win.remove();
				
				// Modal root element
				var root = getModalDiv();
				$.modal.all = root.children('.modal-window');
				if ($.modal.all.length == 0)
				{
					$.modal.current = false;
					root.fadeOut('normal');
				}
				else
				{
					// Refresh current
					$.modal.current = $.modal.all.last();
				}
			}
		});
		
		return this;
	};
	
	/**
	 * New modal window options
	 */
	$.modal.defaults = {
		/**
		 * Content of the window: HTML or jQuery object
		 * @var string|jQuery|boolean
		 */
		content: false,
		
		/**
		 * Uses an iframe for content instead of a div
		 * @var boolean
		 */
		useIframe: false,
		
		/**
		 * Url for loading content
		 * @var string|boolean
		 */
		url: false,
		
		/**
		 * Title of the window, or false for none
		 * @var string|boolean
		 */
		title: false,
		
		/**
		 * Add glass-like border to the window (required to enable resizing)
		 * @var boolean
		 */
		border: true,
		
		/**
		 * Enable window moving (only work if title is defined)
		 * @var boolean
		 */
		draggable: true,
		
		/**
		 * Enable window resizing (only work if border is true)
		 * @var boolean
		 */
		resizable: true,
		
		/**
		 * If  true, enable content vertical scrollbar if content is higher than 'height' (or 'maxHeight' if 'height' is undefined)
		 * @var boolean
		 */
		scrolling: true,
		
		/**
		 * Wether or not to display the close window button
		 * @var boolean
		 */
		closeButton: true,
		
		/**
		 * Map of bottom buttons, with text as key and function on click as value
		 * Ex: {'Close' : function(win) { win.closeModal(); } }
		 * @var object
		 */
		buttons: {},
		
		/**
		 * Alignement of buttons ('left', 'center' or 'right')
		 * @var string
		 */
		buttonsAlign: 'right',
		
		/**
		 * Function called when opening window
		 * @var function
		 */
		onOpen: false,
		
		/**
		 * Function called when closing window. It may return false or call event.preventDefault() to prevent closing
		 * @var function
		 */
		onClose: false,
		
		/**
		 * Minimum content height
		 * @var int
		 */
		minHeight: 40,
		
		/**
		 * Minimum content width
		 * @var int
		 */
		minWidth: 200,
		
		/**
		 * Maximum content width, or false for no limit
		 * @var int|boolean
		 */
		maxHeight: false,
		
		/**
		 * Maximum content height, or false for no limit
		 * @var int|boolean
		 */
		maxWidth: false,
		
		/**
		 * Initial content height, or false for fluid size
		 * @var int|boolean
		 */
		height: false,
		
		/**
		 * Initial content width, or false for fluid size
		 * @var int|boolean
		 */
		width: 450,
		
		/**
		 * If AJAX load only - loading message, or false for none (can be HTML)
		 * @var string|boolean
		 */
		loadingMessage: 'Loading...',
		
		/**
		 * If AJAX load only - data a map or string that is sent to the server with the request (same as jQuery.load())
		 * @var string|object
		 */
		data: {},
		
		/**
		 * If AJAX load only - a callback function that is executed when the request completes. (same as jQuery.load())
		 * @var function
		 */
		complete: function(responseText, textStatus, XMLHttpRequest) {},
		
		/**
		 * If AJAX load only - true to resize window on loading message and when content is loaded. To define separately, use options below.
		 * @var boolean
		 */
		resize: true,
		
		/**
		 * If AJAX load only - use true to resize window on loading message
		 * @var boolean
		 */
		resizeOnMessage: false,
		
		/**
		 * If AJAX load only - use true to resize window when content is loaded
		 * @var boolean
		 */
		resizeOnLoad: false
	};
	
	/**
	 * Return the modal windows root div
	 */
	function getModalDiv()
	{
		var modal = $('#modal');
		if (modal.length == 0)
		{
			var target = $(document.body),
				ieDiv = target.children('.ie, ie7');
			
			if (ieDiv.length > 0)
			{
				ieDiv.eq(0).append('<div id="modal"></div>');
			}
			else
			{
				target.append('<div id="modal"></div>');
			}
			modal = $('#modal').hide();
		}
		
		return modal;
	};

})(jQuery);
/**
 * Add tip to any element
 */


(function($)
{
	/**
	 * Adds tip on selected elements
	 * @param object options an object with any of the following options
	 * 		- content: Content of the tip (may be HTML) or false for auto detect (default: false)
	 * 		- onHover: Show tip only on hover (default: true)
	 * 		- reverseHover: Hide tip on hover in, show on hover out (default: false)
	 * 		- stickIfCurrent: Enable permanent tip on elements with the class 'current' (default: false)
	 * 		- currentClass: Name of the 'current' class (default: 'current')
	 * 		- offset: Offset of the tip from the element (default: 4)
	 * 		- position: Position of the tip relative to the element (default: 'top')
	 * 		- animationOffset: Offset for the animation (pixels) (default: 4)
	 * 		- delay: Delay before tip shows up on hover (milliseconds) (default: 0)
	 */
	$.fn.tip = function(options)
	{
		var settings = $.extend({}, $.fn.tip.defaults, options);
		
		// Mode
		if (settings.onHover)
		{
			// Detect current elements
			if (settings.stickIfCurrent)
			{
				this.filter('.'+settings.currentClass).each(function(i)
				{
					$(this).createTip(settings);
				});
			}
			
			// Effect
			if (settings.reverseHover)
			{
				$(this).createTip(settings);
				
				this.hover(function()
				{
					if (!settings.stickIfCurrent || !$(this).hasClass(settings.currentClass))
					{
						$(this).hideTip();
					}
					
				}, function()
				{
					$(this).showTip(settings);
				});
			}
			else
			{
				this.hover(function()
				{
					$(this).showTip(settings);
					
				}, function()
				{
					if (!settings.stickIfCurrent || !$(this).hasClass(settings.currentClass))
					{
						$(this).hideTip();
					}
				});
			}
		}
		else
		{
			this.createTip(settings);
		}
		
		return this;
	};
	
	$.fn.tip.defaults = {
		/**
		 * Content of the tip (may be HTML) or false for auto detect
		 * @var string|boolean
		 */
		content: false,
		
		/**
		 * Show tip only on hover
		 * @var boolean
		 */
		onHover: true,
		
		/**
		 * Hide tip on hover in, show on hover out
		 * @var boolean
		 */
		reverseHover: false,
		
		/**
		 * Enable permanent tip on elements with the class 'current'
		 * @var boolean
		 */
		stickIfCurrent: false,
		
		/**
		 * Name of the 'current' class
		 * @var boolean
		 */
		currentClass: 'current',
		
		/**
		 * Offset of the tip from the element (pixels)
		 * @var int
		 */
		offset: 4,
		
		/**
		 * Position of the tip relative to the element
		 * @var string
		 */
		position: 'top',
		
		/**
		 * Offset for the animation (pixels)
		 * @var int
		 */
		animationOffset: 4,
		
		/**
		 * Delay before tip shows up on hover (milliseconds)
		 * @var int
		 */
		delay: 0
	};
	
	/**
	 * Add tip (if not exist) and show it with effect
	 * @param object options same as the tip() method
	 */
	$.fn.showTip = function(options)
	{
		var settings = $.extend({}, $.fn.tip.defaults, options);
		
		this.each(function(i)
		{
			var element = $(this);
			var oldIE = ($.browser.msie && $.browser.version < 9);
			
			// If tip does not already exist (if current), create it
			var tip = element.data('tip');
			if (!tip)
			{
				element.createTip(settings, oldIE ? false : true);
				tip = element.data('tip');
			}
			else if (settings.content !== element.data('settings').content)
			{
				element.updateTipContent(options.content);
			}
			
			// Animation
			if (!oldIE)	// IE6-8 filters do not allow correct animation (the arrow is truncated)
			{
				var position = getTipPosition(element, tip, settings, false);
				tip.stop(true).delay(settings.delay).animate({
					opacity: 1,
					top: position.top,
					left: position.left
				}, 'fast');
			}
		});
		
		return this;
	};
	
	/**
	 * Hide then remove tip
	 */
	$.fn.hideTip = function()
	{
		this.each(function(i)
		{
			var element = $(this);
			var tip = element.data('tip');
			if (tip)
			{
				var settings = element.data('settings');
				tip.stop(true);
				
				if ($.browser.msie && $.browser.version < 9)
				{
					// IE8 and lower filters do not allow correct animation (the arrow is truncated)
					tip.children('.arrow').remove();
					this.title = tip.html();
					element.data('tip', false);
					tip.remove();
				}
				else
				{
					// Hiding is not relative to the parent element, to prevent weird behaviour if parent is moved or removed
					var position = getFinalPosition(tip, settings);
					var offset = tip.offset();
					
					switch (position)
					{
						case 'right':
							offset.left += settings.animationOffset+settings.offset;
							break;
						
						case 'bottom':
							offset.top += settings.animationOffset+settings.offset;
							break;
						
						case 'left':
							offset.left -= settings.animationOffset+settings.offset;
							break;
						
						default:
							offset.top -= settings.animationOffset+settings.offset;
							break;
					}
					
					tip.animate({
						opacity: 0,
						top: offset.top,
						left: offset.left
					}, {
						complete: function()
						{
							// Restore node
							var tip = $(this);
							var node = tip.data('node');
							if (node)
							{
								tip.children('.arrow').remove();
								node.attr('title', tip.html());
								node.data('tip', false);
							}
							
							// Remove tip
							tip.remove();
						}
					});
				}
			}
		});
		
		return this;
	};
	
	/**
	 * Create tip bubble
	 * @param object settings the options object given to tip()
	 * @param boolean hide indicate whether to hide the tip after creating it or not (default : false)
	 */
	$.fn.createTip = function(settings, hide)
	{
		this.each(function(i)
		{
			var element = $(this);
			var tips = getTipDiv();
			
			// Insertion
			tips.append('<div></div>');
			var tip = tips.children(':last-child');
			
			// Position class
			if (settings.position == 'right' || element.hasClass('tip-right') || element.parent().hasClass('children-tip-right'))
			{
				tip.addClass('tip-right');
			}
			else if (settings.position == 'bottom' || element.hasClass('tip-bottom') || element.parent().hasClass('children-tip-bottom'))
			{
				tip.addClass('tip-bottom');
			}
			else if (settings.position == 'left' || element.hasClass('tip-left') || element.parent().hasClass('children-tip-left'))
			{
				tip.addClass('tip-left');
			}
			
			// Cross references
			tip.data('node', element);
			element.data('tip', tip);
			element.data('settings', settings);
			
			// Content
			element.updateTipContent(settings.content, hide);
			
			// Effect
			if (hide)
			{
				tip.css({opacity:0});	
			}
		});
		
		return this;
	};
	
	/**
	 * Update tip content
	 * @param mixed content any content (text or HTML) for the tip, of false for automatic detection
	 * @param boolean hide optional, compatibility with createTip()
	 */
	$.fn.updateTipContent = function(content, hide)
	{
		this.each(function(i)
		{
			var element = $(this);
			var tip = element.data('tip');
			var settings = element.data('settings');
			
			// If auto tip content
			if (!content)
			{
				if (this.title && this.title.length > 0)
				{
					var finalContent = this.title;
					this.title = '';
				}
				else
				{
					var subTitle = element.find('[title]:first');
					if (subTitle.length > 0)
					{
						var finalContent = subTitle.attr('title');
						subTitle.attr('title', '');
					}
					else
					{
						var finalContent = element.text();
					}
				}
			}
			else
			{
				var finalContent = content;
			}
			
			// If empty
			if (!finalContent || $.trim(finalContent).length == 0)
			{
				finalContent = '<em>No tip</em>';
			}
			
			// Insert
			tip.html(finalContent+'<span class="arrow"><span></span></span>');
			
			// Position
			tip.stop(true, true);
			var position = getTipPosition(element, tip, settings, hide);
			tip.offset(position);
		});
		
		return this;
	};
	
	/**
	 * Call this function to refresh tips when using the stickIfCurrent option 
	 * and the 'current' element has changed
	 */
	$.fn.refreshTip = function()
	{
		this.each(function(i)
		{
			var settings = $(this).data('settings');
			if (settings && settings.stickIfCurrent)
			{
				var element = $(this);
				if (element.hasClass(settings.currentClass))
				{
					element.showTip(settings);
				}
				else
				{
					element.hideTip(settings);
				}
			}
		});
		
		return this;
	};
	
	/**
	 * Detect final position for the tip
	 * @param jQuery tip the tip element
	 * @param Object settings the tip options
	 * @return string the final position
	 */
	function getFinalPosition(tip, settings)
	{
		var position = settings.position;
		if (tip.hasClass('tip-right'))
		{
			position = 'right';
		}
		else if (tip.hasClass('tip-bottom'))
		{
			position = 'bottom';
		}
		else if (tip.hasClass('tip-left'))
		{
			position = 'left';
		}
		
		return position;
	}
	
	/**
	 * Get tip position, relative to the element
	 * @param jQuery element the element on which the the tip show
	 * @param jQuery tip the tip element
	 * @param Object settings the tip options
	 * @param boolean animStart tells wether the tip should be positioned at the start of the animation or not
	 * @return Object an object with two values : 'top' and 'left'
	 */
	function getTipPosition(element, tip, settings, animStart)
	{
		var offset = element.offset();
		var position = getFinalPosition(tip, settings);
		
		switch (position)
		{
			case 'right':
				return {
					top: Math.round(offset.top+(element.outerHeight()/2)-(tip.outerHeight()/2)),
					left: Math.round(offset.left+element.outerWidth()+(animStart ? settings.animationOffset+settings.offset : settings.offset))
				};
				break;
			
			case 'bottom':
				return {
					top: Math.round(offset.top+element.outerHeight()+(animStart ? settings.animationOffset+settings.offset : settings.offset)),
					left: Math.round(offset.left+(element.outerWidth()/2)-(tip.outerWidth()/2))
				};
				break;
			
			case 'left':
				return {
					top: Math.round(offset.top+(element.outerHeight()/2)-(tip.outerHeight()/2)),
					left: Math.round(offset.left-tip.outerWidth()-(animStart ? settings.animationOffset+settings.offset : settings.offset))
				};
				break;
			
			default:
				return {
					top: Math.round(offset.top-tip.outerHeight()-(animStart ? settings.animationOffset+settings.offset : settings.offset)),
					left: Math.round(offset.left+(element.outerWidth()/2)-(tip.outerWidth()/2))
				};
				break;
		}
	}
	
	// If template common functions loaded
	if ($.fn.addTemplateSetup)
	{
		$.fn.addTemplateSetup(function()
		{
			this.find('.with-tip, .with-children-tip > *').tip();
		});
	}
	else
	{
		// Default behaviour
		$(document).ready(function()
		{
			$('.with-tip, .with-children-tip > *').tip();
		});
	}
	
	/**
	 * Return the tips div, or create it if it does not exist
	 */
	function getTipDiv()
	{
		var tips = $('#tips');
		if (tips.length == 0)
		{
			$(document.body).append('<div id="tips"></div>');
			tips = $('#tips');
		}
		
		return tips;
	}
	
	// Handle viewport resizing
	$(window).resize(function()
	{
		getTipDiv().children().each(function(i)
		{
			// Init
			var tip = $(this);
			var element = tip.data('node');
			var settings = element.data('settings');
			var isCurrent = settings.stickIfCurrent && element.hasClass(settings.currentClass);
			
			// Position
			var animate = (settings.onHover && !isCurrent);
			tip.stop(true, true);
			var position = getTipPosition(element, tip, settings, animate);
			tip.offset(position);
		});
	});

})(jQuery);
/*! jQuery v1.6.3 http://jquery.com/ | http://jquery.org/license */

(function(a,b){function cu(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cr(a){if(!cg[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){ch||(ch=c.createElement("iframe"),ch.frameBorder=ch.width=ch.height=0),b.appendChild(ch);if(!ci||!ch.createElement)ci=(ch.contentWindow||ch.contentDocument).document,ci.write((c.compatMode==="CSS1Compat"?"<!doctype html>":"")+"<html><body>"),ci.close();d=ci.createElement(a),ci.body.appendChild(d),e=f.css(d,"display"),b.removeChild(ch)}cg[a]=e}return cg[a]}function cq(a,b){var c={};f.each(cm.concat.apply([],cm.slice(0,b)),function(){c[this]=a});return c}function cp(){cn=b}function co(){setTimeout(cp,0);return cn=f.now()}function cf(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ce(){try{return new a.XMLHttpRequest}catch(b){}}function b$(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function bZ(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function bY(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bA.test(a)?d(a,e):bY(a+"["+(typeof e=="object"||f.isArray(e)?b:"")+"]",e,c,d)});else if(!c&&b!=null&&typeof b=="object")for(var e in b)bY(a+"["+e+"]",b[e],c,d);else d(a,b)}function bX(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function bW(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bP,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=bW(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=bW(a,c,d,e,"*",g));return l}function bV(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bL),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function by(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?bt:bu;if(d>0){c!=="border"&&f.each(e,function(){c||(d-=parseFloat(f.css(a,"padding"+this))||0),c==="margin"?d+=parseFloat(f.css(a,c+this))||0:d-=parseFloat(f.css(a,"border"+this+"Width"))||0});return d+"px"}d=bv(a,b,b);if(d<0||d==null)d=a.style[b]||0;d=parseFloat(d)||0,c&&f.each(e,function(){d+=parseFloat(f.css(a,"padding"+this))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+this+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+this))||0)});return d+"px"}function bl(a,b){b.src?f.ajax({url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bd,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)}function bk(a){f.nodeName(a,"input")?bj(a):"getElementsByTagName"in a&&f.grep(a.getElementsByTagName("input"),bj)}function bj(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bi(a){return"getElementsByTagName"in a?a.getElementsByTagName("*"):"querySelectorAll"in a?a.querySelectorAll("*"):[]}function bh(a,b){var c;if(b.nodeType===1){b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase();if(c==="object")b.outerHTML=a.outerHTML;else if(c!=="input"||a.type!=="checkbox"&&a.type!=="radio"){if(c==="option")b.selected=a.defaultSelected;else if(c==="input"||c==="textarea")b.defaultValue=a.defaultValue}else a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value);b.removeAttribute(f.expando)}}function bg(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c=f.expando,d=f.data(a),e=f.data(b,d);if(d=d[c]){var g=d.events;e=e[c]=f.extend({},d);if(g){delete e.handle,e.events={};for(var h in g)for(var i=0,j=g[h].length;i<j;i++)f.event.add(b,h+(g[h][i].namespace?".":"")+g[h][i].namespace,g[h][i],g[h][i].data)}}}}function bf(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function V(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(Q.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function U(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function M(a,b){return(a&&a!=="*"?a+".":"")+b.replace(y,"`").replace(z,"&")}function L(a){var b,c,d,e,g,h,i,j,k,l,m,n,o,p=[],q=[],r=f._data(this,"events");if(!(a.liveFired===this||!r||!r.live||a.target.disabled||a.button&&a.type==="click")){a.namespace&&(n=new RegExp("(^|\\.)"+a.namespace.split(".").join("\\.(?:.*\\.)?")+"(\\.|$)")),a.liveFired=this;var s=r.live.slice(0);for(i=0;i<s.length;i++)g=s[i],g.origType.replace(w,"")===a.type?q.push(g.selector):s.splice(i--,1);e=f(a.target).closest(q,a.currentTarget);for(j=0,k=e.length;j<k;j++){m=e[j];for(i=0;i<s.length;i++){g=s[i];if(m.selector===g.selector&&(!n||n.test(g.namespace))&&!m.elem.disabled){h=m.elem,d=null;if(g.preType==="mouseenter"||g.preType==="mouseleave")a.type=g.preType,d=f(a.relatedTarget).closest(g.selector)[0],d&&f.contains(h,d)&&(d=h);(!d||d!==h)&&p.push({elem:h,handleObj:g,level:m.level})}}}for(j=0,k=p.length;j<k;j++){e=p[j];if(c&&e.level>c)break;a.currentTarget=e.elem,a.data=e.handleObj.data,a.handleObj=e.handleObj,o=e.handleObj.origHandler.apply(e.elem,arguments);if(o===!1||a.isPropagationStopped()){c=e.level,o===!1&&(b=!1);if(a.isImmediatePropagationStopped())break}}return b}}function J(a,c,d){var e=f.extend({},d[0]);e.type=a,e.originalEvent={},e.liveFired=b,f.event.handle.call(c,e),e.isDefaultPrevented()&&d[0].preventDefault()}function D(){return!0}function C(){return!1}function m(a,c,d){var e=c+"defer",g=c+"queue",h=c+"mark",i=f.data(a,e,b,!0);i&&(d==="queue"||!f.data(a,g,b,!0))&&(d==="mark"||!f.data(a,h,b,!0))&&setTimeout(function(){!f.data(a,g,b,!0)&&!f.data(a,h,b,!0)&&(f.removeData(a,e,!0),i.resolve())},0)}function l(a){for(var b in a)if(b!=="toJSON")return!1;return!0}function k(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(j,"$1-$2").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNaN(d)?i.test(d)?f.parseJSON(d):d:parseFloat(d)}catch(g){}f.data(a,c,d)}else d=b}return d}var c=a.document,d=a.navigator,e=a.location,f=function(){function K(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(K,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/\d/,n=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,o=/^[\],:{}\s]*$/,p=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,q=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,r=/(?:^|:|,)(?:\s*\[)+/g,s=/(webkit)[ \/]([\w.]+)/,t=/(opera)(?:.*version)?[ \/]([\w.]+)/,u=/(msie) ([\w.]+)/,v=/(mozilla)(?:.*? rv:([\w.]+))?/,w=/-([a-z]|[0-9])/ig,x=/^-ms-/,y=function(a,b){return(b+"").toUpperCase()},z=d.userAgent,A,B,C,D=Object.prototype.toString,E=Object.prototype.hasOwnProperty,F=Array.prototype.push,G=Array.prototype.slice,H=String.prototype.trim,I=Array.prototype.indexOf,J={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=n.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.6.3",length:0,size:function(){return this.length},toArray:function(){return G.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?F.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),B.done(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(G.apply(this,arguments),"slice",G.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:F,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;B.resolveWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").unbind("ready")}},bindReady:function(){if(!B){B=e._Deferred();if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",C,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",C),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&K()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a&&typeof a=="object"&&"setInterval"in a},isNaN:function(a){return a==null||!m.test(a)||isNaN(a)},type:function(a){return a==null?String(a):J[D.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!E.call(a,"constructor")&&!E.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||E.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw a},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(o.test(b.replace(p,"@").replace(q,"]").replace(r,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(x,"ms-").replace(w,y)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:H?function(a){return a==null?"":H.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?F.call(c,a):e.merge(c,a)}return c},inArray:function(a,b){if(!b)return-1;if(I)return I.call(b,a);for(var c=0,d=b.length;c<d;c++)if(b[c]===a)return c;return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=G.call(arguments,2),g=function(){return a.apply(c,f.concat(G.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h){var i=a.length;if(typeof c=="object"){for(var j in c)e.access(a,j,c[j],f,g,d);return a}if(d!==b){f=!h&&f&&e.isFunction(d);for(var k=0;k<i;k++)g(a[k],c,f?d.call(a[k],k,g(a[k],c)):d,h);return a}return i?g(a[0],c):b},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=s.exec(a)||t.exec(a)||u.exec(a)||a.indexOf("compatible")<0&&v.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){J["[object "+b+"]"]=b.toLowerCase()}),A=e.uaMatch(z),A.browser&&(e.browser[A.browser]=!0,e.browser.version=A.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?C=function(){c.removeEventListener("DOMContentLoaded",C,!1),e.ready()}:c.attachEvent&&(C=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",C),e.ready())});return e}(),g="done fail isResolved isRejected promise then always pipe".split(" "),h=[].slice;f.extend({_Deferred:function(){var a=[],b,c,d,e={done:function(){if(!d){var c=arguments,g,h,i,j,k;b&&(k=b,b=0);for(g=0,h=c.length;g<h;g++)i=c[g],j=f.type(i),j==="array"?e.done.apply(e,i):j==="function"&&a.push(i);k&&e.resolveWith(k[0],k[1])}return this},resolveWith:function(e,f){if(!d&&!b&&!c){f=f||[],c=1;try{while(a[0])a.shift().apply(e,f)}finally{b=[e,f],c=0}}return this},resolve:function(){e.resolveWith(this,arguments);return this},isResolved:function(){return!!c||!!b},cancel:function(){d=1,a=[];return this}};return e},Deferred:function(a){var b=f._Deferred(),c=f._Deferred(),d;f.extend(b,{then:function(a,c){b.done(a).fail(c);return this},always:function(){return b.done.apply(b,arguments).fail.apply(this,arguments)},fail:c.done,rejectWith:c.resolveWith,reject:c.resolve,isRejected:c.isResolved,pipe:function(a,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[c,"reject"]},function(a,c){var e=c[0],g=c[1],h;f.isFunction(e)?b[a](function(){h=e.apply(this,arguments),h&&f.isFunction(h.promise)?h.promise().then(d.resolve,d.reject):d[g+"With"](this===b?d:this,[h])}):b[a](d[g])})}).promise()},promise:function(a){if(a==null){if(d)return d;d=a={}}var c=g.length;while(c--)a[g[c]]=b[g[c]];return a}}),b.done(c.cancel).fail(b.cancel),delete b.cancel,a&&a.call(b,b);return b},when:function(a){function i(a){return function(c){b[a]=arguments.length>1?h.call(arguments,0):c,--e||g.resolveWith(g,h.call(b,0))}}var b=arguments,c=0,d=b.length,e=d,g=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred();if(d>1){for(;c<d;c++)b[c]&&f.isFunction(b[c].promise)?b[c].promise().then(i(c),g.reject):--e;e||g.resolveWith(g,b)}else g!==a&&g.resolveWith(g,d?[a]:[]);return g.promise()}}),f.support=function(){var a=c.createElement("div"),b=c.documentElement,d,e,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u;a.setAttribute("className","t"),a.innerHTML="   <link><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type=checkbox>",d=a.getElementsByTagName("*"),e=a.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=a.getElementsByTagName("input")[0],k={leadingWhitespace:a.firstChild.nodeType===3,tbody:!a.getElementsByTagName("tbody").length,htmlSerialize:!!a.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55$/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:a.className!=="t",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0},i.checked=!0,k.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,k.optDisabled=!h.disabled;try{delete a.test}catch(v){k.deleteExpando=!1}!a.addEventListener&&a.attachEvent&&a.fireEvent&&(a.attachEvent("onclick",function(){k.noCloneEvent=!1}),a.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),k.radioValue=i.value==="t",i.setAttribute("checked","checked"),a.appendChild(i),l=c.createDocumentFragment(),l.appendChild(a.firstChild),k.checkClone=l.cloneNode(!0).cloneNode(!0).lastChild.checked,a.innerHTML="",a.style.width=a.style.paddingLeft="1px",m=c.getElementsByTagName("body")[0],o=c.createElement(m?"div":"body"),p={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},m&&f.extend(p,{position:"absolute",left:"-1000px",top:"-1000px"});for(t in p)o.style[t]=p[t];o.appendChild(a),n=m||b,n.insertBefore(o,n.firstChild),k.appendChecked=i.checked,k.boxModel=a.offsetWidth===2,"zoom"in a.style&&(a.style.display="inline",a.style.zoom=1,k.inlineBlockNeedsLayout=a.offsetWidth===2,a.style.display="",a.innerHTML="<div style='width:4px;'></div>",k.shrinkWrapBlocks=a.offsetWidth!==2),a.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>",q=a.getElementsByTagName("td"),u=q[0].offsetHeight===0,q[0].style.display="",q[1].style.display="none",k.reliableHiddenOffsets=u&&q[0].offsetHeight===0,a.innerHTML="",c.defaultView&&c.defaultView.getComputedStyle&&(j=c.createElement("div"),j.style.width="0",j.style.marginRight="0",a.appendChild(j),k.reliableMarginRight=(parseInt((c.defaultView.getComputedStyle(j,null)||{marginRight:0}).marginRight,10)||0)===0),o.innerHTML="",n.removeChild(o);if(a.attachEvent)for(t in{submit:1,change:1,focusin:1})s="on"+t,u=s in a,u||(a.setAttribute(s,"return;"),u=typeof a[s]=="function"),k[t+"Bubbles"]=u;o=l=g=h=m=j=a=i=null;return k}(),f.boxModel=f.support.boxModel;var i=/^(?:\{.*\}|\[.*\])$/,j=/([a-z])([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!l(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i=f.expando,j=typeof c=="string",k=a.nodeType,l=k?f.cache:a,m=k?a[f.expando]:a[f.expando]&&f.expando;if((!m||e&&m&&l[m]&&!l[m][i])&&j&&d===b)return;m||(k?a[f.expando]=m=++f.uuid:m=f.expando),l[m]||(l[m]={},k||(l[m].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?l[m][i]=f.extend(l[m][i],c):l[m]=f.extend(l[m],c);g=l[m],e&&(g[i]||(g[i]={}),g=g[i]),d!==b&&(g[f.camelCase(c)]=d);if(c==="events"&&!g[c])return g[i]&&g[i].events;j?(h=g[c],h==null&&(h=g[f.camelCase(c)])):h=g;return h}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e=f.expando,g=a.nodeType,h=g?f.cache:a,i=g?a[f.expando]:f.expando;if(!h[i])return;if(b){d=c?h[i][e]:h[i];if(d){d[b]||(b=f.camelCase(b)),delete d[b];if(!l(d))return}}if(c){delete h[i][e];if(!l(h[i]))return}var j=h[i][e];f.support.deleteExpando||!h.setInterval?delete h[i]:h[i]=null,j?(h[i]={},g||(h[i].toJSON=f.noop),h[i][e]=j):g&&(f.support.deleteExpando?delete a[f.expando]:a.removeAttribute?a.removeAttribute(f.expando):a[f.expando]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d=null;if(typeof a=="undefined"){if(this.length){d=f.data(this[0]);if(this[0].nodeType===1){var e=this[0].attributes,g;for(var h=0,i=e.length;h<i;h++)g=e[h].name,g.indexOf("data-")===0&&(g=f.camelCase(g.substring(5)),k(this[0],g,d[g]))}}return d}if(typeof a=="object")return this.each(function(){f.data(this,a)});var j=a.split(".");j[1]=j[1]?"."+j[1]:"";if(c===b){d=this.triggerHandler("getData"+j[1]+"!",[j[0]]),d===b&&this.length&&(d=f.data(this[0],a),d=k(this[0],a,d));return d===b&&j[1]?this.data(j[0]):d}return this.each(function(){var b=f(this),d=[j[0],c];b.triggerHandler("setData"+j[1]+"!",d),f.data(this,a,c),b.triggerHandler("changeData"+j[1]+"!",d)})},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,c){a&&(c=(c||"fx")+"mark",f.data(a,c,(f.data(a,c,b,!0)||0)+1,!0))},_unmark:function(a,c,d){a!==!0&&(d=c,c=a,a=!1);if(c){d=d||"fx";var e=d+"mark",g=a?0:(f.data(c,e,b,!0)||1)-1;g?f.data(c,e,g,!0):(f.removeData(c,e,!0),m(c,d,"mark"))}},queue:function(a,c,d){if(a){c=(c||"fx")+"queue";var e=f.data(a,c,b,!0);d&&(!e||f.isArray(d)?e=f.data(a,c,f.makeArray(d),!0):e.push(d));return e||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e;d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),d.call(a,function(){f.dequeue(a,b)})),c.length||(f.removeData(a,b+"queue",!0),m(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){typeof a!="string"&&(c=a,a="fx");if(c===b)return f.queue(this[0],a);return this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(){var c=this;setTimeout(function(){f.dequeue(c,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f._Deferred(),!0))h++,l.done(m);m();return d.promise()}});var n=/[\n\t\r]/g,o=/\s+/,p=/\r/g,q=/^(?:button|input)$/i,r=/^(?:button|input|object|select|textarea)$/i,s=/^a(?:rea)?$/i,t=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,u,v;f.fn.extend({attr:function(a,b){return f.access(this,a,b,!0,f.attr)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,a,b,!0,f.prop)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(o);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(o);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(n," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(o);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ";for(var c=0,d=this.length;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(n," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e=this[0];if(!arguments.length){if(e){c=f.valHooks[e.nodeName.toLowerCase()]||f.valHooks[e.type];if(c&&"get"in c&&(d=c.get(e,"value"))!==b)return d;d=e.value;return typeof d=="string"?d.replace(p,""):d==null?"":d}return b}var g=f.isFunction(a);return this.each(function(d){var e=f(this),h;if(this.nodeType===1){g?h=a.call(this,d,e.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.nodeName.toLowerCase()]||f.valHooks[this.type];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c=a.selectedIndex,d=[],e=a.options,g=a.type==="select-one";if(c<0)return null;for(var h=g?c:0,i=g?c+1:e.length;h<i;h++){var j=e[h];if(j.selected&&(f.support.optDisabled?!j.disabled:j.getAttribute("disabled")===null)&&(!j.parentNode.disabled||!f.nodeName(j.parentNode,"optgroup"))){b=f(j).val();if(g)return b;d.push(b)}}if(g&&!d.length&&e.length)return f(e[c]).val();return d},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attrFix:{tabindex:"tabIndex"},attr:function(a,c,d,e){var g=a.nodeType;if(!a||g===3||g===8||g===2)return b;if(e&&c in f.attrFn)return f(a)[c](d);if(!("getAttribute"in a))return f.prop(a,c,d);var h,i,j=g!==1||!f.isXMLDoc(a);j&&(c=f.attrFix[c]||c,i=f.attrHooks[c],i||(t.test(c)?i=v:u&&(i=u)));if(d!==b){if(d===null){f.removeAttr(a,c);return b}if(i&&"set"in i&&j&&(h=i.set(a,d,c))!==b)return h;a.setAttribute(c,""+d);return d}if(i&&"get"in i&&j&&(h=i.get(a,c))!==null)return h;h=a.getAttribute(c);return h===null?b:h},removeAttr:function(a,b){var c;a.nodeType===1&&(b=f.attrFix[b]||b,f.attr(a,b,""),a.removeAttribute(b),t.test(b)&&(c=f.propFix[b]||b)in a&&(a[c]=!1))},attrHooks:{type:{set:function(a,b){if(q.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(u&&f.nodeName(a,"button"))return u.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(u&&f.nodeName(a,"button"))return u.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e=a.nodeType;if(!a||e===3||e===8||e===2)return b;var g,h,i=e!==1||!f.isXMLDoc(a);i&&(c=f.propFix[c]||c,h=f.propHooks[c]);return d!==b?h&&"set"in h&&(g=h.set(a,d,c))!==b?g:a[c]=d:h&&"get"in h&&(g=h.get(a,c))!==null?g:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):r.test(a.nodeName)||s.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabIndex=f.propHooks.tabIndex,v={get:function(a,c){var d;return f.prop(a,c)===!0||(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},f.support.getSetAttribute||(u=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&d.nodeValue!==""?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})})),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var w=/\.(.*)$/,x=/^(?:textarea|input|select)$/i,y=/\./g,z=/ /g,A=/[^\w\s.|`]/g,B=function(a){return a.replace(A,"\\$&")};f.event={add:function(a,c,d,e){if(a.nodeType!==3&&a.nodeType!==8){if(d===!1)d=C;else if(!d)return;var g,h;d.handler&&(g=d,d=g.handler),d.guid||(d.guid=f.guid++);var i=f._data(a);if(!i)return;var j=i.events,k=i.handle;j||(i.events=j={}),k||(i.handle=k=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.handle.apply(k.elem,arguments):b}),k.elem=a,c=c.split(" ");var l,m=0,n;while(l=c[m++]){h=g?f.extend({},g):{handler:d,data:e},l.indexOf(".")>-1?(n=l.split("."),l=n.shift(),h.namespace=n.slice(0).sort().join(".")):(n=[],h.namespace=""),h.type=l,h.guid||(h.guid=d.guid);var o=j[l],p=f.event.special[l]||{};if(!o){o=j[l]=[];if(!p.setup||p.setup.call(a,e,n,k)===!1)a.addEventListener?a.addEventListener(l,k,!1):a.attachEvent&&a.attachEvent("on"+l,k)}p.add&&(p.add.call(a,h),h.handler.guid||(h.handler.guid=d.guid)),o.push(h),f.event.global[l]=!0}a=null}},global:{},remove:function(a,c,d,e){if(a.nodeType!==3&&a.nodeType!==8){d===!1&&(d=C);var g,h,i,j,k=0,l,m,n,o,p,q,r,s=f.hasData(a)&&f._data(a),t=s&&s.events;if(!s||!t)return;c&&c.type&&(d=c.handler,c=c.type);if(!c||typeof c=="string"&&c.charAt(0)==="."){c=c||"";for(h in t)f.event.remove(a,h+c);return}c=c.split(" ");while(h=c[k++]){r=h,q=null,l=h.indexOf(".")<0,m=[],l||(m=h.split("."),h=m.shift(),n=new RegExp("(^|\\.)"+f.map(m.slice(0).sort(),B).join("\\.(?:.*\\.)?")+"(\\.|$)")),p=t[h];if(!p)continue;if(!d){for(j=0;j<p.length;j++){q=p[j];if(l||n.test(q.namespace))f.event.remove(a,r,q.handler,j),p.splice(j--,1)}continue}o=f.event.special[h]||{};for(j=e||0;j<p.length;j++){q=p[j];if(d.guid===q.guid){if(l||n.test(q.namespace))e==null&&p.splice(j--,1),o.remove&&o.remove.call(a,q);if(e!=null)break}}if(p.length===0||e!=null&&p.length===1)(!o.teardown||o.teardown.call(a,m)===!1)&&f.removeEvent(a,h,s.handle),g=null
,delete t[h]}if(f.isEmptyObject(t)){var u=s.handle;u&&(u.elem=null),delete s.events,delete s.handle,f.isEmptyObject(s)&&f.removeData(a,b,!0)}}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){var h=c.type||c,i=[],j;h.indexOf("!")>=0&&(h=h.slice(0,-1),j=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if(!!e&&!f.event.customEvent[h]||!!f.event.global[h]){c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.exclusive=j,c.namespace=i.join("."),c.namespace_re=new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)");if(g||!e)c.preventDefault(),c.stopPropagation();if(!e){f.each(f.cache,function(){var a=f.expando,b=this[a];b&&b.events&&b.events[h]&&f.event.trigger(c,d,b.handle.elem)});return}if(e.nodeType===3||e.nodeType===8)return;c.result=b,c.target=e,d=d!=null?f.makeArray(d):[],d.unshift(c);var k=e,l=h.indexOf(":")<0?"on"+h:"";do{var m=f._data(k,"handle");c.currentTarget=k,m&&m.apply(k,d),l&&f.acceptData(k)&&k[l]&&k[l].apply(k,d)===!1&&(c.result=!1,c.preventDefault()),k=k.parentNode||k.ownerDocument||k===c.target.ownerDocument&&a}while(k&&!c.isPropagationStopped());if(!c.isDefaultPrevented()){var n,o=f.event.special[h]||{};if((!o._default||o._default.call(e.ownerDocument,c)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)){try{l&&e[h]&&(n=e[l],n&&(e[l]=null),f.event.triggered=h,e[h]())}catch(p){}n&&(e[l]=n),f.event.triggered=b}}return c.result}},handle:function(c){c=f.event.fix(c||a.event);var d=((f._data(this,"events")||{})[c.type]||[]).slice(0),e=!c.exclusive&&!c.namespace,g=Array.prototype.slice.call(arguments,0);g[0]=c,c.currentTarget=this;for(var h=0,i=d.length;h<i;h++){var j=d[h];if(e||c.namespace_re.test(j.namespace)){c.handler=j.handler,c.data=j.data,c.handleObj=j;var k=j.handler.apply(this,g);k!==b&&(c.result=k,k===!1&&(c.preventDefault(),c.stopPropagation()));if(c.isImmediatePropagationStopped())break}}return c.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(a){if(a[f.expando])return a;var d=a;a=f.Event(d);for(var e=this.props.length,g;e;)g=this.props[--e],a[g]=d[g];a.target||(a.target=a.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),!a.relatedTarget&&a.fromElement&&(a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement);if(a.pageX==null&&a.clientX!=null){var h=a.target.ownerDocument||c,i=h.documentElement,j=h.body;a.pageX=a.clientX+(i&&i.scrollLeft||j&&j.scrollLeft||0)-(i&&i.clientLeft||j&&j.clientLeft||0),a.pageY=a.clientY+(i&&i.scrollTop||j&&j.scrollTop||0)-(i&&i.clientTop||j&&j.clientTop||0)}a.which==null&&(a.charCode!=null||a.keyCode!=null)&&(a.which=a.charCode!=null?a.charCode:a.keyCode),!a.metaKey&&a.ctrlKey&&(a.metaKey=a.ctrlKey),!a.which&&a.button!==b&&(a.which=a.button&1?1:a.button&2?3:a.button&4?2:0);return a},guid:1e8,proxy:f.proxy,special:{ready:{setup:f.bindReady,teardown:f.noop},live:{add:function(a){f.event.add(this,M(a.origType,a.selector),f.extend({},a,{handler:L,guid:a.handler.guid}))},remove:function(a){f.event.remove(this,M(a.origType,a.selector),a)}},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}}},f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!this.preventDefault)return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?D:C):this.type=a,b&&f.extend(this,b),this.timeStamp=f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=D;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=D;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=D,this.stopPropagation()},isDefaultPrevented:C,isPropagationStopped:C,isImmediatePropagationStopped:C};var E=function(a){var b=a.relatedTarget,c=!1,d=a.type;a.type=a.data,b!==this&&(b&&(c=f.contains(this,b)),c||(f.event.handle.apply(this,arguments),a.type=d))},F=function(a){a.type=a.data,f.event.handle.apply(this,arguments)};f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={setup:function(c){f.event.add(this,b,c&&c.selector?F:E,a)},teardown:function(a){f.event.remove(this,b,a&&a.selector?F:E)}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(a,b){if(!f.nodeName(this,"form"))f.event.add(this,"click.specialSubmit",function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(c==="submit"||c==="image")&&f(b).closest("form").length&&J("submit",this,arguments)}),f.event.add(this,"keypress.specialSubmit",function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(c==="text"||c==="password")&&f(b).closest("form").length&&a.keyCode===13&&J("submit",this,arguments)});else return!1},teardown:function(a){f.event.remove(this,".specialSubmit")}});if(!f.support.changeBubbles){var G,H=function(a){var b=f.nodeName(a,"input")?a.type:"",c=a.value;b==="radio"||b==="checkbox"?c=a.checked:b==="select-multiple"?c=a.selectedIndex>-1?f.map(a.options,function(a){return a.selected}).join("-"):"":f.nodeName(a,"select")&&(c=a.selectedIndex);return c},I=function(c){var d=c.target,e,g;if(!!x.test(d.nodeName)&&!d.readOnly){e=f._data(d,"_change_data"),g=H(d),(c.type!=="focusout"||d.type!=="radio")&&f._data(d,"_change_data",g);if(e===b||g===e)return;if(e!=null||g)c.type="change",c.liveFired=b,f.event.trigger(c,arguments[1],d)}};f.event.special.change={filters:{focusout:I,beforedeactivate:I,click:function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(c==="radio"||c==="checkbox"||f.nodeName(b,"select"))&&I.call(this,a)},keydown:function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(a.keyCode===13&&!f.nodeName(b,"textarea")||a.keyCode===32&&(c==="checkbox"||c==="radio")||c==="select-multiple")&&I.call(this,a)},beforeactivate:function(a){var b=a.target;f._data(b,"_change_data",H(b))}},setup:function(a,b){if(this.type==="file")return!1;for(var c in G)f.event.add(this,c+".specialChange",G[c]);return x.test(this.nodeName)},teardown:function(a){f.event.remove(this,".specialChange");return x.test(this.nodeName)}},G=f.event.special.change.filters,G.focus=G.beforeactivate}f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){function e(a){var c=f.event.fix(a);c.type=b,c.originalEvent={},f.event.trigger(c,null,c.target),c.isDefaultPrevented()&&a.preventDefault()}var d=0;f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.each(["bind","one"],function(a,c){f.fn[c]=function(a,d,e){var g;if(typeof a=="object"){for(var h in a)this[c](h,d,a[h],e);return this}if(arguments.length===2||d===!1)e=d,d=b;c==="one"?(g=function(a){f(this).unbind(a,g);return e.apply(this,arguments)},g.guid=e.guid||f.guid++):g=e;if(a==="unload"&&c!=="one")this.one(a,d,e);else for(var i=0,j=this.length;i<j;i++)f.event.add(this[i],a,g,d);return this}}),f.fn.extend({unbind:function(a,b){if(typeof a=="object"&&!a.preventDefault)for(var c in a)this.unbind(c,a[c]);else for(var d=0,e=this.length;d<e;d++)f.event.remove(this[d],a,b);return this},delegate:function(a,b,c,d){return this.live(b,c,d,a)},undelegate:function(a,b,c){return arguments.length===0?this.unbind("live"):this.die(b,null,c,a)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f.data(this,"lastToggle"+a.guid)||0)%d;f.data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});var K={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};f.each(["live","die"],function(a,c){f.fn[c]=function(a,d,e,g){var h,i=0,j,k,l,m=g||this.selector,n=g?this:f(this.context);if(typeof a=="object"&&!a.preventDefault){for(var o in a)n[c](o,d,a[o],m);return this}if(c==="die"&&!a&&g&&g.charAt(0)==="."){n.unbind(g);return this}if(d===!1||f.isFunction(d))e=d||C,d=b;a=(a||"").split(" ");while((h=a[i++])!=null){j=w.exec(h),k="",j&&(k=j[0],h=h.replace(w,""));if(h==="hover"){a.push("mouseenter"+k,"mouseleave"+k);continue}l=h,K[h]?(a.push(K[h]+k),h=h+k):h=(K[h]||h)+k;if(c==="live")for(var p=0,q=n.length;p<q;p++)f.event.add(n[p],"live."+M(h,m),{data:d,selector:m,handler:e,origType:h,origHandler:e,preType:l});else n.unbind("live."+M(h,m),e)}return this}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.bind(b,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0)}),function(){function u(a,b,c,d,e,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){var j=!1;i=i[a];while(i){if(i.sizcache===c){j=d[i.sizset];break}if(i.nodeType===1){f||(i.sizcache=c,i.sizset=g);if(typeof b!="string"){if(i===b){j=!0;break}}else if(k.filter(b,[i]).length>0){j=i;break}}i=i[a]}d[g]=j}}}function t(a,b,c,d,e,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){var j=!1;i=i[a];while(i){if(i.sizcache===c){j=d[i.sizset];break}i.nodeType===1&&!f&&(i.sizcache=c,i.sizset=g);if(i.nodeName.toLowerCase()===b){j=i;break}i=i[a]}d[g]=j}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d=0,e=Object.prototype.toString,g=!1,h=!0,i=/\\/g,j=/\W/;[0,0].sort(function(){h=!1;return 0});var k=function(b,d,f,g){f=f||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return f;var i,j,n,o,q,r,s,t,u=!0,w=k.isXML(d),x=[],y=b;do{a.exec(""),i=a.exec(y);if(i){y=i[3],x.push(i[1]);if(i[2]){o=i[3];break}}}while(i);if(x.length>1&&m.exec(b))if(x.length===2&&l.relative[x[0]])j=v(x[0]+x[1],d);else{j=l.relative[x[0]]?[d]:k(x.shift(),d);while(x.length)b=x.shift(),l.relative[b]&&(b+=x.shift()),j=v(b,j)}else{!g&&x.length>1&&d.nodeType===9&&!w&&l.match.ID.test(x[0])&&!l.match.ID.test(x[x.length-1])&&(q=k.find(x.shift(),d,w),d=q.expr?k.filter(q.expr,q.set)[0]:q.set[0]);if(d){q=g?{expr:x.pop(),set:p(g)}:k.find(x.pop(),x.length===1&&(x[0]==="~"||x[0]==="+")&&d.parentNode?d.parentNode:d,w),j=q.expr?k.filter(q.expr,q.set):q.set,x.length>0?n=p(j):u=!1;while(x.length)r=x.pop(),s=r,l.relative[r]?s=x.pop():r="",s==null&&(s=d),l.relative[r](n,s,w)}else n=x=[]}n||(n=j),n||k.error(r||b);if(e.call(n)==="[object Array]")if(!u)f.push.apply(f,n);else if(d&&d.nodeType===1)for(t=0;n[t]!=null;t++)n[t]&&(n[t]===!0||n[t].nodeType===1&&k.contains(d,n[t]))&&f.push(j[t]);else for(t=0;n[t]!=null;t++)n[t]&&n[t].nodeType===1&&f.push(j[t]);else p(n,f);o&&(k(o,h,f,g),k.uniqueSort(f));return f};k.uniqueSort=function(a){if(r){g=h,a.sort(r);if(g)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},k.matches=function(a,b){return k(a,null,null,b)},k.matchesSelector=function(a,b){return k(b,null,null,[a]).length>0},k.find=function(a,b,c){var d;if(!a)return[];for(var e=0,f=l.order.length;e<f;e++){var g,h=l.order[e];if(g=l.leftMatch[h].exec(a)){var j=g[1];g.splice(1,1);if(j.substr(j.length-1)!=="\\"){g[1]=(g[1]||"").replace(i,""),d=l.find[h](g,b,c);if(d!=null){a=a.replace(l.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},k.filter=function(a,c,d,e){var f,g,h=a,i=[],j=c,m=c&&c[0]&&k.isXML(c[0]);while(a&&c.length){for(var n in l.filter)if((f=l.leftMatch[n].exec(a))!=null&&f[2]){var o,p,q=l.filter[n],r=f[1];g=!1,f.splice(1,1);if(r.substr(r.length-1)==="\\")continue;j===i&&(i=[]);if(l.preFilter[n]){f=l.preFilter[n](f,j,d,i,e,m);if(!f)g=o=!0;else if(f===!0)continue}if(f)for(var s=0;(p=j[s])!=null;s++)if(p){o=q(p,f,s,j);var t=e^!!o;d&&o!=null?t?g=!0:j[s]=!1:t&&(i.push(p),g=!0)}if(o!==b){d||(j=i),a=a.replace(l.match[n],"");if(!g)return[];break}}if(a===h)if(g==null)k.error(a);else break;h=a}return j},k.error=function(a){throw"Syntax error, unrecognized expression: "+a};var l=k.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!j.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&k.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!j.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&k.filter(b,a,!0)}},"":function(a,b,c){var e,f=d++,g=u;typeof b=="string"&&!j.test(b)&&(b=b.toLowerCase(),e=b,g=t),g("parentNode",b,f,a,e,c)},"~":function(a,b,c){var e,f=d++,g=u;typeof b=="string"&&!j.test(b)&&(b=b.toLowerCase(),e=b,g=t),g("previousSibling",b,f,a,e,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(i,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(i,"")},TAG:function(a,b){return a[1].replace(i,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||k.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&k.error(a[0]);a[0]=d++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(i,"");!f&&l.attrMap[g]&&(a[1]=l.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(i,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=k(b[3],null,null,c);else{var g=k.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(l.match.POS.test(b[0])||l.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!k(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=l.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||k.getText([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}k.error(e)},CHILD:function(a,b){var c=b[1],d=a;switch(c){case"only":case"first":while(d=d.previousSibling)if(d.nodeType===1)return!1;if(c==="first")return!0;d=a;case"last":while(d=d.nextSibling)if(d.nodeType===1)return!1;return!0;case"nth":var e=b[2],f=b[3];if(e===1&&f===0)return!0;var g=b[0],h=a.parentNode;if(h&&(h.sizcache!==g||!a.nodeIndex)){var i=0;for(d=h.firstChild;d;d=d.nextSibling)d.nodeType===1&&(d.nodeIndex=++i);h.sizcache=g}var j=a.nodeIndex-f;return e===0?j===0:j%e===0&&j/e>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=l.attrHandle[c]?l.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=l.setFilters[e];if(f)return f(a,c,b,d)}}},m=l.match.POS,n=function(a,b){return"\\"+(b-0+1)};for(var o in l.match)l.match[o]=new RegExp(l.match[o].source+/(?![^\[]*\])(?![^\(]*\))/.source),l.leftMatch[o]=new RegExp(/(^(?:.|\r|\n)*?)/.source+l.match[o].source.replace(/\\(\d+)/g,n));var p=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(q){p=function(a,b){var c=0,d=b||[];if(e.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var f=a.length;c<f;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var r,s;c.documentElement.compareDocumentPosition?r=function(a,b){if(a===b){g=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(r=function(a,b){if(a===b){g=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],h=a.parentNode,i=b.parentNode,j=h;if(h===i)return s(a,b);if(!h)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return s(e[k],f[k]);return k===c?s(a,f[k],-1):s(e[k],b,1)},s=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),k.getText=function(a){var b="",c;for(var d=0;a[d];d++)c=a[d],c.nodeType===3||c.nodeType===4?b+=c.nodeValue:c.nodeType!==8&&(b+=k.getText(c.childNodes));return b},function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(l.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},l.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(l.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(l.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=k,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){k=function(b,e,f,g){e=e||c;if(!g&&!k.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return p(e.getElementsByTagName(b),f);if(h[2]&&l.find.CLASS&&e.getElementsByClassName)return p(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return p([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return p([],f);if(i.id===h[3])return p([i],f)}try{return p(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var m=e,n=e.getAttribute("id"),o=n||d,q=e.parentNode,r=/^\s*[+~]/.test(b);n?o=o.replace(/'/g,"\\$&"):e.setAttribute("id",o),r&&q&&(e=e.parentNode);try{if(!r||q)return p(e.querySelectorAll("[id='"+o+"'] "+b),f)}catch(s){}finally{n||m.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)k[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}k.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!k.isXML(a))try{if(e||!l.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return k(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;l.order.splice(1,0,"CLASS"),l.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?k.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?k.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:k.contains=function(){return!1},k.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var v=function(a,b){var c,d=[],e="",f=b.nodeType?[b]:b;while(c=l.match.PSEUDO.exec(a))e+=c[0],a=a.replace(l.match.PSEUDO,"");a=l.relative[a]?a+"*":a;for(var g=0,h=f.length;g<h;g++)k(a,f[g],d);return k.filter(e,d)};f.find=k,f.expr=k.selectors,f.expr[":"]=f.expr.filters,f.unique=k.uniqueSort,f.text=k.getText,f.isXMLDoc=k.isXML,f.contains=k.contains}();var N=/Until$/,O=/^(?:parents|prevUntil|prevAll)/,P=/,/,Q=/^.[^:#\[\.,]*$/,R=Array.prototype.slice,S=f.expr.match.POS,T={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(V(this,a,!1),"not",a)},filter:function(a){return this.pushStack(V(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h,i,j={},k=1;if(g&&a.length){for(d=0,e=a.length;d<e;d++)i=a[d],j[i]||(j[i]=S.test(i)?f(i,b||this.context):i);while(g&&g.ownerDocument&&g!==b){for(i in j)h=j[i],(h.jquery?h.index(g)>-1:f(g).is(h))&&c.push({selector:i,elem:g,level:k});g=g.parentNode,k++}}return c}var l=S.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(l?l.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(U(c[0])||U(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling(a.parentNode.firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c),g=R.call(arguments);N.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!T[a]?f.unique(e):e,(this.length>1||P.test(d))&&O.test(a)&&(e=e.reverse());return this.pushStack(e,a,g.join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|object|embed|option|style)/i,bb=/checked\s*(?:[^=]|=\s*.checked.)/i,bc=/\/(java|ecma)script/i,bd=/^\s*<!(?:\[CDATA\[|\-\-)/,be={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};be.optgroup=be.option,be.tbody=be.tfoot=be.colgroup=be.caption=be.thead,be.th=be.td,f.support.htmlSerialize||(be._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.text(a.call(this,b,c.text()))});if(typeof a!="object"&&a!==b)return this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a));return f.text(this)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){f(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f(arguments[0]).toArray());return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){if(a===b)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!be[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(var c=0,d=this.length;c<d;c++)this[c].nodeType===1&&(f.cleanData(this[c].getElementsByTagName("*")),this[c].innerHTML=a)}catch(e){this.empty().append(a)}}else f.isFunction(a)?this.each(function(b){var c=f(this);c.html(a.call(this,b,c.html()))}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bb.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bf(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,bl)}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i;b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof a[0]=="string"&&a[0].length<512&&i===c&&a[0].charAt(0)==="<"&&!ba.test(a[0])&&(f.support.checkClone||!bb.test(a[0]))&&(g=!0,h=f.fragments[a[0]],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[a[0]]=h?e:1);
return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d=a.cloneNode(!0),e,g,h;if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bh(a,d),e=bi(a),g=bi(d);for(h=0;e[h];++h)g[h]&&bh(e[h],g[h])}if(b){bg(a,d);if(c){e=bi(a),g=bi(d);for(h=0;e[h];++h)bg(e[h],g[h])}}e=g=null;return d},clean:function(a,b,d,e){var g;b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);var h=[],i;for(var j=0,k;(k=a[j])!=null;j++){typeof k=="number"&&(k+="");if(!k)continue;if(typeof k=="string")if(!_.test(k))k=b.createTextNode(k);else{k=k.replace(Y,"<$1></$2>");var l=(Z.exec(k)||["",""])[1].toLowerCase(),m=be[l]||be._default,n=m[0],o=b.createElement("div");o.innerHTML=m[1]+k+m[2];while(n--)o=o.lastChild;if(!f.support.tbody){var p=$.test(k),q=l==="table"&&!p?o.firstChild&&o.firstChild.childNodes:m[1]==="<table>"&&!p?o.childNodes:[];for(i=q.length-1;i>=0;--i)f.nodeName(q[i],"tbody")&&!q[i].childNodes.length&&q[i].parentNode.removeChild(q[i])}!f.support.leadingWhitespace&&X.test(k)&&o.insertBefore(b.createTextNode(X.exec(k)[0]),o.firstChild),k=o.childNodes}var r;if(!f.support.appendChecked)if(k[0]&&typeof (r=k.length)=="number")for(i=0;i<r;i++)bk(k[i]);else bk(k);k.nodeType?h.push(k):h=f.merge(h,k)}if(d){g=function(a){return!a.type||bc.test(a.type)};for(j=0;h[j];j++)if(e&&f.nodeName(h[j],"script")&&(!h[j].type||h[j].type.toLowerCase()==="text/javascript"))e.push(h[j].parentNode?h[j].parentNode.removeChild(h[j]):h[j]);else{if(h[j].nodeType===1){var s=f.grep(h[j].getElementsByTagName("script"),g);h.splice.apply(h,[j+1,0].concat(s))}d.appendChild(h[j])}}return h},cleanData:function(a){var b,c,d=f.cache,e=f.expando,g=f.event.special,h=f.support.deleteExpando;for(var i=0,j;(j=a[i])!=null;i++){if(j.nodeName&&f.noData[j.nodeName.toLowerCase()])continue;c=j[f.expando];if(c){b=d[c]&&d[c][e];if(b&&b.events){for(var k in b.events)g[k]?f.event.remove(j,k):f.removeEvent(j,k,b.handle);b.handle&&(b.handle.elem=null)}h?delete j[f.expando]:j.removeAttribute&&j.removeAttribute(f.expando),delete d[c]}}}});var bm=/alpha\([^)]*\)/i,bn=/opacity=([^)]*)/,bo=/([A-Z]|^ms)/g,bp=/^-?\d+(?:px)?$/i,bq=/^-?\d/,br=/^([\-+])=([\-+.\de]+)/,bs={position:"absolute",visibility:"hidden",display:"block"},bt=["Left","Right"],bu=["Top","Bottom"],bv,bw,bx;f.fn.css=function(a,c){if(arguments.length===2&&c===b)return this;return f.access(this,a,c,!0,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)})},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bv(a,"opacity","opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=br.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(bv)return bv(a,c)},swap:function(a,b,c){var d={};for(var e in b)d[e]=a.style[e],a.style[e]=b[e];c.call(a);for(e in b)a.style[e]=d[e]}}),f.curCSS=f.css,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){var e;if(c){if(a.offsetWidth!==0)return by(a,b,d);f.swap(a,bs,function(){e=by(a,b,d)});return e}},set:function(a,b){if(!bp.test(b))return b;b=parseFloat(b);if(b>=0)return b+"px"}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bn.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNaN(b)?"":"alpha(opacity="+b*100+")",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bm,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bm.test(g)?g.replace(bm,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){var c;f.swap(a,{display:"inline-block"},function(){b?c=bv(a,"margin-right","marginRight"):c=a.style.marginRight});return c}})}),c.defaultView&&c.defaultView.getComputedStyle&&(bw=function(a,c){var d,e,g;c=c.replace(bo,"-$1").toLowerCase();if(!(e=a.ownerDocument.defaultView))return b;if(g=e.getComputedStyle(a,null))d=g.getPropertyValue(c),d===""&&!f.contains(a.ownerDocument.documentElement,a)&&(d=f.style(a,c));return d}),c.documentElement.currentStyle&&(bx=function(a,b){var c,d=a.currentStyle&&a.currentStyle[b],e=a.runtimeStyle&&a.runtimeStyle[b],f=a.style;!bp.test(d)&&bq.test(d)&&(c=f.left,e&&(a.runtimeStyle.left=a.currentStyle.left),f.left=b==="fontSize"?"1em":d||0,d=f.pixelLeft+"px",f.left=c,e&&(a.runtimeStyle.left=e));return d===""?"auto":d}),bv=bw||bx,f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)});var bz=/%20/g,bA=/\[\]$/,bB=/\r?\n/g,bC=/#.*$/,bD=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bE=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bF=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bG=/^(?:GET|HEAD)$/,bH=/^\/\//,bI=/\?/,bJ=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bK=/^(?:select|textarea)/i,bL=/\s+/,bM=/([?&])_=[^&]*/,bN=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bO=f.fn.load,bP={},bQ={},bR,bS,bT=["*/"]+["*"];try{bR=e.href}catch(bU){bR=c.createElement("a"),bR.href="",bR=bR.href}bS=bN.exec(bR.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bO)return bO.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bJ,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bK.test(this.nodeName)||bE.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bB,"\r\n")}}):{name:b.name,value:c.replace(bB,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.bind(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?bX(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),bX(a,b);return a},ajaxSettings:{url:bR,isLocal:bF.test(bS[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bT},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bV(bP),ajaxTransport:bV(bQ),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?bZ(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=b$(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.resolveWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f._Deferred(),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bD.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.done,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bC,"").replace(bH,bS[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bL),d.crossDomain==null&&(r=bN.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bS[1]&&r[2]==bS[2]&&(r[3]||(r[1]==="http:"?80:443))==(bS[3]||(bS[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),bW(bP,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bG.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bI.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bM,"$1_="+x);d.url=y+(y===d.url?(bI.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bT+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=bW(bQ,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){s<2?w(-1,z):f.error(z)}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)bY(g,a[g],c,e);return d.join("&").replace(bz,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var b_=f.now(),ca=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+b_++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=b.contentType==="application/x-www-form-urlencoded"&&typeof b.data=="string";if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(ca.test(b.url)||e&&ca.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(ca,l),b.url===j&&(e&&(k=k.replace(ca,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var cb=a.ActiveXObject?function(){for(var a in cd)cd[a](0,1)}:!1,cc=0,cd;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ce()||cf()}:ce,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,cb&&delete cd[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n),m.text=h.responseText;try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cc,cb&&(cd||(cd={},f(a).unload(cb)),cd[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cg={},ch,ci,cj=/^(?:toggle|show|hide)$/,ck=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,cl,cm=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cn;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(cq("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),e===""&&f.css(d,"display")==="none"&&f._data(d,"olddisplay",cr(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(cq("hide",3),a,b,c);for(var d=0,e=this.length;d<e;d++)if(this[d].style){var g=f.css(this[d],"display");g!=="none"&&!f._data(this[d],"olddisplay")&&f._data(this[d],"olddisplay",g)}for(d=0;d<e;d++)this[d].style&&(this[d].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(cq("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return this[e.queue===!1?"each":"queue"](function(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]),h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(f.support.inlineBlockNeedsLayout?(j=cr(this.nodeName),j==="inline"?this.style.display="inline-block":(this.style.display="inline",this.style.zoom=1)):this.style.display="inline-block"))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)k=new f.fx(this,b,i),h=a[i],cj.test(h)?k[h==="toggle"?d?"show":"hide":h]():(l=ck.exec(h),m=k.cur(),l?(n=parseFloat(l[2]),o=l[3]||(f.cssNumber[i]?"":"px"),o!=="px"&&(f.style(this,i,(n||1)+o),m=(n||1)/k.cur()*m,f.style(this,i,m+o)),l[1]&&(n=(l[1]==="-="?-1:1)*n+m),k.custom(m,n,o)):k.custom(m,h,""));return!0})},stop:function(a,b){a&&this.queue([]),this.each(function(){var a=f.timers,c=a.length;b||f._unmark(!0,this);while(c--)a[c].elem===this&&(b&&a[c](!0),a.splice(c,1))}),b||this.dequeue();return this}}),f.each({slideDown:cq("show",1),slideUp:cq("hide",1),slideToggle:cq("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default,d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue!==!1?f.dequeue(this):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a,b,c,d){return c+d*a},swing:function(a,b,c,d){return(-Math.cos(a*Math.PI)/2+.5)*d+c}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,b,c){function g(a){return d.step(a)}var d=this,e=f.fx;this.startTime=cn||co(),this.start=a,this.end=b,this.unit=c||this.unit||(f.cssNumber[this.prop]?"":"px"),this.now=this.start,this.pos=this.state=0,g.elem=this.elem,g()&&f.timers.push(g)&&!cl&&(cl=setInterval(e.tick,e.interval))},show:function(){this.options.orig[this.prop]=f.style(this.elem,this.prop),this.options.show=!0,this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b=cn||co(),c=!0,d=this.elem,e=this.options,g,h;if(a||b>=e.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),e.animatedProperties[this.prop]=!0;for(g in e.animatedProperties)e.animatedProperties[g]!==!0&&(c=!1);if(c){e.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){d.style["overflow"+b]=e.overflow[a]}),e.hide&&f(d).hide();if(e.hide||e.show)for(var i in e.animatedProperties)f.style(d,i,e.orig[i]);e.complete.call(d)}return!1}e.duration==Infinity?this.now=b:(h=b-this.startTime,this.state=h/e.duration,this.pos=f.easing[e.animatedProperties[this.prop]](this.state,h,0,1,e.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){for(var a=f.timers,b=0;b<a.length;++b)a[b]()||a.splice(b--,1);a.length||f.fx.stop()},interval:13,stop:function(){clearInterval(cl),cl=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit:a.elem[a.prop]=a.now}}}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cs=/^t(?:able|d|h)$/i,ct=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?f.fn.offset=function(a){var b=this[0],c;if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);try{c=b.getBoundingClientRect()}catch(d){}var e=b.ownerDocument,g=e.documentElement;if(!c||!f.contains(g,b))return c?{top:c.top,left:c.left}:{top:0,left:0};var h=e.body,i=cu(e),j=g.clientTop||h.clientTop||0,k=g.clientLeft||h.clientLeft||0,l=i.pageYOffset||f.support.boxModel&&g.scrollTop||h.scrollTop,m=i.pageXOffset||f.support.boxModel&&g.scrollLeft||h.scrollLeft,n=c.top+l-j,o=c.left+m-k;return{top:n,left:o}}:f.fn.offset=function(a){var b=this[0];if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);f.offset.initialize();var c,d=b.offsetParent,e=b,g=b.ownerDocument,h=g.documentElement,i=g.body,j=g.defaultView,k=j?j.getComputedStyle(b,null):b.currentStyle,l=b.offsetTop,m=b.offsetLeft;while((b=b.parentNode)&&b!==i&&b!==h){if(f.offset.supportsFixedPosition&&k.position==="fixed")break;c=j?j.getComputedStyle(b,null):b.currentStyle,l-=b.scrollTop,m-=b.scrollLeft,b===d&&(l+=b.offsetTop,m+=b.offsetLeft,f.offset.doesNotAddBorder&&(!f.offset.doesAddBorderForTableAndCells||!cs.test(b.nodeName))&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),e=d,d=b.offsetParent),f.offset.subtractsBorderForOverflowNotVisible&&c.overflow!=="visible"&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),k=c}if(k.position==="relative"||k.position==="static")l+=i.offsetTop,m+=i.offsetLeft;f.offset.supportsFixedPosition&&k.position==="fixed"&&(l+=Math.max(h.scrollTop,i.scrollTop),m+=Math.max(h.scrollLeft,i.scrollLeft));return{top:l,left:m}},f.offset={initialize:function(){var a=c.body,b=c.createElement("div"),d,e,g,h,i=parseFloat(f.css(a,"marginTop"))||0,j="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";f.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"}),b.innerHTML=j,a.insertBefore(b,a.firstChild),d=b.firstChild,e=d.firstChild,h=d.nextSibling.firstChild.firstChild,this.doesNotAddBorder=e.offsetTop!==5,this.doesAddBorderForTableAndCells=h.offsetTop===5,e.style.position="fixed",e.style.top="20px",this.supportsFixedPosition=e.offsetTop===20||e.offsetTop===15,e.style.position=e.style.top="",d.style.overflow="hidden",d.style.position="relative",this.subtractsBorderForOverflowNotVisible=e.offsetTop===-5,this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==i,a.removeChild(b),f.offset.initialize=f.noop},bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.offset.initialize(),f.offset.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=ct.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!ct.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each(["Left","Top"],function(a,c){var d="scroll"+c;f.fn[d]=function(c){var e,g;if(c===b){e=this[0];if(!e)return null;g=cu(e);return g?"pageXOffset"in g?g[a?"pageYOffset":"pageXOffset"]:f.support.boxModel&&g.document.documentElement[d]||g.document.body[d]:e[d]}return this.each(function(){g=cu(this),g?g.scrollTo(a?f(g).scrollLeft():c,a?c:f(g).scrollTop()):this[d]=c})}}),f.each(["Height","Width"],function(a,c){var d=c.toLowerCase();f.fn["inner"+c]=function(){var a=this[0];return a&&a.style?parseFloat(f.css(a,d,"padding")):null},f.fn["outer"+c]=function(a){var b=this[0];return b&&b.style?parseFloat(f.css(b,d,a?"margin":"border")):null},f.fn[d]=function(a){var e=this[0];if(!e)return a==null?null:this;if(f.isFunction(a))return this.each(function(b){var c=f(this);c[d](a.call(this,b,c[d]()))});if(f.isWindow(e)){var g=e.document.documentElement["client"+c],h=e.document.body;return e.document.compatMode==="CSS1Compat"&&g||h&&h["client"+c]||g}if(e.nodeType===9)return Math.max(e.documentElement["client"+c],e.body["scroll"+c],e.documentElement["scroll"+c],e.body["offset"+c],e.documentElement["offset"+c]);if(a===b){var i=f.css(e,d),j=parseFloat(i);return f.isNaN(j)?i:j}return this.css(d,typeof a=="string"?a:a+"px")}}),a.jQuery=a.$=f})(window);
/*
 * File:        jquery.dataTables.min.js
 * Version:     1.7.3
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Info:        www.datatables.net
 * 
 * Copyright 2008-2010 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, as supplied with this software.
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 */

(function(j,Y,p){j.fn.dataTableSettings=[];var E=j.fn.dataTableSettings;j.fn.dataTableExt={};var n=j.fn.dataTableExt;n.sVersion="1.7.3";n.sErrMode="alert";n.iApiIndex=0;n.oApi={};n.afnFiltering=[];n.aoFeatures=[];n.ofnSearch={};n.afnSortData=[];n.oStdClasses={sPagePrevEnabled:"paginate_enabled_previous",sPagePrevDisabled:"paginate_disabled_previous",sPageNextEnabled:"paginate_enabled_next",sPageNextDisabled:"paginate_disabled_next",sPageJUINext:"",sPageJUIPrev:"",sPageButton:"paginate_button",sPageButtonActive:"paginate_active",
sPageButtonStaticDisabled:"paginate_button",sPageFirst:"first",sPagePrevious:"previous",sPageNext:"next",sPageLast:"last",sStripOdd:"odd",sStripEven:"even",sRowEmpty:"dataTables_empty",sWrapper:"dataTables_wrapper",sFilter:"dataTables_filter",sInfo:"dataTables_info",sPaging:"dataTables_paginate paging_",sLength:"dataTables_length",sProcessing:"dataTables_processing",sSortAsc:"sorting_asc",sSortDesc:"sorting_desc",sSortable:"sorting",sSortableAsc:"sorting_asc_disabled",sSortableDesc:"sorting_desc_disabled",
sSortableNone:"sorting_disabled",sSortColumn:"sorting_",sSortJUIAsc:"",sSortJUIDesc:"",sSortJUI:"",sSortJUIAscAllowed:"",sSortJUIDescAllowed:"",sSortJUIWrapper:"",sScrollWrapper:"dataTables_scroll",sScrollHead:"dataTables_scrollHead",sScrollHeadInner:"dataTables_scrollHeadInner",sScrollBody:"dataTables_scrollBody",sScrollFoot:"dataTables_scrollFoot",sScrollFootInner:"dataTables_scrollFootInner",sFooterTH:""};n.oJUIClasses={sPagePrevEnabled:"fg-button ui-button ui-state-default ui-corner-left",sPagePrevDisabled:"fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
sPageNextEnabled:"fg-button ui-button ui-state-default ui-corner-right",sPageNextDisabled:"fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",sPageJUINext:"ui-icon ui-icon-circle-arrow-e",sPageJUIPrev:"ui-icon ui-icon-circle-arrow-w",sPageButton:"fg-button ui-button ui-state-default",sPageButtonActive:"fg-button ui-button ui-state-default ui-state-disabled",sPageButtonStaticDisabled:"fg-button ui-button ui-state-default ui-state-disabled",sPageFirst:"first ui-corner-tl ui-corner-bl",
sPagePrevious:"previous",sPageNext:"next",sPageLast:"last ui-corner-tr ui-corner-br",sStripOdd:"odd",sStripEven:"even",sRowEmpty:"dataTables_empty",sWrapper:"dataTables_wrapper",sFilter:"dataTables_filter",sInfo:"dataTables_info",sPaging:"dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_",sLength:"dataTables_length",sProcessing:"dataTables_processing",sSortAsc:"ui-state-default",sSortDesc:"ui-state-default",sSortable:"ui-state-default",sSortableAsc:"ui-state-default",
sSortableDesc:"ui-state-default",sSortableNone:"ui-state-default",sSortColumn:"sorting_",sSortJUIAsc:"css_right ui-icon ui-icon-triangle-1-n",sSortJUIDesc:"css_right ui-icon ui-icon-triangle-1-s",sSortJUI:"css_right ui-icon ui-icon-carat-2-n-s",sSortJUIAscAllowed:"css_right ui-icon ui-icon-carat-1-n",sSortJUIDescAllowed:"css_right ui-icon ui-icon-carat-1-s",sSortJUIWrapper:"DataTables_sort_wrapper",sScrollWrapper:"dataTables_scroll",sScrollHead:"dataTables_scrollHead ui-state-default",sScrollHeadInner:"dataTables_scrollHeadInner",
sScrollBody:"dataTables_scrollBody",sScrollFoot:"dataTables_scrollFoot ui-state-default",sScrollFootInner:"dataTables_scrollFootInner",sFooterTH:"ui-state-default"};n.oPagination={two_button:{fnInit:function(g,l,r){var s,v,y;if(g.bJUI){s=p.createElement("a");v=p.createElement("a");y=p.createElement("span");y.className=g.oClasses.sPageJUINext;v.appendChild(y);y=p.createElement("span");y.className=g.oClasses.sPageJUIPrev;s.appendChild(y)}else{s=p.createElement("div");v=p.createElement("div")}s.className=
g.oClasses.sPagePrevDisabled;v.className=g.oClasses.sPageNextDisabled;s.title=g.oLanguage.oPaginate.sPrevious;v.title=g.oLanguage.oPaginate.sNext;l.appendChild(s);l.appendChild(v);j(s).click(function(){g.oApi._fnPageChange(g,"previous")&&r(g)});j(v).click(function(){g.oApi._fnPageChange(g,"next")&&r(g)});j(s).bind("selectstart",function(){return false});j(v).bind("selectstart",function(){return false});if(g.sTableId!==""&&typeof g.aanFeatures.p=="undefined"){l.setAttribute("id",g.sTableId+"_paginate");
s.setAttribute("id",g.sTableId+"_previous");v.setAttribute("id",g.sTableId+"_next")}},fnUpdate:function(g){if(g.aanFeatures.p)for(var l=g.aanFeatures.p,r=0,s=l.length;r<s;r++)if(l[r].childNodes.length!==0){l[r].childNodes[0].className=g._iDisplayStart===0?g.oClasses.sPagePrevDisabled:g.oClasses.sPagePrevEnabled;l[r].childNodes[1].className=g.fnDisplayEnd()==g.fnRecordsDisplay()?g.oClasses.sPageNextDisabled:g.oClasses.sPageNextEnabled}}},iFullNumbersShowPages:5,full_numbers:{fnInit:function(g,l,r){var s=
p.createElement("span"),v=p.createElement("span"),y=p.createElement("span"),D=p.createElement("span"),w=p.createElement("span");s.innerHTML=g.oLanguage.oPaginate.sFirst;v.innerHTML=g.oLanguage.oPaginate.sPrevious;D.innerHTML=g.oLanguage.oPaginate.sNext;w.innerHTML=g.oLanguage.oPaginate.sLast;var x=g.oClasses;s.className=x.sPageButton+" "+x.sPageFirst;v.className=x.sPageButton+" "+x.sPagePrevious;D.className=x.sPageButton+" "+x.sPageNext;w.className=x.sPageButton+" "+x.sPageLast;l.appendChild(s);l.appendChild(v);
l.appendChild(y);l.appendChild(D);l.appendChild(w);j(s).click(function(){g.oApi._fnPageChange(g,"first")&&r(g)});j(v).click(function(){g.oApi._fnPageChange(g,"previous")&&r(g)});j(D).click(function(){g.oApi._fnPageChange(g,"next")&&r(g)});j(w).click(function(){g.oApi._fnPageChange(g,"last")&&r(g)});j("span",l).bind("mousedown",function(){return false}).bind("selectstart",function(){return false});if(g.sTableId!==""&&typeof g.aanFeatures.p=="undefined"){l.setAttribute("id",g.sTableId+"_paginate");
s.setAttribute("id",g.sTableId+"_first");v.setAttribute("id",g.sTableId+"_previous");D.setAttribute("id",g.sTableId+"_next");w.setAttribute("id",g.sTableId+"_last")}},fnUpdate:function(g,l){if(g.aanFeatures.p){var r=n.oPagination.iFullNumbersShowPages,s=Math.floor(r/2),v=Math.ceil(g.fnRecordsDisplay()/g._iDisplayLength),y=Math.ceil(g._iDisplayStart/g._iDisplayLength)+1,D="",w,x=g.oClasses;if(v<r){s=1;w=v}else if(y<=s){s=1;w=r}else if(y>=v-s){s=v-r+1;w=v}else{s=y-Math.ceil(r/2)+1;w=s+r-1}for(r=s;r<=
w;r++)D+=y!=r?'<span class="'+x.sPageButton+'">'+r+"</span>":'<span class="'+x.sPageButtonActive+'">'+r+"</span>";w=g.aanFeatures.p;var z,C=function(){g._iDisplayStart=(this.innerHTML*1-1)*g._iDisplayLength;l(g);return false},L=function(){return false};r=0;for(s=w.length;r<s;r++)if(w[r].childNodes.length!==0){z=j("span:eq(2)",w[r]);z.html(D);j("span",z).click(C).bind("mousedown",L).bind("selectstart",L);z=w[r].getElementsByTagName("span");z=[z[0],z[1],z[z.length-2],z[z.length-1]];j(z).removeClass(x.sPageButton+
" "+x.sPageButtonActive+" "+x.sPageButtonStaticDisabled);if(y==1){z[0].className+=" "+x.sPageButtonStaticDisabled;z[1].className+=" "+x.sPageButtonStaticDisabled}else{z[0].className+=" "+x.sPageButton;z[1].className+=" "+x.sPageButton}if(v===0||y==v||g._iDisplayLength==-1){z[2].className+=" "+x.sPageButtonStaticDisabled;z[3].className+=" "+x.sPageButtonStaticDisabled}else{z[2].className+=" "+x.sPageButton;z[3].className+=" "+x.sPageButton}}}}}};n.oSort={"string-asc":function(g,l){g=g.toLowerCase();
l=l.toLowerCase();return g<l?-1:g>l?1:0},"string-desc":function(g,l){g=g.toLowerCase();l=l.toLowerCase();return g<l?1:g>l?-1:0},"html-asc":function(g,l){g=g.replace(/<.*?>/g,"").toLowerCase();l=l.replace(/<.*?>/g,"").toLowerCase();return g<l?-1:g>l?1:0},"html-desc":function(g,l){g=g.replace(/<.*?>/g,"").toLowerCase();l=l.replace(/<.*?>/g,"").toLowerCase();return g<l?1:g>l?-1:0},"date-asc":function(g,l){g=Date.parse(g);l=Date.parse(l);if(isNaN(g)||g==="")g=Date.parse("01/01/1970 00:00:00");if(isNaN(l)||
l==="")l=Date.parse("01/01/1970 00:00:00");return g-l},"date-desc":function(g,l){g=Date.parse(g);l=Date.parse(l);if(isNaN(g)||g==="")g=Date.parse("01/01/1970 00:00:00");if(isNaN(l)||l==="")l=Date.parse("01/01/1970 00:00:00");return l-g},"numeric-asc":function(g,l){return(g=="-"||g===""?0:g*1)-(l=="-"||l===""?0:l*1)},"numeric-desc":function(g,l){return(l=="-"||l===""?0:l*1)-(g=="-"||g===""?0:g*1)}};n.aTypes=[function(g){if(g.length===0)return"numeric";var l,r=false;l=g.charAt(0);if("0123456789-".indexOf(l)==
-1)return null;for(var s=1;s<g.length;s++){l=g.charAt(s);if("0123456789.".indexOf(l)==-1)return null;if(l=="."){if(r)return null;r=true}}return"numeric"},function(g){var l=Date.parse(g);if(l!==null&&!isNaN(l)||g.length===0)return"date";return null},function(g){if(g.indexOf("<")!=-1&&g.indexOf(">")!=-1)return"html";return null}];n.fnVersionCheck=function(g){var l=function(w,x){for(;w.length<x;)w+="0";return w},r=n.sVersion.split(".");g=g.split(".");for(var s="",v="",y=0,D=g.length;y<D;y++){s+=l(r[y],
3);v+=l(g[y],3)}return parseInt(s,10)>=parseInt(v,10)};n._oExternConfig={iNextUnique:0};j.fn.dataTable=function(g){function l(){this.fnRecordsTotal=function(){return this.oFeatures.bServerSide?this._iRecordsTotal:this.aiDisplayMaster.length};this.fnRecordsDisplay=function(){return this.oFeatures.bServerSide?this._iRecordsDisplay:this.aiDisplay.length};this.fnDisplayEnd=function(){return this.oFeatures.bServerSide?this.oFeatures.bPaginate===false||this._iDisplayLength==-1?this._iDisplayStart+this.aiDisplay.length:
Math.min(this._iDisplayStart+this._iDisplayLength,this._iRecordsDisplay):this._iDisplayEnd};this.sInstance=this.oInstance=null;this.oFeatures={bPaginate:true,bLengthChange:true,bFilter:true,bSort:true,bInfo:true,bAutoWidth:true,bProcessing:false,bSortClasses:true,bStateSave:false,bServerSide:false};this.oScroll={sX:"",sXInner:"",sY:"",bCollapse:false,bInfinite:false,iLoadGap:100,iBarWidth:0};this.aanFeatures=[];this.oLanguage={sProcessing:"Processing...",sLengthMenu:"Show _MENU_ entries",sZeroRecords:"No matching records found",
sEmptyTable:"No data available in table",sInfo:"Showing _START_ to _END_ of _TOTAL_ entries",sInfoEmpty:"Showing 0 to 0 of 0 entries",sInfoFiltered:"(filtered from _MAX_ total entries)",sInfoPostFix:"",sSearch:"Search:",sUrl:"",oPaginate:{sFirst:"First",sPrevious:"Previous",sNext:"Next",sLast:"Last"},fnInfoCallback:null};this.aoData=[];this.aiDisplay=[];this.aiDisplayMaster=[];this.aoColumns=[];this.iNextId=0;this.asDataSearch=[];this.oPreviousSearch={sSearch:"",bRegex:false,bSmart:true};this.aoPreSearchCols=
[];this.aaSorting=[[0,"asc",0]];this.aaSortingFixed=null;this.asStripClasses=[];this.asDestoryStrips=[];this.sDestroyWidth=0;this.fnFooterCallback=this.fnHeaderCallback=this.fnRowCallback=null;this.aoDrawCallback=[];this.fnInitComplete=null;this.sTableId="";this.nTableWrapper=this.nTBody=this.nTFoot=this.nTHead=this.nTable=null;this.iDefaultSortIndex=0;this.bInitialised=false;this.aoOpenRows=[];this.sDom="lfrtip";this.sPaginationType="two_button";this.iCookieDuration=7200;this.sCookiePrefix="SpryMedia_DataTables_";
this.sAjaxSource=this.fnCookieCallback=null;this.bAjaxDataGet=true;this.fnServerData=function(a,b,c){j.ajax({url:a,data:b,success:c,dataType:"json",cache:false,error:function(){alert("DataTables warning: JSON data from server failed to load or be parsed. This is most likely to be caused by a JSON formatting error.")}})};this.fnFormatNumber=function(a){if(a<1E3)return a;else{var b=a+"";a=b.split("");var c="";b=b.length;for(var d=0;d<b;d++){if(d%3===0&&d!==0)c=","+c;c=a[b-d-1]+c}}return c};this.aLengthMenu=
[10,25,50,100];this.bDrawing=this.iDraw=0;this.iDrawError=-1;this._iDisplayLength=10;this._iDisplayStart=0;this._iDisplayEnd=10;this._iRecordsDisplay=this._iRecordsTotal=0;this.bJUI=false;this.oClasses=n.oStdClasses;this.bSorted=this.bFiltered=false;this.oInit=null}function r(a){return function(){var b=[B(this[n.iApiIndex])].concat(Array.prototype.slice.call(arguments));return n.oApi[a].apply(this,b)}}function s(a){var b,c;if(a.bInitialised===false)setTimeout(function(){s(a)},200);else{oa(a);z(a);
a.oFeatures.bAutoWidth&&Z(a);b=0;for(c=a.aoColumns.length;b<c;b++)if(a.aoColumns[b].sWidth!==null)a.aoColumns[b].nTh.style.width=u(a.aoColumns[b].sWidth);if(a.oFeatures.bSort)O(a);else{a.aiDisplay=a.aiDisplayMaster.slice();F(a);C(a)}if(a.sAjaxSource!==null&&!a.oFeatures.bServerSide){K(a,true);a.fnServerData.call(a.oInstance,a.sAjaxSource,[],function(d){for(b=0;b<d.aaData.length;b++)w(a,d.aaData[b]);a.iInitDisplayStart=a._iDisplayStart;if(a.oFeatures.bSort)O(a);else{a.aiDisplay=a.aiDisplayMaster.slice();
F(a);C(a)}K(a,false);typeof a.fnInitComplete=="function"&&a.fnInitComplete.call(a.oInstance,a,d)})}else a.oFeatures.bServerSide||K(a,false)}}function v(a,b,c){o(a.oLanguage,b,"sProcessing");o(a.oLanguage,b,"sLengthMenu");o(a.oLanguage,b,"sEmptyTable");o(a.oLanguage,b,"sZeroRecords");o(a.oLanguage,b,"sInfo");o(a.oLanguage,b,"sInfoEmpty");o(a.oLanguage,b,"sInfoFiltered");o(a.oLanguage,b,"sInfoPostFix");o(a.oLanguage,b,"sSearch");if(typeof b.oPaginate!="undefined"){o(a.oLanguage.oPaginate,b.oPaginate,
"sFirst");o(a.oLanguage.oPaginate,b.oPaginate,"sPrevious");o(a.oLanguage.oPaginate,b.oPaginate,"sNext");o(a.oLanguage.oPaginate,b.oPaginate,"sLast")}typeof b.sEmptyTable=="undefined"&&typeof b.sZeroRecords!="undefined"&&o(a.oLanguage,b,"sZeroRecords","sEmptyTable");c&&s(a)}function y(a,b){a.aoColumns[a.aoColumns.length++]={sType:null,_bAutoType:true,bVisible:true,bSearchable:true,bSortable:true,asSorting:["asc","desc"],sSortingClass:a.oClasses.sSortable,sSortingClassJUI:a.oClasses.sSortJUI,sTitle:b?
b.innerHTML:"",sName:"",sWidth:null,sWidthOrig:null,sClass:null,fnRender:null,bUseRendered:true,iDataSort:a.aoColumns.length-1,sSortDataType:"std",nTh:b?b:p.createElement("th"),nTf:null};b=a.aoColumns.length-1;if(typeof a.aoPreSearchCols[b]=="undefined"||a.aoPreSearchCols[b]===null)a.aoPreSearchCols[b]={sSearch:"",bRegex:false,bSmart:true};else{if(typeof a.aoPreSearchCols[b].bRegex=="undefined")a.aoPreSearchCols[b].bRegex=true;if(typeof a.aoPreSearchCols[b].bSmart=="undefined")a.aoPreSearchCols[b].bSmart=
true}D(a,b,null)}function D(a,b,c){b=a.aoColumns[b];if(typeof c!="undefined"&&c!==null){if(typeof c.sType!="undefined"){b.sType=c.sType;b._bAutoType=false}o(b,c,"bVisible");o(b,c,"bSearchable");o(b,c,"bSortable");o(b,c,"sTitle");o(b,c,"sName");o(b,c,"sWidth");o(b,c,"sWidth","sWidthOrig");o(b,c,"sClass");o(b,c,"fnRender");o(b,c,"bUseRendered");o(b,c,"iDataSort");o(b,c,"asSorting");o(b,c,"sSortDataType")}if(!a.oFeatures.bSort)b.bSortable=false;if(!b.bSortable||j.inArray("asc",b.asSorting)==-1&&j.inArray("desc",
b.asSorting)==-1){b.sSortingClass=a.oClasses.sSortableNone;b.sSortingClassJUI=""}else if(j.inArray("asc",b.asSorting)!=-1&&j.inArray("desc",b.asSorting)==-1){b.sSortingClass=a.oClasses.sSortableAsc;b.sSortingClassJUI=a.oClasses.sSortJUIAscAllowed}else if(j.inArray("asc",b.asSorting)==-1&&j.inArray("desc",b.asSorting)!=-1){b.sSortingClass=a.oClasses.sSortableDesc;b.sSortingClassJUI=a.oClasses.sSortJUIDescAllowed}}function w(a,b){if(b.length!=a.aoColumns.length&&a.iDrawError!=a.iDraw){I(a,0,"Added data (size "+
b.length+") does not match known number of columns ("+a.aoColumns.length+")");a.iDrawError=a.iDraw;return-1}b=b.slice();var c=a.aoData.length;a.aoData.push({nTr:p.createElement("tr"),_iId:a.iNextId++,_aData:b,_anHidden:[],_sRowStripe:""});for(var d,f,e=0;e<b.length;e++){d=p.createElement("td");if(b[e]===null)b[e]="";if(typeof a.aoColumns[e].fnRender=="function"){f=a.aoColumns[e].fnRender({iDataRow:c,iDataColumn:e,aData:b,oSettings:a});d.innerHTML=f;if(a.aoColumns[e].bUseRendered)a.aoData[c]._aData[e]=
f}else d.innerHTML=b[e];if(typeof b[e]!="string")b[e]+="";b[e]=j.trim(b[e]);if(a.aoColumns[e].sClass!==null)d.className=a.aoColumns[e].sClass;if(a.aoColumns[e]._bAutoType&&a.aoColumns[e].sType!="string"){f=$(a.aoData[c]._aData[e]);if(a.aoColumns[e].sType===null)a.aoColumns[e].sType=f;else if(a.aoColumns[e].sType!=f)a.aoColumns[e].sType="string"}if(a.aoColumns[e].bVisible)a.aoData[c].nTr.appendChild(d);else a.aoData[c]._anHidden[e]=d}a.aiDisplayMaster.push(c);return c}function x(a){var b,c,d,f,e,i,
h,k;if(a.sAjaxSource===null){h=a.nTBody.childNodes;b=0;for(c=h.length;b<c;b++)if(h[b].nodeName.toUpperCase()=="TR"){i=a.aoData.length;a.aoData.push({nTr:h[b],_iId:a.iNextId++,_aData:[],_anHidden:[],_sRowStripe:""});a.aiDisplayMaster.push(i);k=a.aoData[i]._aData;i=h[b].childNodes;d=e=0;for(f=i.length;d<f;d++)if(i[d].nodeName.toUpperCase()=="TD"){k[e]=j.trim(i[d].innerHTML);e++}}}h=S(a);i=[];b=0;for(c=h.length;b<c;b++){d=0;for(f=h[b].childNodes.length;d<f;d++){e=h[b].childNodes[d];e.nodeName.toUpperCase()==
"TD"&&i.push(e)}}i.length!=h.length*a.aoColumns.length&&I(a,1,"Unexpected number of TD elements. Expected "+h.length*a.aoColumns.length+" and got "+i.length+". DataTables does not support rowspan / colspan in the table body, and there must be one cell for each row/column combination.");h=0;for(d=a.aoColumns.length;h<d;h++){if(a.aoColumns[h].sTitle===null)a.aoColumns[h].sTitle=a.aoColumns[h].nTh.innerHTML;f=a.aoColumns[h]._bAutoType;e=typeof a.aoColumns[h].fnRender=="function";k=a.aoColumns[h].sClass!==
null;var m=a.aoColumns[h].bVisible,q,t;if(f||e||k||!m){b=0;for(c=a.aoData.length;b<c;b++){q=i[b*d+h];if(f)if(a.aoColumns[h].sType!="string"){t=$(a.aoData[b]._aData[h]);if(a.aoColumns[h].sType===null)a.aoColumns[h].sType=t;else if(a.aoColumns[h].sType!=t)a.aoColumns[h].sType="string"}if(e){t=a.aoColumns[h].fnRender({iDataRow:b,iDataColumn:h,aData:a.aoData[b]._aData,oSettings:a});q.innerHTML=t;if(a.aoColumns[h].bUseRendered)a.aoData[b]._aData[h]=t}if(k)q.className+=" "+a.aoColumns[h].sClass;if(!m){a.aoData[b]._anHidden[h]=
q;q.parentNode.removeChild(q)}}}}}function z(a){var b,c,d,f=0;if(a.nTHead.getElementsByTagName("th").length!==0){b=0;for(d=a.aoColumns.length;b<d;b++){c=a.aoColumns[b].nTh;if(a.aoColumns[b].bVisible){if(a.aoColumns[b].sTitle!=c.innerHTML)c.innerHTML=a.aoColumns[b].sTitle}else{c.parentNode.removeChild(c);f++}}}else{f=p.createElement("tr");b=0;for(d=a.aoColumns.length;b<d;b++){c=a.aoColumns[b].nTh;c.innerHTML=a.aoColumns[b].sTitle;if(a.aoColumns[b].bVisible){if(a.aoColumns[b].sClass!==null)c.className=
a.aoColumns[b].sClass;f.appendChild(c)}}j(a.nTHead).html("")[0].appendChild(f)}if(a.bJUI){b=0;for(d=a.aoColumns.length;b<d;b++){c=a.aoColumns[b].nTh;f=p.createElement("div");f.className=a.oClasses.sSortJUIWrapper;j(c).contents().appendTo(f);f.appendChild(p.createElement("span"));c.appendChild(f)}}d=function(){this.onselectstart=function(){return false};return false};if(a.oFeatures.bSort)for(b=0;b<a.aoColumns.length;b++)if(a.aoColumns[b].bSortable!==false){aa(a,a.aoColumns[b].nTh,b);j(a.aoColumns[b].nTh).mousedown(d)}else j(a.aoColumns[b].nTh).addClass(a.oClasses.sSortableNone);
if(a.nTFoot!==null){f=0;c=a.nTFoot.getElementsByTagName("th");b=0;for(d=c.length;b<d;b++)if(typeof a.aoColumns[b]!="undefined"){a.aoColumns[b].nTf=c[b-f];if(a.oClasses.sFooterTH!=="")a.aoColumns[b].nTf.className+=" "+a.oClasses.sFooterTH;if(!a.aoColumns[b].bVisible){c[b-f].parentNode.removeChild(c[b-f]);f++}}}}function C(a){var b,c,d=[],f=0,e=false;b=a.asStripClasses.length;c=a.aoOpenRows.length;a.bDrawing=true;if(typeof a.iInitDisplayStart!="undefined"&&a.iInitDisplayStart!=-1){a._iDisplayStart=
a.oFeatures.bServerSide?a.iInitDisplayStart:a.iInitDisplayStart>=a.fnRecordsDisplay()?0:a.iInitDisplayStart;a.iInitDisplayStart=-1;F(a)}if(!(a.oFeatures.bServerSide&&!pa(a))){a.oFeatures.bServerSide||a.iDraw++;if(a.aiDisplay.length!==0){var i=a._iDisplayStart,h=a._iDisplayEnd;if(a.oFeatures.bServerSide){i=0;h=a.aoData.length}for(i=i;i<h;i++){var k=a.aoData[a.aiDisplay[i]],m=k.nTr;if(b!==0){var q=a.asStripClasses[f%b];if(k._sRowStripe!=q){j(m).removeClass(k._sRowStripe).addClass(q);k._sRowStripe=q}}if(typeof a.fnRowCallback==
"function"){m=a.fnRowCallback.call(a.oInstance,m,a.aoData[a.aiDisplay[i]]._aData,f,i);if(!m&&!e){I(a,0,"A node was not returned by fnRowCallback");e=true}}d.push(m);f++;if(c!==0)for(k=0;k<c;k++)m==a.aoOpenRows[k].nParent&&d.push(a.aoOpenRows[k].nTr)}}else{d[0]=p.createElement("tr");if(typeof a.asStripClasses[0]!="undefined")d[0].className=a.asStripClasses[0];e=p.createElement("td");e.setAttribute("valign","top");e.colSpan=T(a);e.className=a.oClasses.sRowEmpty;e.innerHTML=typeof a.oLanguage.sEmptyTable!=
"undefined"&&a.fnRecordsTotal()===0?a.oLanguage.sEmptyTable:a.oLanguage.sZeroRecords.replace("_MAX_",a.fnFormatNumber(a.fnRecordsTotal()));d[f].appendChild(e)}typeof a.fnHeaderCallback=="function"&&a.fnHeaderCallback.call(a.oInstance,j(">tr",a.nTHead)[0],U(a),a._iDisplayStart,a.fnDisplayEnd(),a.aiDisplay);typeof a.fnFooterCallback=="function"&&a.fnFooterCallback.call(a.oInstance,j(">tr",a.nTFoot)[0],U(a),a._iDisplayStart,a.fnDisplayEnd(),a.aiDisplay);f=p.createDocumentFragment();b=p.createDocumentFragment();
if(a.nTBody){e=a.nTBody.parentNode;b.appendChild(a.nTBody);if(!a.oScroll.bInfinite||!a._bInitComplete||a.bSorted||a.bFiltered){c=a.nTBody.childNodes;for(b=c.length-1;b>=0;b--)c[b].parentNode.removeChild(c[b])}b=0;for(c=d.length;b<c;b++)f.appendChild(d[b]);a.nTBody.appendChild(f);e!==null&&e.appendChild(a.nTBody)}b=0;for(c=a.aoDrawCallback.length;b<c;b++)a.aoDrawCallback[b].fn.call(a.oInstance,a);a.bSorted=false;a.bFiltered=false;a.bDrawing=false;if(typeof a._bInitComplete=="undefined"){a._bInitComplete=
true;if(typeof a.fnInitComplete=="function"&&(a.oFeatures.bServerSide||a.sAjaxSource===null))a.fnInitComplete.call(a.oInstance,a)}}}function L(a){if(a.oFeatures.bSort)O(a,a.oPreviousSearch);else if(a.oFeatures.bFilter)P(a,a.oPreviousSearch);else{F(a);C(a)}}function pa(a){if(a.bAjaxDataGet){K(a,true);var b=a.aoColumns.length,c=[],d;a.iDraw++;c.push({name:"sEcho",value:a.iDraw});c.push({name:"iColumns",value:b});c.push({name:"sColumns",value:ba(a)});c.push({name:"iDisplayStart",value:a._iDisplayStart});
c.push({name:"iDisplayLength",value:a.oFeatures.bPaginate!==false?a._iDisplayLength:-1});if(a.oFeatures.bFilter!==false){c.push({name:"sSearch",value:a.oPreviousSearch.sSearch});c.push({name:"bRegex",value:a.oPreviousSearch.bRegex});for(d=0;d<b;d++){c.push({name:"sSearch_"+d,value:a.aoPreSearchCols[d].sSearch});c.push({name:"bRegex_"+d,value:a.aoPreSearchCols[d].bRegex});c.push({name:"bSearchable_"+d,value:a.aoColumns[d].bSearchable})}}if(a.oFeatures.bSort!==false){var f=a.aaSortingFixed!==null?a.aaSortingFixed.length:
0,e=a.aaSorting.length;c.push({name:"iSortingCols",value:f+e});for(d=0;d<f;d++){c.push({name:"iSortCol_"+d,value:a.aaSortingFixed[d][0]});c.push({name:"sSortDir_"+d,value:a.aaSortingFixed[d][1]})}for(d=0;d<e;d++){c.push({name:"iSortCol_"+(d+f),value:a.aaSorting[d][0]});c.push({name:"sSortDir_"+(d+f),value:a.aaSorting[d][1]})}for(d=0;d<b;d++)c.push({name:"bSortable_"+d,value:a.aoColumns[d].bSortable})}a.fnServerData.call(a.oInstance,a.sAjaxSource,c,function(i){qa(a,i)});return false}else return true}
function qa(a,b){if(typeof b.sEcho!="undefined")if(b.sEcho*1<a.iDraw)return;else a.iDraw=b.sEcho*1;if(!a.oScroll.bInfinite||a.oScroll.bInfinite&&(a.bSorted||a.bFiltered))ca(a);a._iRecordsTotal=b.iTotalRecords;a._iRecordsDisplay=b.iTotalDisplayRecords;var c=ba(a);if(c=typeof b.sColumns!="undefined"&&c!==""&&b.sColumns!=c)var d=ra(a,b.sColumns);for(var f=0,e=b.aaData.length;f<e;f++)if(c){for(var i=[],h=0,k=a.aoColumns.length;h<k;h++)i.push(b.aaData[f][d[h]]);w(a,i)}else w(a,b.aaData[f]);a.aiDisplay=
a.aiDisplayMaster.slice();a.bAjaxDataGet=false;C(a);a.bAjaxDataGet=true;K(a,false)}function oa(a){var b=p.createElement("div");a.nTable.parentNode.insertBefore(b,a.nTable);a.nTableWrapper=p.createElement("div");a.nTableWrapper.className=a.oClasses.sWrapper;a.sTableId!==""&&a.nTableWrapper.setAttribute("id",a.sTableId+"_wrapper");for(var c=a.nTableWrapper,d=a.sDom.split(""),f,e,i,h,k,m,q,t=0;t<d.length;t++){e=0;i=d[t];if(i=="<"){h=p.createElement("div");k=d[t+1];if(k=="'"||k=='"'){m="";for(q=2;d[t+
q]!=k;){m+=d[t+q];q++}if(m=="H")m="fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix";else if(m=="F")m="fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix";if(m.indexOf(".")!=-1){k=m.split(".");h.setAttribute("id",k[0].substr(1,k[0].length-1));h.className=k[1]}else if(m.charAt(0)=="#")h.setAttribute("id",m.substr(1,m.length-1));else h.className=m;t+=q}c.appendChild(h);c=h}else if(i==">")c=c.parentNode;else if(i=="l"&&a.oFeatures.bPaginate&&
a.oFeatures.bLengthChange){f=sa(a);e=1}else if(i=="f"&&a.oFeatures.bFilter){f=ta(a);e=1}else if(i=="r"&&a.oFeatures.bProcessing){f=ua(a);e=1}else if(i=="t"){f=va(a);e=1}else if(i=="i"&&a.oFeatures.bInfo){f=wa(a);e=1}else if(i=="p"&&a.oFeatures.bPaginate){f=xa(a);e=1}else if(n.aoFeatures.length!==0){h=n.aoFeatures;q=0;for(k=h.length;q<k;q++)if(i==h[q].cFeature){if(f=h[q].fnInit(a))e=1;break}}if(e==1&&f!==null){if(typeof a.aanFeatures[i]!="object")a.aanFeatures[i]=[];a.aanFeatures[i].push(f);c.appendChild(f)}}b.parentNode.replaceChild(a.nTableWrapper,
b)}function va(a){if(a.oScroll.sX===""&&a.oScroll.sY==="")return a.nTable;var b=p.createElement("div"),c=p.createElement("div"),d=p.createElement("div"),f=p.createElement("div"),e=p.createElement("div"),i=p.createElement("div"),h=a.nTable.cloneNode(false),k=a.nTable.cloneNode(false),m=a.nTable.getElementsByTagName("thead")[0],q=a.nTable.getElementsByTagName("tfoot").length===0?null:a.nTable.getElementsByTagName("tfoot")[0],t=typeof g.bJQueryUI!="undefined"&&g.bJQueryUI?n.oJUIClasses:n.oStdClasses;
c.appendChild(d);e.appendChild(i);f.appendChild(a.nTable);b.appendChild(c);b.appendChild(f);d.appendChild(h);h.appendChild(m);if(q!==null){b.appendChild(e);i.appendChild(k);k.appendChild(q)}b.className=t.sScrollWrapper;c.className=t.sScrollHead;d.className=t.sScrollHeadInner;f.className=t.sScrollBody;e.className=t.sScrollFoot;i.className=t.sScrollFootInner;c.style.overflow="hidden";e.style.overflow="hidden";f.style.overflow="auto";c.style.border="0";e.style.border="0";d.style.width="150%";h.removeAttribute("id");
h.style.marginLeft="0";a.nTable.style.marginLeft="0";if(q!==null){k.removeAttribute("id");k.style.marginLeft="0"}d=j(">caption",a.nTable);i=0;for(k=d.length;i<k;i++)h.appendChild(d[i]);if(a.oScroll.sX!==""){c.style.width=u(a.oScroll.sX);f.style.width=u(a.oScroll.sX);if(q!==null)e.style.width=u(a.oScroll.sX);j(f).scroll(function(){c.scrollLeft=this.scrollLeft;if(q!==null)e.scrollLeft=this.scrollLeft})}if(a.oScroll.sY!=="")f.style.height=u(a.oScroll.sY);a.aoDrawCallback.push({fn:ya,sName:"scrolling"});
a.oScroll.bInfinite&&j(f).scroll(function(){if(!a.bDrawing)if(j(this).scrollTop()+j(this).height()>j(a.nTable).height()-a.oScroll.iLoadGap)if(a.fnDisplayEnd()<a.fnRecordsDisplay()){da(a,"next");F(a);C(a)}});a.nScrollHead=c;a.nScrollFoot=e;return b}function ya(a){var b=a.nScrollHead.getElementsByTagName("div")[0],c=b.getElementsByTagName("table")[0],d=a.nTable.parentNode,f,e,i,h,k,m,q,t,H=[];i=a.nTable.getElementsByTagName("thead");i.length>0&&a.nTable.removeChild(i[0]);if(a.nTFoot!==null){k=a.nTable.getElementsByTagName("tfoot");
k.length>0&&a.nTable.removeChild(k[0])}i=a.nTHead.cloneNode(true);a.nTable.insertBefore(i,a.nTable.childNodes[0]);if(a.nTFoot!==null){k=a.nTFoot.cloneNode(true);a.nTable.insertBefore(k,a.nTable.childNodes[1])}var J=ea(i);f=0;for(e=J.length;f<e;f++){q=fa(a,f);J[f].style.width=a.aoColumns[q].sWidth}a.nTFoot!==null&&M(function(A){A.style.width=""},k.getElementsByTagName("tr"));f=j(a.nTable).outerWidth();if(a.oScroll.sX===""){a.nTable.style.width="100%";if(j.browser.msie&&j.browser.version<=7)a.nTable.style.width=
u(j(a.nTable).outerWidth()-a.oScroll.iBarWidth)}else if(a.oScroll.sXInner!=="")a.nTable.style.width=u(a.oScroll.sXInner);else if(f==j(d).width()&&j(d).height()<j(a.nTable).height()){a.nTable.style.width=u(f-a.oScroll.iBarWidth);if(j(a.nTable).outerWidth()>f-a.oScroll.iBarWidth)a.nTable.style.width=u(f)}else a.nTable.style.width=u(f);f=j(a.nTable).outerWidth();e=a.nTHead.getElementsByTagName("tr");i=i.getElementsByTagName("tr");M(function(A,G){m=A.style;m.paddingTop="0";m.paddingBottom="0";m.borderTopWidth=
"0";m.borderBottomWidth="0";m.height=0;t=j(A).width();G.style.width=u(t);H.push(t)},i,e);j(i).height(0);if(a.nTFoot!==null){h=k.getElementsByTagName("tr");k=a.nTFoot.getElementsByTagName("tr");M(function(A,G){m=A.style;m.paddingTop="0";m.paddingBottom="0";m.borderTopWidth="0";m.borderBottomWidth="0";t=j(A).width();G.style.width=u(t);H.push(t)},h,k);j(h).height(0)}M(function(A){A.innerHTML="";A.style.width=u(H.shift())},i);a.nTFoot!==null&&M(function(A){A.innerHTML="";A.style.width=u(H.shift())},h);
if(j(a.nTable).outerWidth()<f)if(a.oScroll.sX==="")I(a,1,"The table cannot fit into the current element which will cause column misalignment. It is suggested that you enable x-scrolling or increase the width the table has in which to be drawn");else a.oScroll.sXInner!==""&&I(a,1,"The table cannot fit into the current element which will cause column misalignment. It is suggested that you increase the sScrollXInner property to allow it to draw in a larger area, or simply remove that parameter to allow automatic calculation");
if(a.oScroll.sY==="")if(j.browser.msie&&j.browser.version<=7)d.style.height=u(a.nTable.offsetHeight+a.oScroll.iBarWidth);if(a.oScroll.sY!==""&&a.oScroll.bCollapse){d.style.height=u(a.oScroll.sY);h=a.oScroll.sX!==""&&a.nTable.offsetWidth>d.offsetWidth?a.oScroll.iBarWidth:0;if(a.nTable.offsetHeight<d.offsetHeight)d.style.height=u(j(a.nTable).height()+h)}c.style.width=u(j(a.nTable).outerWidth());b.style.width=u(j(a.nTable).outerWidth()+a.oScroll.iBarWidth);if(a.nTFoot!==null){b=a.nScrollFoot.getElementsByTagName("div")[0];
c=b.getElementsByTagName("table")[0];b.style.width=u(a.nTable.offsetWidth+a.oScroll.iBarWidth);c.style.width=u(a.nTable.offsetWidth)}if(a.bSorted||a.bFiltered)d.scrollTop=0}function V(a){if(a.oFeatures.bAutoWidth===false)return false;Z(a);for(var b=0,c=a.aoColumns.length;b<c;b++)a.aoColumns[b].nTh.style.width=a.aoColumns[b].sWidth}function ta(a){var b=p.createElement("div");a.sTableId!==""&&typeof a.aanFeatures.f=="undefined"&&b.setAttribute("id",a.sTableId+"_filter");b.className=a.oClasses.sFilter;
b.innerHTML=a.oLanguage.sSearch+(a.oLanguage.sSearch===""?"":" ")+'<input type="text" />';var c=j("input",b);c.val(a.oPreviousSearch.sSearch.replace('"',"&quot;"));c.keyup(function(){for(var d=a.aanFeatures.f,f=0,e=d.length;f<e;f++)d[f]!=this.parentNode&&j("input",d[f]).val(this.value);P(a,{sSearch:this.value,bRegex:a.oPreviousSearch.bRegex,bSmart:a.oPreviousSearch.bSmart})});c.keypress(function(d){if(d.keyCode==13)return false});return b}function P(a,b,c){za(a,b.sSearch,c,b.bRegex,b.bSmart);for(b=
0;b<a.aoPreSearchCols.length;b++)Aa(a,a.aoPreSearchCols[b].sSearch,b,a.aoPreSearchCols[b].bRegex,a.aoPreSearchCols[b].bSmart);n.afnFiltering.length!==0&&Ba(a);a.bFiltered=true;a._iDisplayStart=0;F(a);C(a);Q(a,0)}function Ba(a){for(var b=n.afnFiltering,c=0,d=b.length;c<d;c++)for(var f=0,e=0,i=a.aiDisplay.length;e<i;e++){var h=a.aiDisplay[e-f];if(!b[c](a,a.aoData[h]._aData,h)){a.aiDisplay.splice(e-f,1);f++}}}function Aa(a,b,c,d,f){if(b!==""){var e=0;b=ga(b,d,f);for(d=a.aiDisplay.length-1;d>=0;d--){f=
ha(a.aoData[a.aiDisplay[d]]._aData[c],a.aoColumns[c].sType);if(!b.test(f)){a.aiDisplay.splice(d,1);e++}}}}function za(a,b,c,d,f){var e=ga(b,d,f);if(typeof c=="undefined"||c===null)c=0;if(n.afnFiltering.length!==0)c=1;if(b.length<=0){a.aiDisplay.splice(0,a.aiDisplay.length);a.aiDisplay=a.aiDisplayMaster.slice()}else if(a.aiDisplay.length==a.aiDisplayMaster.length||a.oPreviousSearch.sSearch.length>b.length||c==1||b.indexOf(a.oPreviousSearch.sSearch)!==0){a.aiDisplay.splice(0,a.aiDisplay.length);Q(a,
1);for(c=0;c<a.aiDisplayMaster.length;c++)e.test(a.asDataSearch[c])&&a.aiDisplay.push(a.aiDisplayMaster[c])}else{var i=0;for(c=0;c<a.asDataSearch.length;c++)if(!e.test(a.asDataSearch[c])){a.aiDisplay.splice(c-i,1);i++}}a.oPreviousSearch.sSearch=b;a.oPreviousSearch.bRegex=d;a.oPreviousSearch.bSmart=f}function Q(a,b){a.asDataSearch.splice(0,a.asDataSearch.length);var c=p.createElement("div");b=typeof b!="undefined"&&b==1?a.aiDisplayMaster:a.aiDisplay;for(var d=0,f=b.length;d<f;d++){a.asDataSearch[d]=
"";for(var e=0,i=a.aoColumns.length;e<i;e++)if(a.aoColumns[e].bSearchable)a.asDataSearch[d]+=ha(a.aoData[b[d]]._aData[e],a.aoColumns[e].sType)+"  ";if(a.asDataSearch[d].indexOf("&")!==-1){c.innerHTML=a.asDataSearch[d];a.asDataSearch[d]=c.textContent?c.textContent:c.innerText;a.asDataSearch[d]=a.asDataSearch[d].replace(/\n/g," ").replace(/\r/g,"")}}}function ga(a,b,c){if(c){a=b?a.split(" "):ia(a).split(" ");a="^(?=.*?"+a.join(")(?=.*?")+").*$";return new RegExp(a,"i")}else{a=b?a:ia(a);return new RegExp(a,
"i")}}function ha(a,b){if(typeof n.ofnSearch[b]=="function")return n.ofnSearch[b](a);else if(b=="html")return a.replace(/\n/g," ").replace(/<.*?>/g,"");else if(typeof a=="string")return a.replace(/\n/g," ");return a}function O(a,b){var c=[],d=n.oSort,f=a.aoData,e,i,h,k;if(!a.oFeatures.bServerSide&&(a.aaSorting.length!==0||a.aaSortingFixed!==null)){c=a.aaSortingFixed!==null?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(h=0;h<c.length;h++){e=c[h][0];i=N(a,e);k=a.aoColumns[e].sSortDataType;
if(typeof n.afnSortData[k]!="undefined"){var m=n.afnSortData[k](a,e,i);i=0;for(k=f.length;i<k;i++)f[i]._aData[e]=m[i]}}if(Y.runtime){var q=[],t=c.length;for(h=0;h<t;h++){e=a.aoColumns[c[h][0]].iDataSort;q.push([e,a.aoColumns[e].sType+"-"+c[h][1]])}a.aiDisplayMaster.sort(function(H,J){for(var A,G=0;G<t;G++){A=d[q[G][1]](f[H]._aData[q[G][0]],f[J]._aData[q[G][0]]);if(A!==0)return A}return 0})}else{this.ClosureDataTables={fn:function(){},data:f,sort:n.oSort,master:a.aiDisplayMaster.slice()};k="this.ClosureDataTables.fn = function(a,b){var iTest, oSort=this.ClosureDataTables.sort, aoData=this.ClosureDataTables.data, aiOrig=this.ClosureDataTables.master;";
for(h=0;h<c.length-1;h++){e=a.aoColumns[c[h][0]].iDataSort;i=a.aoColumns[e].sType;k+="iTest = oSort['"+i+"-"+c[h][1]+"']( aoData[a]._aData["+e+"], aoData[b]._aData["+e+"] ); if ( iTest === 0 )"}if(c.length>0){e=a.aoColumns[c[c.length-1][0]].iDataSort;i=a.aoColumns[e].sType;k+="iTest = oSort['"+i+"-"+c[c.length-1][1]+"']( aoData[a]._aData["+e+"], aoData[b]._aData["+e+"] );if (iTest===0) return oSort['numeric-asc'](jQuery.inArray(a,aiOrig), jQuery.inArray(b,aiOrig)); return iTest;}";eval(k);a.aiDisplayMaster.sort(this.ClosureDataTables.fn)}this.ClosureDataTables=
undefined}}if(typeof b=="undefined"||b)W(a);a.bSorted=true;if(a.oFeatures.bFilter)P(a,a.oPreviousSearch,1);else{a.aiDisplay=a.aiDisplayMaster.slice();a._iDisplayStart=0;F(a);C(a)}}function aa(a,b,c,d){j(b).click(function(f){if(a.aoColumns[c].bSortable!==false){var e=function(){var i,h;if(f.shiftKey){for(var k=false,m=0;m<a.aaSorting.length;m++)if(a.aaSorting[m][0]==c){k=true;i=a.aaSorting[m][0];h=a.aaSorting[m][2]+1;if(typeof a.aoColumns[i].asSorting[h]=="undefined")a.aaSorting.splice(m,1);else{a.aaSorting[m][1]=
a.aoColumns[i].asSorting[h];a.aaSorting[m][2]=h}break}k===false&&a.aaSorting.push([c,a.aoColumns[c].asSorting[0],0])}else if(a.aaSorting.length==1&&a.aaSorting[0][0]==c){i=a.aaSorting[0][0];h=a.aaSorting[0][2]+1;if(typeof a.aoColumns[i].asSorting[h]=="undefined")h=0;a.aaSorting[0][1]=a.aoColumns[i].asSorting[h];a.aaSorting[0][2]=h}else{a.aaSorting.splice(0,a.aaSorting.length);a.aaSorting.push([c,a.aoColumns[c].asSorting[0],0])}O(a)};if(a.oFeatures.bProcessing){K(a,true);setTimeout(function(){e();
a.oFeatures.bServerSide||K(a,false)},0)}else e();typeof d=="function"&&d(a)}})}function W(a){var b,c,d,f,e,i=a.aoColumns.length,h=a.oClasses;for(b=0;b<i;b++)a.aoColumns[b].bSortable&&j(a.aoColumns[b].nTh).removeClass(h.sSortAsc+" "+h.sSortDesc+" "+a.aoColumns[b].sSortingClass);f=a.aaSortingFixed!==null?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(b=0;b<a.aoColumns.length;b++)if(a.aoColumns[b].bSortable){e=a.aoColumns[b].sSortingClass;d=-1;for(c=0;c<f.length;c++)if(f[c][0]==b){e=f[c][1]==
"asc"?h.sSortAsc:h.sSortDesc;d=c;break}j(a.aoColumns[b].nTh).addClass(e);if(a.bJUI){c=j("span",a.aoColumns[b].nTh);c.removeClass(h.sSortJUIAsc+" "+h.sSortJUIDesc+" "+h.sSortJUI+" "+h.sSortJUIAscAllowed+" "+h.sSortJUIDescAllowed);c.addClass(d==-1?a.aoColumns[b].sSortingClassJUI:f[d][1]=="asc"?h.sSortJUIAsc:h.sSortJUIDesc)}}else j(a.aoColumns[b].nTh).addClass(a.aoColumns[b].sSortingClass);e=h.sSortColumn;if(a.oFeatures.bSort&&a.oFeatures.bSortClasses){d=X(a);if(d.length>=i)for(b=0;b<i;b++)if(d[b].className.indexOf(e+
"1")!=-1){c=0;for(a=d.length/i;c<a;c++)d[i*c+b].className=j.trim(d[i*c+b].className.replace(e+"1",""))}else if(d[b].className.indexOf(e+"2")!=-1){c=0;for(a=d.length/i;c<a;c++)d[i*c+b].className=j.trim(d[i*c+b].className.replace(e+"2",""))}else if(d[b].className.indexOf(e+"3")!=-1){c=0;for(a=d.length/i;c<a;c++)d[i*c+b].className=j.trim(d[i*c+b].className.replace(" "+e+"3",""))}h=1;var k;for(b=0;b<f.length;b++){k=parseInt(f[b][0],10);c=0;for(a=d.length/i;c<a;c++)d[i*c+k].className+=" "+e+h;h<3&&h++}}}
function xa(a){if(a.oScroll.bInfinite)return null;var b=p.createElement("div");b.className=a.oClasses.sPaging+a.sPaginationType;n.oPagination[a.sPaginationType].fnInit(a,b,function(c){F(c);C(c)});typeof a.aanFeatures.p=="undefined"&&a.aoDrawCallback.push({fn:function(c){n.oPagination[c.sPaginationType].fnUpdate(c,function(d){F(d);C(d)})},sName:"pagination"});return b}function da(a,b){var c=a._iDisplayStart;if(b=="first")a._iDisplayStart=0;else if(b=="previous"){a._iDisplayStart=a._iDisplayLength>=
0?a._iDisplayStart-a._iDisplayLength:0;if(a._iDisplayStart<0)a._iDisplayStart=0}else if(b=="next")if(a._iDisplayLength>=0){if(a._iDisplayStart+a._iDisplayLength<a.fnRecordsDisplay())a._iDisplayStart+=a._iDisplayLength}else a._iDisplayStart=0;else if(b=="last")if(a._iDisplayLength>=0){b=parseInt((a.fnRecordsDisplay()-1)/a._iDisplayLength,10)+1;a._iDisplayStart=(b-1)*a._iDisplayLength}else a._iDisplayStart=0;else I(a,0,"Unknown paging action: "+b);return c!=a._iDisplayStart}function wa(a){var b=p.createElement("div");
b.className=a.oClasses.sInfo;if(typeof a.aanFeatures.i=="undefined"){a.aoDrawCallback.push({fn:Ca,sName:"information"});a.sTableId!==""&&b.setAttribute("id",a.sTableId+"_info")}return b}function Ca(a){if(!(!a.oFeatures.bInfo||a.aanFeatures.i.length===0)){var b=a._iDisplayStart+1,c=a.fnDisplayEnd(),d=a.fnRecordsTotal(),f=a.fnRecordsDisplay(),e=a.fnFormatNumber(b),i=a.fnFormatNumber(c),h=a.fnFormatNumber(d),k=a.fnFormatNumber(f);if(a.oScroll.bInfinite)e=a.fnFormatNumber(1);e=a.fnRecordsDisplay()===
0&&a.fnRecordsDisplay()==a.fnRecordsTotal()?a.oLanguage.sInfoEmpty+a.oLanguage.sInfoPostFix:a.fnRecordsDisplay()===0?a.oLanguage.sInfoEmpty+" "+a.oLanguage.sInfoFiltered.replace("_MAX_",h)+a.oLanguage.sInfoPostFix:a.fnRecordsDisplay()==a.fnRecordsTotal()?a.oLanguage.sInfo.replace("_START_",e).replace("_END_",i).replace("_TOTAL_",k)+a.oLanguage.sInfoPostFix:a.oLanguage.sInfo.replace("_START_",e).replace("_END_",i).replace("_TOTAL_",k)+" "+a.oLanguage.sInfoFiltered.replace("_MAX_",a.fnFormatNumber(a.fnRecordsTotal()))+
a.oLanguage.sInfoPostFix;if(a.oLanguage.fnInfoCallback!==null)e=a.oLanguage.fnInfoCallback(a,b,c,d,f,e);a=a.aanFeatures.i;b=0;for(c=a.length;b<c;b++)j(a[b]).html(e)}}function sa(a){if(a.oScroll.bInfinite)return null;var b='<select size="1" '+(a.sTableId===""?"":'name="'+a.sTableId+'_length"')+">",c,d;if(a.aLengthMenu.length==2&&typeof a.aLengthMenu[0]=="object"&&typeof a.aLengthMenu[1]=="object"){c=0;for(d=a.aLengthMenu[0].length;c<d;c++)b+='<option value="'+a.aLengthMenu[0][c]+'">'+a.aLengthMenu[1][c]+
"</option>"}else{c=0;for(d=a.aLengthMenu.length;c<d;c++)b+='<option value="'+a.aLengthMenu[c]+'">'+a.aLengthMenu[c]+"</option>"}b+="</select>";var f=p.createElement("div");a.sTableId!==""&&typeof a.aanFeatures.l=="undefined"&&f.setAttribute("id",a.sTableId+"_length");f.className=a.oClasses.sLength;f.innerHTML=a.oLanguage.sLengthMenu.replace("_MENU_",b);j('select option[value="'+a._iDisplayLength+'"]',f).attr("selected",true);j("select",f).change(function(){var e=j(this).val(),i=a.aanFeatures.l;c=
0;for(d=i.length;c<d;c++)i[c]!=this.parentNode&&j("select",i[c]).val(e);a._iDisplayLength=parseInt(e,10);F(a);if(a.fnDisplayEnd()==a.fnRecordsDisplay()){a._iDisplayStart=a.fnDisplayEnd()-a._iDisplayLength;if(a._iDisplayStart<0)a._iDisplayStart=0}if(a._iDisplayLength==-1)a._iDisplayStart=0;C(a)});return f}function ua(a){var b=p.createElement("div");a.sTableId!==""&&typeof a.aanFeatures.r=="undefined"&&b.setAttribute("id",a.sTableId+"_processing");b.innerHTML=a.oLanguage.sProcessing;b.className=a.oClasses.sProcessing;
a.nTable.parentNode.insertBefore(b,a.nTable);return b}function K(a,b){if(a.oFeatures.bProcessing){a=a.aanFeatures.r;for(var c=0,d=a.length;c<d;c++)a[c].style.visibility=b?"visible":"hidden"}}function fa(a,b){for(var c=-1,d=0;d<a.aoColumns.length;d++){a.aoColumns[d].bVisible===true&&c++;if(c==b)return d}return null}function N(a,b){for(var c=-1,d=0;d<a.aoColumns.length;d++){a.aoColumns[d].bVisible===true&&c++;if(d==b)return a.aoColumns[d].bVisible===true?c:null}return null}function R(a,b){var c,d;c=
a._iDisplayStart;for(d=a._iDisplayEnd;c<d;c++)if(a.aoData[a.aiDisplay[c]].nTr==b)return a.aiDisplay[c];c=0;for(d=a.aoData.length;c<d;c++)if(a.aoData[c].nTr==b)return c;return null}function T(a){for(var b=0,c=0;c<a.aoColumns.length;c++)a.aoColumns[c].bVisible===true&&b++;return b}function F(a){a._iDisplayEnd=a.oFeatures.bPaginate===false?a.aiDisplay.length:a._iDisplayStart+a._iDisplayLength>a.aiDisplay.length||a._iDisplayLength==-1?a.aiDisplay.length:a._iDisplayStart+a._iDisplayLength}function Da(a,
b){if(!a||a===null||a==="")return 0;if(typeof b=="undefined")b=p.getElementsByTagName("body")[0];var c=p.createElement("div");c.style.width=a;b.appendChild(c);a=c.offsetWidth;b.removeChild(c);return a}function Z(a){var b=0,c,d=0,f=a.aoColumns.length,e,i=j("th",a.nTHead);for(e=0;e<f;e++)if(a.aoColumns[e].bVisible){d++;if(a.aoColumns[e].sWidth!==null){c=Da(a.aoColumns[e].sWidthOrig,a.nTable.parentNode);if(c!==null)a.aoColumns[e].sWidth=u(c);b++}}if(f==i.length&&b===0&&d==f&&a.oScroll.sX===""&&a.oScroll.sY===
"")for(e=0;e<a.aoColumns.length;e++){c=j(i[e]).width();if(c!==null)a.aoColumns[e].sWidth=u(c)}else{b=a.nTable.cloneNode(false);e=p.createElement("tbody");c=p.createElement("tr");b.removeAttribute("id");b.appendChild(a.nTHead.cloneNode(true));if(a.nTFoot!==null){b.appendChild(a.nTFoot.cloneNode(true));M(function(h){h.style.width=""},b.getElementsByTagName("tr"))}b.appendChild(e);e.appendChild(c);e=j("thead th",b);if(e.length===0)e=j("tbody tr:eq(0)>td",b);e.each(function(h){this.style.width="";h=fa(a,
h);if(h!==null&&a.aoColumns[h].sWidthOrig!=="")this.style.width=a.aoColumns[h].sWidthOrig});for(e=0;e<f;e++)if(a.aoColumns[e].bVisible){d=Ea(a,e);if(d!==null){d=d.cloneNode(true);c.appendChild(d)}}e=a.nTable.parentNode;e.appendChild(b);if(a.oScroll.sX!==""&&a.oScroll.sXInner!=="")b.style.width=u(a.oScroll.sXInner);else if(a.oScroll.sX!==""){b.style.width="";if(j(b).width()<e.offsetWidth)b.style.width=u(e.offsetWidth)}else if(a.oScroll.sY!=="")b.style.width=u(e.offsetWidth);b.style.visibility="hidden";
Fa(a,b);f=j("tbody tr:eq(0)>td",b);if(f.length===0)f=j("thead tr:eq(0)>th",b);for(e=c=0;e<a.aoColumns.length;e++)if(a.aoColumns[e].bVisible){d=j(f[c]).width();if(d!==null&&d>0)a.aoColumns[e].sWidth=u(d);c++}a.nTable.style.width=u(j(b).outerWidth());b.parentNode.removeChild(b)}}function Fa(a,b){if(a.oScroll.sX===""&&a.oScroll.sY!==""){j(b).width();b.style.width=u(j(b).outerWidth()-a.oScroll.iBarWidth)}else if(a.oScroll.sX!=="")b.style.width=u(j(b).outerWidth())}function Ea(a,b,c){if(typeof c=="undefined"||
c){c=Ga(a,b);b=N(a,b);if(c<0)return null;return a.aoData[c].nTr.getElementsByTagName("td")[b]}var d=-1,f,e;c=-1;var i=p.createElement("div");i.style.visibility="hidden";i.style.position="absolute";p.body.appendChild(i);f=0;for(e=a.aoData.length;f<e;f++){i.innerHTML=a.aoData[f]._aData[b];if(i.offsetWidth>d){d=i.offsetWidth;c=f}}p.body.removeChild(i);if(c>=0){b=N(a,b);if(a=a.aoData[c].nTr.getElementsByTagName("td")[b])return a}return null}function Ga(a,b){for(var c=-1,d=-1,f=0;f<a.aoData.length;f++){var e=
a.aoData[f]._aData[b];if(e.length>c){c=e.length;d=f}}return d}function u(a){if(a===null)return"0px";if(typeof a=="number"){if(a<0)return"0px";return a+"px"}if(a.indexOf("em")!=-1||a.indexOf("%")!=-1||a.indexOf("ex")!=-1||a.indexOf("px")!=-1)return a;return a+"px"}function La(a,b){if(a.length!=b.length)return 1;for(var c=0;c<a.length;c++)if(a[c]!=b[c])return 2;return 0}function $(a){for(var b=n.aTypes,c=b.length,d=0;d<c;d++){var f=b[d](a);if(f!==null)return f}return"string"}function B(a){for(var b=
0;b<E.length;b++)if(E[b].nTable==a)return E[b];return null}function U(a){for(var b=[],c=a.aoData.length,d=0;d<c;d++)b.push(a.aoData[d]._aData);return b}function S(a){for(var b=[],c=a.aoData.length,d=0;d<c;d++)b.push(a.aoData[d].nTr);return b}function X(a){var b=S(a),c=[],d,f=[],e,i,h,k;e=0;for(i=b.length;e<i;e++){c=[];h=0;for(k=b[e].childNodes.length;h<k;h++){d=b[e].childNodes[h];d.nodeName.toUpperCase()=="TD"&&c.push(d)}h=d=0;for(k=a.aoColumns.length;h<k;h++)if(a.aoColumns[h].bVisible)f.push(c[h-
d]);else{f.push(a.aoData[e]._anHidden[h]);d++}}return f}function ia(a){return a.replace(new RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^)","g"),"\\$1")}function ja(a,b){for(var c=-1,d=0,f=a.length;d<f;d++)if(a[d]==b)c=d;else a[d]>b&&a[d]--;c!=-1&&a.splice(c,1)}function ra(a,b){b=b.split(",");for(var c=[],d=0,f=a.aoColumns.length;d<f;d++)for(var e=0;e<f;e++)if(a.aoColumns[d].sName==b[e]){c.push(e);break}return c}function ba(a){for(var b="",c=0,d=a.aoColumns.length;c<d;c++)b+=
a.aoColumns[c].sName+",";if(b.length==d)return"";return b.slice(0,-1)}function I(a,b,c){a=a.sTableId===""?"DataTables warning: "+c:"DataTables warning (table id = '"+a.sTableId+"'): "+c;if(b===0)if(n.sErrMode=="alert")alert(a);else throw a;else typeof console!="undefined"&&typeof console.log!="undefined"&&console.log(a)}function ca(a){a.aoData.splice(0,a.aoData.length);a.aiDisplayMaster.splice(0,a.aiDisplayMaster.length);a.aiDisplay.splice(0,a.aiDisplay.length);F(a)}function ka(a){if(!(!a.oFeatures.bStateSave||
typeof a.bDestroying!="undefined")){var b,c="{";c+='"iCreate":'+(new Date).getTime()+",";c+='"iStart":'+a._iDisplayStart+",";c+='"iEnd":'+a._iDisplayEnd+",";c+='"iLength":'+a._iDisplayLength+",";c+='"sFilter":"'+encodeURIComponent(a.oPreviousSearch.sSearch)+'",';c+='"sFilterEsc":'+!a.oPreviousSearch.bRegex+",";c+='"aaSorting":[ ';for(b=0;b<a.aaSorting.length;b++)c+="["+a.aaSorting[b][0]+',"'+a.aaSorting[b][1]+'"],';c=c.substring(0,c.length-1);c+="],";c+='"aaSearchCols":[ ';for(b=0;b<a.aoPreSearchCols.length;b++)c+=
'["'+encodeURIComponent(a.aoPreSearchCols[b].sSearch)+'",'+!a.aoPreSearchCols[b].bRegex+"],";c=c.substring(0,c.length-1);c+="],";c+='"abVisCols":[ ';for(b=0;b<a.aoColumns.length;b++)c+=a.aoColumns[b].bVisible+",";c=c.substring(0,c.length-1);c+="]";c+="}";Ha(a.sCookiePrefix+a.sInstance,c,a.iCookieDuration,a.sCookiePrefix,a.fnCookieCallback)}}function Ia(a,b){if(a.oFeatures.bStateSave){var c,d=la(a.sCookiePrefix+a.sInstance);if(d!==null&&d!==""){try{c=typeof j.parseJSON=="function"?j.parseJSON(d.replace(/'/g,
'"')):eval("("+d+")")}catch(f){return}a._iDisplayStart=c.iStart;a.iInitDisplayStart=c.iStart;a._iDisplayEnd=c.iEnd;a._iDisplayLength=c.iLength;a.oPreviousSearch.sSearch=decodeURIComponent(c.sFilter);a.aaSorting=c.aaSorting.slice();a.saved_aaSorting=c.aaSorting.slice();if(typeof c.sFilterEsc!="undefined")a.oPreviousSearch.bRegex=!c.sFilterEsc;if(typeof c.aaSearchCols!="undefined")for(d=0;d<c.aaSearchCols.length;d++)a.aoPreSearchCols[d]={sSearch:decodeURIComponent(c.aaSearchCols[d][0]),bRegex:!c.aaSearchCols[d][1]};
if(typeof c.abVisCols!="undefined"){b.saved_aoColumns=[];for(d=0;d<c.abVisCols.length;d++){b.saved_aoColumns[d]={};b.saved_aoColumns[d].bVisible=c.abVisCols[d]}}}}}function Ha(a,b,c,d,f){var e=new Date;e.setTime(e.getTime()+c*1E3);c=Y.location.pathname.split("/");a=a+"_"+c.pop().replace(/[\/:]/g,"").toLowerCase();var i;if(f!==null){i=typeof j.parseJSON=="function"?j.parseJSON(b):eval("("+b+")");b=f(a,i,e.toGMTString(),c.join("/")+"/")}else b=a+"="+encodeURIComponent(b)+"; expires="+e.toGMTString()+
"; path="+c.join("/")+"/";f="";e=9999999999999;if((la(a)!==null?p.cookie.length:b.length+p.cookie.length)+10>4096){a=p.cookie.split(";");for(var h=0,k=a.length;h<k;h++)if(a[h].indexOf(d)!=-1){var m=a[h].split("=");try{i=eval("("+decodeURIComponent(m[1])+")")}catch(q){continue}if(typeof i.iCreate!="undefined"&&i.iCreate<e){f=m[0];e=i.iCreate}}if(f!=="")p.cookie=f+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path="+c.join("/")+"/"}p.cookie=b}function la(a){var b=Y.location.pathname.split("/");a=a+"_"+
b[b.length-1].replace(/[\/:]/g,"").toLowerCase()+"=";b=p.cookie.split(";");for(var c=0;c<b.length;c++){for(var d=b[c];d.charAt(0)==" ";)d=d.substring(1,d.length);if(d.indexOf(a)===0)return decodeURIComponent(d.substring(a.length,d.length))}return null}function ea(a){a=a.getElementsByTagName("tr");if(a.length==1)return a[0].getElementsByTagName("th");var b=[],c=[],d,f,e,i,h,k,m=function(G,Ma,ma){for(;typeof G[Ma][ma]!="undefined";)ma++;return ma},q=function(G){if(typeof b[G]=="undefined")b[G]=[]};
d=0;for(i=a.length;d<i;d++){q(d);var t=0,H=[];f=0;for(h=a[d].childNodes.length;f<h;f++)if(a[d].childNodes[f].nodeName.toUpperCase()=="TD"||a[d].childNodes[f].nodeName.toUpperCase()=="TH")H.push(a[d].childNodes[f]);f=0;for(h=H.length;f<h;f++){var J=H[f].getAttribute("colspan")*1,A=H[f].getAttribute("rowspan")*1;if(!J||J===0||J===1){k=m(b,d,t);b[d][k]=H[f].nodeName.toUpperCase()=="TD"?4:H[f];if(A||A===0||A===1)for(e=1;e<A;e++){q(d+e);b[d+e][k]=2}t++}else{k=m(b,d,t);for(e=0;e<J;e++)b[d][k+e]=3;t+=J}}}d=
0;for(i=b.length;d<i;d++){f=0;for(h=b[d].length;f<h;f++)if(typeof b[d][f]=="object")c[f]=b[d][f]}return c}function Ja(){var a=p.createElement("p"),b=a.style;b.width="100%";b.height="200px";var c=p.createElement("div");b=c.style;b.position="absolute";b.top="0px";b.left="0px";b.visibility="hidden";b.width="200px";b.height="150px";b.overflow="hidden";c.appendChild(a);p.body.appendChild(c);b=a.offsetWidth;c.style.overflow="scroll";a=a.offsetWidth;if(b==a)a=c.clientWidth;p.body.removeChild(c);return b-
a}function M(a,b,c){for(var d=0,f=b.length;d<f;d++)for(var e=0,i=b[d].childNodes.length;e<i;e++)if(b[d].childNodes[e].nodeType==1)typeof c!="undefined"?a(b[d].childNodes[e],c[d].childNodes[e]):a(b[d].childNodes[e])}function o(a,b,c,d){if(typeof d=="undefined")d=c;if(typeof b[c]!="undefined")a[d]=b[c]}this.oApi={};this.fnDraw=function(a){var b=B(this[n.iApiIndex]);if(typeof a!="undefined"&&a===false){F(b);C(b)}else L(b)};this.fnFilter=function(a,b,c,d,f){var e=B(this[n.iApiIndex]);if(e.oFeatures.bFilter){if(typeof c==
"undefined")c=false;if(typeof d=="undefined")d=true;if(typeof f=="undefined")f=true;if(typeof b=="undefined"||b===null){P(e,{sSearch:a,bRegex:c,bSmart:d},1);if(f&&typeof e.aanFeatures.f!="undefined"){b=e.aanFeatures.f;c=0;for(d=b.length;c<d;c++)j("input",b[c]).val(a)}}else{e.aoPreSearchCols[b].sSearch=a;e.aoPreSearchCols[b].bRegex=c;e.aoPreSearchCols[b].bSmart=d;P(e,e.oPreviousSearch,1)}}};this.fnSettings=function(){return B(this[n.iApiIndex])};this.fnVersionCheck=n.fnVersionCheck;this.fnSort=function(a){var b=
B(this[n.iApiIndex]);b.aaSorting=a;O(b)};this.fnSortListener=function(a,b,c){aa(B(this[n.iApiIndex]),a,b,c)};this.fnAddData=function(a,b){if(a.length===0)return[];var c=[],d,f=B(this[n.iApiIndex]);if(typeof a[0]=="object")for(var e=0;e<a.length;e++){d=w(f,a[e]);if(d==-1)return c;c.push(d)}else{d=w(f,a);if(d==-1)return c;c.push(d)}f.aiDisplay=f.aiDisplayMaster.slice();Q(f,1);if(typeof b=="undefined"||b)L(f);return c};this.fnDeleteRow=function(a,b,c){var d=B(this[n.iApiIndex]);a=typeof a=="object"?
R(d,a):a;var f=d.aoData.splice(a,1);ja(d.aiDisplayMaster,a);ja(d.aiDisplay,a);Q(d,1);typeof b=="function"&&b.call(this,d,f);if(d._iDisplayStart>=d.aiDisplay.length){d._iDisplayStart-=d._iDisplayLength;if(d._iDisplayStart<0)d._iDisplayStart=0}if(typeof c=="undefined"||c){F(d);C(d)}return f};this.fnClearTable=function(a){var b=B(this[n.iApiIndex]);ca(b);if(typeof a=="undefined"||a)C(b)};this.fnOpen=function(a,b,c){var d=B(this[n.iApiIndex]);this.fnClose(a);var f=p.createElement("tr"),e=p.createElement("td");
f.appendChild(e);e.className=c;e.colSpan=T(d);e.innerHTML=b;b=j("tr",d.nTBody);j.inArray(a,b)!=-1&&j(f).insertAfter(a);d.aoOpenRows.push({nTr:f,nParent:a});return f};this.fnClose=function(a){for(var b=B(this[n.iApiIndex]),c=0;c<b.aoOpenRows.length;c++)if(b.aoOpenRows[c].nParent==a){(a=b.aoOpenRows[c].nTr.parentNode)&&a.removeChild(b.aoOpenRows[c].nTr);b.aoOpenRows.splice(c,1);return 0}return 1};this.fnGetData=function(a){var b=B(this[n.iApiIndex]);if(typeof a!="undefined"){a=typeof a=="object"?R(b,
a):a;return b.aoData[a]._aData}return U(b)};this.fnGetNodes=function(a){var b=B(this[n.iApiIndex]);if(typeof a!="undefined")return b.aoData[a].nTr;return S(b)};this.fnGetPosition=function(a){var b=B(this[n.iApiIndex]);if(a.nodeName.toUpperCase()=="TR")return R(b,a);else if(a.nodeName.toUpperCase()=="TD")for(var c=R(b,a.parentNode),d=0,f=0;f<b.aoColumns.length;f++)if(b.aoColumns[f].bVisible){if(b.aoData[c].nTr.getElementsByTagName("td")[f-d]==a)return[c,f-d,f]}else d++;return null};this.fnUpdate=function(a,
b,c,d,f){var e=B(this[n.iApiIndex]),i=typeof b=="object"?R(e,b):b;if(typeof a!="object"){b=a;e.aoData[i]._aData[c]=b;if(e.aoColumns[c].fnRender!==null){b=e.aoColumns[c].fnRender({iDataRow:i,iDataColumn:c,aData:e.aoData[i]._aData,oSettings:e});if(e.aoColumns[c].bUseRendered)e.aoData[i]._aData[c]=b}c=N(e,c);if(c!==null)e.aoData[i].nTr.getElementsByTagName("td")[c].innerHTML=b}else{if(a.length!=e.aoColumns.length){I(e,0,"An array passed to fnUpdate must have the same number of columns as the table in question - in this case "+
e.aoColumns.length);return 1}for(var h=0;h<a.length;h++){b=a[h];e.aoData[i]._aData[h]=b;if(e.aoColumns[h].fnRender!==null){b=e.aoColumns[h].fnRender({iDataRow:i,iDataColumn:h,aData:e.aoData[i]._aData,oSettings:e});if(e.aoColumns[h].bUseRendered)e.aoData[i]._aData[h]=b}c=N(e,h);if(c!==null)e.aoData[i].nTr.getElementsByTagName("td")[c].innerHTML=b}}if(typeof f=="undefined"||f){Q(e,1);V(e)}if(typeof d=="undefined"||d)L(e);return 0};this.fnSetColumnVis=function(a,b){var c=B(this[n.iApiIndex]),d,f;f=c.aoColumns.length;
var e,i;if(c.aoColumns[a].bVisible!=b){e=j(">tr",c.nTHead)[0];var h=j(">tr",c.nTFoot)[0],k=[],m=[];for(d=0;d<f;d++){k.push(c.aoColumns[d].nTh);m.push(c.aoColumns[d].nTf)}if(b){for(d=b=0;d<a;d++)c.aoColumns[d].bVisible&&b++;if(b>=T(c)){e.appendChild(k[a]);h&&h.appendChild(m[a]);d=0;for(f=c.aoData.length;d<f;d++){e=c.aoData[d]._anHidden[a];c.aoData[d].nTr.appendChild(e)}}else{for(d=a;d<f;d++){i=N(c,d);if(i!==null)break}e.insertBefore(k[a],e.getElementsByTagName("th")[i]);h&&h.insertBefore(m[a],h.getElementsByTagName("th")[i]);
X(c);d=0;for(f=c.aoData.length;d<f;d++){e=c.aoData[d]._anHidden[a];c.aoData[d].nTr.insertBefore(e,j(">td:eq("+i+")",c.aoData[d].nTr)[0])}}c.aoColumns[a].bVisible=true}else{e.removeChild(k[a]);h&&h.removeChild(m[a]);i=X(c);d=0;for(f=c.aoData.length;d<f;d++){e=i[d*c.aoColumns.length+a*1];c.aoData[d]._anHidden[a]=e;e.parentNode.removeChild(e)}c.aoColumns[a].bVisible=false}d=0;for(f=c.aoOpenRows.length;d<f;d++)c.aoOpenRows[d].nTr.colSpan=T(c);V(c);C(c);ka(c)}};this.fnPageChange=function(a,b){var c=B(this[n.iApiIndex]);
da(c,a);F(c);if(typeof b=="undefined"||b)C(c)};this.fnDestroy=function(){var a=B(this[n.iApiIndex]),b=a.nTableWrapper.parentNode,c=a.nTBody,d,f;a.bDestroying=true;d=0;for(f=a.aoColumns.length;d<f;d++)a.aoColumns[d].bVisible===false&&this.fnSetColumnVis(d,true);j("tbody>tr>td."+a.oClasses.sRowEmpty,a.nTable).parent().remove();if(a.nTable!=a.nTHead.parentNode){j(">thead",a.nTable).remove();a.nTable.appendChild(a.nTHead)}if(a.nTFoot&&a.nTable!=a.nTFoot.parentNode){j(">tfoot",a.nTable).remove();a.nTable.appendChild(a.nTFoot)}a.nTable.parentNode.removeChild(a.nTable);
j(a.nTableWrapper).remove();a.aaSorting=[];a.aaSortingFixed=[];W(a);j(S(a)).removeClass(a.asStripClasses.join(" "));if(a.bJUI){j("th",a.nTHead).removeClass([n.oStdClasses.sSortable,n.oJUIClasses.sSortableAsc,n.oJUIClasses.sSortableDesc,n.oJUIClasses.sSortableNone].join(" "));j("th span",a.nTHead).remove()}else j("th",a.nTHead).removeClass([n.oStdClasses.sSortable,n.oStdClasses.sSortableAsc,n.oStdClasses.sSortableDesc,n.oStdClasses.sSortableNone].join(" "));b.appendChild(a.nTable);d=0;for(f=a.aoData.length;d<
f;d++)c.appendChild(a.aoData[d].nTr);a.nTable.style.width=u(a.sDestroyWidth);j(">tr:even",c).addClass(a.asDestoryStrips[0]);j(">tr:odd",c).addClass(a.asDestoryStrips[1]);d=0;for(f=E.length;d<f;d++)E[d]==a&&E.splice(d,1)};this.fnAdjustColumnSizing=function(a){V(B(this[n.iApiIndex]));if(typeof a=="undefined"||a)this.fnDraw(false)};for(var na in n.oApi)if(na)this[na]=r(na);this.oApi._fnExternApiFunc=r;this.oApi._fnInitalise=s;this.oApi._fnLanguageProcess=v;this.oApi._fnAddColumn=y;this.oApi._fnColumnOptions=
D;this.oApi._fnAddData=w;this.oApi._fnGatherData=x;this.oApi._fnDrawHead=z;this.oApi._fnDraw=C;this.oApi._fnReDraw=L;this.oApi._fnAjaxUpdate=pa;this.oApi._fnAjaxUpdateDraw=qa;this.oApi._fnAddOptionsHtml=oa;this.oApi._fnFeatureHtmlTable=va;this.oApi._fnScrollDraw=ya;this.oApi._fnAjustColumnSizing=V;this.oApi._fnFeatureHtmlFilter=ta;this.oApi._fnFilterComplete=P;this.oApi._fnFilterCustom=Ba;this.oApi._fnFilterColumn=Aa;this.oApi._fnFilter=za;this.oApi._fnBuildSearchArray=Q;this.oApi._fnFilterCreateSearch=
ga;this.oApi._fnDataToSearch=ha;this.oApi._fnSort=O;this.oApi._fnSortAttachListener=aa;this.oApi._fnSortingClasses=W;this.oApi._fnFeatureHtmlPaginate=xa;this.oApi._fnPageChange=da;this.oApi._fnFeatureHtmlInfo=wa;this.oApi._fnUpdateInfo=Ca;this.oApi._fnFeatureHtmlLength=sa;this.oApi._fnFeatureHtmlProcessing=ua;this.oApi._fnProcessingDisplay=K;this.oApi._fnVisibleToColumnIndex=fa;this.oApi._fnColumnIndexToVisible=N;this.oApi._fnNodeToDataIndex=R;this.oApi._fnVisbleColumns=T;this.oApi._fnCalculateEnd=
F;this.oApi._fnConvertToWidth=Da;this.oApi._fnCalculateColumnWidths=Z;this.oApi._fnScrollingWidthAdjust=Fa;this.oApi._fnGetWidestNode=Ea;this.oApi._fnGetMaxLenString=Ga;this.oApi._fnStringToCss=u;this.oApi._fnArrayCmp=La;this.oApi._fnDetectType=$;this.oApi._fnSettingsFromNode=B;this.oApi._fnGetDataMaster=U;this.oApi._fnGetTrNodes=S;this.oApi._fnGetTdNodes=X;this.oApi._fnEscapeRegex=ia;this.oApi._fnDeleteIndex=ja;this.oApi._fnReOrderIndex=ra;this.oApi._fnColumnOrdering=ba;this.oApi._fnLog=I;this.oApi._fnClearTable=
ca;this.oApi._fnSaveState=ka;this.oApi._fnLoadState=Ia;this.oApi._fnCreateCookie=Ha;this.oApi._fnReadCookie=la;this.oApi._fnGetUniqueThs=ea;this.oApi._fnScrollBarWidth=Ja;this.oApi._fnApplyToChildren=M;this.oApi._fnMap=o;var Ka=this;return this.each(function(){var a=0,b,c,d,f;a=0;for(b=E.length;a<b;a++){if(E[a].nTable==this)if(typeof g=="undefined"||typeof g.bRetrieve!="undefined"&&g.bRetrieve===true)return E[a].oInstance;else if(typeof g.bDestroy!="undefined"&&g.bDestroy===true){E[a].oInstance.fnDestroy();
break}else{I(E[a],0,"Cannot reinitialise DataTable.\n\nTo retrieve the DataTables object for this table, please pass either no arguments to the dataTable() function, or set bRetrieve to true. Alternatively, to destory the old table and create a new one, set bDestroy to true (note that a lot of changes to the configuration can be made through the API which is usually much faster).");return}if(E[a].sTableId!==""&&E[a].sTableId==this.getAttribute("id")){E.splice(a,1);break}}var e=new l;E.push(e);var i=
false,h=false;a=this.getAttribute("id");if(a!==null){e.sTableId=a;e.sInstance=a}else e.sInstance=n._oExternConfig.iNextUnique++;if(this.nodeName.toLowerCase()!="table")I(e,0,"Attempted to initialise DataTables on a node which is not a table: "+this.nodeName);else{e.oInstance=Ka;e.nTable=this;e.oApi=Ka.oApi;e.sDestroyWidth=j(this).width();if(typeof g!="undefined"&&g!==null){e.oInit=g;o(e.oFeatures,g,"bPaginate");o(e.oFeatures,g,"bLengthChange");o(e.oFeatures,g,"bFilter");o(e.oFeatures,g,"bSort");o(e.oFeatures,
g,"bInfo");o(e.oFeatures,g,"bProcessing");o(e.oFeatures,g,"bAutoWidth");o(e.oFeatures,g,"bSortClasses");o(e.oFeatures,g,"bServerSide");o(e.oScroll,g,"sScrollX","sX");o(e.oScroll,g,"sScrollXInner","sXInner");o(e.oScroll,g,"sScrollY","sY");o(e.oScroll,g,"bScrollCollapse","bCollapse");o(e.oScroll,g,"bScrollInfinite","bInfinite");o(e.oScroll,g,"iScrollLoadGap","iLoadGap");o(e,g,"asStripClasses");o(e,g,"fnRowCallback");o(e,g,"fnHeaderCallback");o(e,g,"fnFooterCallback");o(e,g,"fnCookieCallback");o(e,g,
"fnInitComplete");o(e,g,"fnServerData");o(e,g,"fnFormatNumber");o(e,g,"aaSorting");o(e,g,"aaSortingFixed");o(e,g,"aLengthMenu");o(e,g,"sPaginationType");o(e,g,"sAjaxSource");o(e,g,"iCookieDuration");o(e,g,"sCookiePrefix");o(e,g,"sDom");o(e,g,"oSearch","oPreviousSearch");o(e,g,"aoSearchCols","aoPreSearchCols");o(e,g,"iDisplayLength","_iDisplayLength");o(e,g,"bJQueryUI","bJUI");o(e.oLanguage,g,"fnInfoCallback");typeof g.fnDrawCallback=="function"&&e.aoDrawCallback.push({fn:g.fnDrawCallback,sName:"user"});
e.oFeatures.bServerSide&&e.oFeatures.bSort&&e.oFeatures.bSortClasses&&e.aoDrawCallback.push({fn:W,sName:"server_side_sort_classes"});if(typeof g.bJQueryUI!="undefined"&&g.bJQueryUI){e.oClasses=n.oJUIClasses;if(typeof g.sDom=="undefined")e.sDom='<"H"lfr>t<"F"ip>'}if(e.oScroll.sX!==""||e.oScroll.sY!=="")e.oScroll.iBarWidth=Ja();if(typeof g.iDisplayStart!="undefined"&&typeof e.iInitDisplayStart=="undefined"){e.iInitDisplayStart=g.iDisplayStart;e._iDisplayStart=g.iDisplayStart}if(typeof g.bStateSave!=
"undefined"){e.oFeatures.bStateSave=g.bStateSave;Ia(e,g);e.aoDrawCallback.push({fn:ka,sName:"state_save"})}if(typeof g.aaData!="undefined")h=true;if(typeof g!="undefined"&&typeof g.aoData!="undefined")g.aoColumns=g.aoData;if(typeof g.oLanguage!="undefined")if(typeof g.oLanguage.sUrl!="undefined"&&g.oLanguage.sUrl!==""){e.oLanguage.sUrl=g.oLanguage.sUrl;j.getJSON(e.oLanguage.sUrl,null,function(q){v(e,q,true)});i=true}else v(e,g.oLanguage,false)}else g={};if(typeof g.asStripClasses=="undefined"){e.asStripClasses.push(e.oClasses.sStripOdd);
e.asStripClasses.push(e.oClasses.sStripEven)}c=false;d=j("tbody>tr",this);a=0;for(b=e.asStripClasses.length;a<b;a++)if(d.filter(":lt(2)").hasClass(e.asStripClasses[a])){c=true;break}if(c){e.asDestoryStrips=["",""];if(j(d[0]).hasClass(e.oClasses.sStripOdd))e.asDestoryStrips[0]+=e.oClasses.sStripOdd+" ";if(j(d[0]).hasClass(e.oClasses.sStripEven))e.asDestoryStrips[0]+=e.oClasses.sStripEven;if(j(d[1]).hasClass(e.oClasses.sStripOdd))e.asDestoryStrips[1]+=e.oClasses.sStripOdd+" ";if(j(d[1]).hasClass(e.oClasses.sStripEven))e.asDestoryStrips[1]+=
e.oClasses.sStripEven;d.removeClass(e.asStripClasses.join(" "))}a=this.getElementsByTagName("thead");c=a.length===0?[]:ea(a[0]);var k;if(typeof g.aoColumns=="undefined"){k=[];a=0;for(b=c.length;a<b;a++)k.push(null)}else k=g.aoColumns;a=0;for(b=k.length;a<b;a++){if(typeof g.saved_aoColumns!="undefined"&&g.saved_aoColumns.length==b){if(k[a]===null)k[a]={};k[a].bVisible=g.saved_aoColumns[a].bVisible}y(e,c?c[a]:null)}if(typeof g.aoColumnDefs!="undefined")for(a=g.aoColumnDefs.length-1;a>=0;a--){var m=
g.aoColumnDefs[a].aTargets;c=0;for(d=m.length;c<d;c++)if(typeof m[c]=="number"&&m[c]>=0){for(;e.aoColumns.length<=m[c];)y(e);D(e,m[c],g.aoColumnDefs[a])}else if(typeof m[c]=="number"&&m[c]<0)D(e,e.aoColumns.length+m[c],g.aoColumnDefs[a]);else if(typeof m[c]=="string"){b=0;for(f=e.aoColumns.length;b<f;b++)if(m[c]=="_all"||e.aoColumns[b].nTh.className.indexOf(m[c])!=-1)D(e,b,g.aoColumnDefs[a])}}if(typeof k!="undefined"){a=0;for(b=k.length;a<b;a++)D(e,a,k[a])}a=0;for(b=e.aaSorting.length;a<b;a++){k=
e.aoColumns[e.aaSorting[a][0]];if(typeof e.aaSorting[a][2]=="undefined")e.aaSorting[a][2]=0;if(typeof g.aaSorting=="undefined"&&typeof e.saved_aaSorting=="undefined")e.aaSorting[a][1]=k.asSorting[0];c=0;for(d=k.asSorting.length;c<d;c++)if(e.aaSorting[a][1]==k.asSorting[c]){e.aaSorting[a][2]=c;break}}this.getElementsByTagName("thead").length===0&&this.appendChild(p.createElement("thead"));this.getElementsByTagName("tbody").length===0&&this.appendChild(p.createElement("tbody"));e.nTHead=this.getElementsByTagName("thead")[0];
e.nTBody=this.getElementsByTagName("tbody")[0];if(this.getElementsByTagName("tfoot").length>0)e.nTFoot=this.getElementsByTagName("tfoot")[0];if(h)for(a=0;a<g.aaData.length;a++)w(e,g.aaData[a]);else x(e);e.aiDisplay=e.aiDisplayMaster.slice();e.bInitialised=true;i===false&&s(e)}})}})(jQuery,window,document);
/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).

  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    $.browser.msie && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.
      
      var iframe,
        iframe_src;
      
      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();
          
          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
            
            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })
            
            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )
            
            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;
          
          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };
          
        }
      };
      
      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;
      
      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };
      
      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;
        
        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;
          
          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();
          
          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
          
          iframe_doc.close();
          
          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };
      
    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    return self;
  })();
  
})(jQuery,this);
/* Modernizr 2.0.6 (Custom Build) | MIT & BSD
 * Build: http://www.modernizr.com/download/#-backgroundsize-boxshadow-cssgradients-hashchange-iepp-cssclasses-testprop-testallprops-hasevent-prefixes-domprefixes-load
 */

;window.Modernizr=function(a,b,c){function C(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1),d=(a+" "+o.join(c+" ")+c).split(" ");return B(d,b)}function B(a,b){for(var d in a)if(k[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function A(a,b){return!!~(""+a).indexOf(b)}function z(a,b){return typeof a===b}function y(a,b){return x(n.join(a+";")+(b||""))}function x(a){k.cssText=a}var d="2.0.6",e={},f=!0,g=b.documentElement,h=b.head||b.getElementsByTagName("head")[0],i="modernizr",j=b.createElement(i),k=j.style,l,m=Object.prototype.toString,n=" -webkit- -moz- -o- -ms- -khtml- ".split(" "),o="Webkit Moz O ms Khtml".split(" "),p={},q={},r={},s=[],t=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=z(e[d],"function"),z(e[d],c)||(e[d]=c),e.removeAttribute(d))),e=null;return f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),u,v={}.hasOwnProperty,w;!z(v,c)&&!z(v.call,c)?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],c)},p.hashchange=function(){return t("hashchange",a)&&(b.documentMode===c||b.documentMode>7)},p.backgroundsize=function(){return C("backgroundSize")},p.boxshadow=function(){return C("boxShadow")},p.cssgradients=function(){var a="background-image:",b="gradient(linear,left top,right bottom,from(#9f9),to(white));",c="linear-gradient(left top,#9f9, white);";x((a+n.join(b+a)+n.join(c+a)).slice(0,-a.length));return A(k.backgroundImage,"gradient")};for(var D in p)w(p,D)&&(u=D.toLowerCase(),e[u]=p[D](),s.push((e[u]?"":"no-")+u));x(""),j=l=null,a.attachEvent&&function(){var a=b.createElement("div");a.innerHTML="<elem></elem>";return a.childNodes.length!==1}()&&function(a,b){function s(a){var b=-1;while(++b<g)a.createElement(f[b])}a.iepp=a.iepp||{};var d=a.iepp,e=d.html5elements||"abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",f=e.split("|"),g=f.length,h=new RegExp("(^|\\s)("+e+")","gi"),i=new RegExp("<(/*)("+e+")","gi"),j=/^\s*[\{\}]\s*$/,k=new RegExp("(^|[^\\n]*?\\s)("+e+")([^\\n]*)({[\\n\\w\\W]*?})","gi"),l=b.createDocumentFragment(),m=b.documentElement,n=m.firstChild,o=b.createElement("body"),p=b.createElement("style"),q=/print|all/,r;d.getCSS=function(a,b){if(a+""===c)return"";var e=-1,f=a.length,g,h=[];while(++e<f){g=a[e];if(g.disabled)continue;b=g.media||b,q.test(b)&&h.push(d.getCSS(g.imports,b),g.cssText),b="all"}return h.join("")},d.parseCSS=function(a){var b=[],c;while((c=k.exec(a))!=null)b.push(((j.exec(c[1])?"\n":c[1])+c[2]+c[3]).replace(h,"$1.iepp_$2")+c[4]);return b.join("\n")},d.writeHTML=function(){var a=-1;r=r||b.body;while(++a<g){var c=b.getElementsByTagName(f[a]),d=c.length,e=-1;while(++e<d)c[e].className.indexOf("iepp_")<0&&(c[e].className+=" iepp_"+f[a])}l.appendChild(r),m.appendChild(o),o.className=r.className,o.id=r.id,o.innerHTML=r.innerHTML.replace(i,"<$1font")},d._beforePrint=function(){p.styleSheet.cssText=d.parseCSS(d.getCSS(b.styleSheets,"all")),d.writeHTML()},d.restoreHTML=function(){o.innerHTML="",m.removeChild(o),m.appendChild(r)},d._afterPrint=function(){d.restoreHTML(),p.styleSheet.cssText=""},s(b),s(l);d.disablePP||(n.insertBefore(p,n.firstChild),p.media="print",p.className="iepp-printshim",a.attachEvent("onbeforeprint",d._beforePrint),a.attachEvent("onafterprint",d._afterPrint))}(a,b),e._version=d,e._prefixes=n,e._domPrefixes=o,e.hasEvent=t,e.testProp=function(a){return B([a])},e.testAllProps=C,g.className=g.className.replace(/\bno-js\b/,"")+(f?" js "+s.join(" "):"");return e}(this,this.document),function(a,b,c){function k(a){return!a||a=="loaded"||a=="complete"}function j(){var a=1,b=-1;while(p.length- ++b)if(p[b].s&&!(a=p[b].r))break;a&&g()}function i(a){var c=b.createElement("script"),d;c.src=a.s,c.onreadystatechange=c.onload=function(){!d&&k(c.readyState)&&(d=1,j(),c.onload=c.onreadystatechange=null)},m(function(){d||(d=1,j())},H.errorTimeout),a.e?c.onload():n.parentNode.insertBefore(c,n)}function h(a){var c=b.createElement("link"),d;c.href=a.s,c.rel="stylesheet",c.type="text/css";if(!a.e&&(w||r)){var e=function(a){m(function(){if(!d)try{a.sheet.cssRules.length?(d=1,j()):e(a)}catch(b){b.code==1e3||b.message=="security"||b.message=="denied"?(d=1,m(function(){j()},0)):e(a)}},0)};e(c)}else c.onload=function(){d||(d=1,m(function(){j()},0))},a.e&&c.onload();m(function(){d||(d=1,j())},H.errorTimeout),!a.e&&n.parentNode.insertBefore(c,n)}function g(){var a=p.shift();q=1,a?a.t?m(function(){a.t=="c"?h(a):i(a)},0):(a(),j()):q=0}function f(a,c,d,e,f,h){function i(){!o&&k(l.readyState)&&(r.r=o=1,!q&&j(),l.onload=l.onreadystatechange=null,m(function(){u.removeChild(l)},0))}var l=b.createElement(a),o=0,r={t:d,s:c,e:h};l.src=l.data=c,!s&&(l.style.display="none"),l.width=l.height="0",a!="object"&&(l.type=d),l.onload=l.onreadystatechange=i,a=="img"?l.onerror=i:a=="script"&&(l.onerror=function(){r.e=r.r=1,g()}),p.splice(e,0,r),u.insertBefore(l,s?null:n),m(function(){o||(u.removeChild(l),r.r=r.e=o=1,j())},H.errorTimeout)}function e(a,b,c){var d=b=="c"?z:y;q=0,b=b||"j",C(a)?f(d,a,b,this.i++,l,c):(p.splice(this.i++,0,a),p.length==1&&g());return this}function d(){var a=H;a.loader={load:e,i:0};return a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=r&&!s,u=s?l:n.parentNode,v=a.opera&&o.call(a.opera)=="[object Opera]",w="webkitAppearance"in l.style,x=w&&"async"in b.createElement("script"),y=r?"object":v||x?"img":"script",z=w?"img":y,A=Array.isArray||function(a){return o.call(a)=="[object Array]"},B=function(a){return Object(a)===a},C=function(a){return typeof a=="string"},D=function(a){return o.call(a)=="[object Function]"},E=[],F={},G,H;H=function(a){function f(a){var b=a.split("!"),c=E.length,d=b.pop(),e=b.length,f={url:d,origUrl:d,prefixes:b},g,h;for(h=0;h<e;h++)g=F[b[h]],g&&(f=g(f));for(h=0;h<c;h++)f=E[h](f);return f}function e(a,b,e,g,h){var i=f(a),j=i.autoCallback;if(!i.bypass){b&&(b=D(b)?b:b[a]||b[g]||b[a.split("/").pop().split("?")[0]]);if(i.instead)return i.instead(a,b,e,g,h);e.load(i.url,i.forceCSS||!i.forceJS&&/css$/.test(i.url)?"c":c,i.noexec),(D(b)||D(j))&&e.load(function(){d(),b&&b(i.origUrl,h,g),j&&j(i.origUrl,h,g)})}}function b(a,b){function c(a){if(C(a))e(a,h,b,0,d);else if(B(a))for(i in a)a.hasOwnProperty(i)&&e(a[i],h,b,i,d)}var d=!!a.test,f=d?a.yep:a.nope,g=a.load||a.both,h=a.callback,i;c(f),c(g),a.complete&&b.load(a.complete)}var g,h,i=this.yepnope.loader;if(C(a))e(a,0,i,0);else if(A(a))for(g=0;g<a.length;g++)h=a[g],C(h)?e(h,0,i,0):A(h)?H(h):B(h)&&b(h,i);else B(a)&&b(a,i)},H.addPrefix=function(a,b){F[a]=b},H.addFilter=function(a){E.push(a)},H.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",G=function(){b.removeEventListener("DOMContentLoaded",G,0),b.readyState="complete"},0)),a.yepnope=d()}(this,this.document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
/*!
 * selectivizr v1.0.2 - (c) Keith Clark, freely distributable under the terms of the MIT license.
 * selectivizr.com
 */

(function(j){function A(a){return a.replace(B,h).replace(C,function(a,d,b){for(var a=b.split(","),b=0,e=a.length;b<e;b++){var s=D(a[b].replace(E,h).replace(F,h))+o,l=[];a[b]=s.replace(G,function(a,b,c,d,e){if(b){if(l.length>0){var a=l,f,e=s.substring(0,e).replace(H,i);if(e==i||e.charAt(e.length-1)==o)e+="*";try{f=t(e)}catch(k){}if(f){e=0;for(c=f.length;e<c;e++){for(var d=f[e],h=d.className,j=0,m=a.length;j<m;j++){var g=a[j];if(!RegExp("(^|\\s)"+g.className+"(\\s|$)").test(d.className)&&g.b&&(g.b===!0||g.b(d)===!0))h=u(h,g.className,!0)}d.className=h}}l=[]}return b}else{if(b=c?I(c):!v||v.test(d)?{className:w(d),b:!0}:null)return l.push(b),"."+b.className;return a}})}return d+a.join(",")})}function I(a){var c=!0,d=w(a.slice(1)),b=a.substring(0,5)==":not(",e,f;b&&(a=a.slice(5,-1));var l=a.indexOf("(");l>-1&&(a=a.substring(0,l));if(a.charAt(0)==":")switch(a.slice(1)){case "root":c=function(a){return b?a!=p:a==p};break;case "target":if(m==8){c=function(a){function c(){var d=location.hash,e=d.slice(1);return b?d==i||a.id!=e:d!=i&&a.id==e}k(j,"hashchange",function(){g(a,d,c())});return c()};break}return!1;case "checked":c=function(a){J.test(a.type)&&k(a,"propertychange",function(){event.propertyName=="checked"&&g(a,d,a.checked!==b)});return a.checked!==b};break;case "disabled":b=!b;case "enabled":c=function(c){if(K.test(c.tagName))return k(c,"propertychange",function(){event.propertyName=="$disabled"&&g(c,d,c.a===b)}),q.push(c),c.a=c.disabled,c.disabled===b;return a==":enabled"?b:!b};break;case "focus":e="focus",f="blur";case "hover":e||(e="mouseenter",f="mouseleave");c=function(a){k(a,b?f:e,function(){g(a,d,!0)});k(a,b?e:f,function(){g(a,d,!1)});return b};break;default:if(!L.test(a))return!1}return{className:d,b:c}}function w(a){return M+"-"+(m==6&&N?O++:a.replace(P,function(a){return a.charCodeAt(0)}))}function D(a){return a.replace(x,h).replace(Q,o)}function g(a,c,d){var b=a.className,c=u(b,c,d);if(c!=b)a.className=c,a.parentNode.className+=i}function u(a,c,d){var b=RegExp("(^|\\s)"+c+"(\\s|$)"),e=b.test(a);return d?e?a:a+o+c:e?a.replace(b,h).replace(x,h):a}function k(a,c,d){a.attachEvent("on"+c,d)}function r(a,c){if(/^https?:\/\//i.test(a))return c.substring(0,c.indexOf("/",8))==a.substring(0,a.indexOf("/",8))?a:null;if(a.charAt(0)=="/")return c.substring(0,c.indexOf("/",8))+a;var d=c.split(/[?#]/)[0];a.charAt(0)!="?"&&d.charAt(d.length-1)!="/"&&(d=d.substring(0,d.lastIndexOf("/")+1));return d+a}function y(a){if(a)return n.open("GET",a,!1),n.send(),(n.status==200?n.responseText:i).replace(R,i).replace(S,function(c,d,b,e,f){return y(r(b||f,a))}).replace(T,function(c,d,b){d=d||i;return" url("+d+r(b,a)+d+") "});return i}function U(){var a,c;a=f.getElementsByTagName("BASE");for(var d=a.length>0?a[0].href:f.location.href,b=0;b<f.styleSheets.length;b++)if(c=f.styleSheets[b],c.href!=i&&(a=r(c.href,d)))c.cssText=A(y(a));q.length>0&&setInterval(function(){for(var a=0,c=q.length;a<c;a++){var b=q[a];if(b.disabled!==b.a)b.disabled?(b.disabled=!1,b.a=!0,b.disabled=!0):b.a=b.disabled}},250)}if(!/*@cc_on!@*/true){var f=document,p=f.documentElement,n=function(){if(j.XMLHttpRequest)return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(a){return null}}(),m=/MSIE (\d+)/.exec(navigator.userAgent)[1];if(!(f.compatMode!="CSS1Compat"||m<6||m>8||!n)){var z={NW:"*.Dom.select",MooTools:"$$",DOMAssistant:"*.$",Prototype:"$$",YAHOO:"*.util.Selector.query",Sizzle:"*",jQuery:"*",dojo:"*.query"},t,q=[],O=0,N=!0,M="slvzr",R=/(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)\s*/g,S=/@import\s*(?:(?:(?:url\(\s*(['"]?)(.*)\1)\s*\))|(?:(['"])(.*)\3))[^;]*;/g,T=/\burl\(\s*(["']?)(?!data:)([^"')]+)\1\s*\)/g,L=/^:(empty|(first|last|only|nth(-last)?)-(child|of-type))$/,B=/:(:first-(?:line|letter))/g,C=/(^|})\s*([^\{]*?[\[:][^{]+)/g,G=/([ +~>])|(:[a-z-]+(?:\(.*?\)+)?)|(\[.*?\])/g,H=/(:not\()?:(hover|enabled|disabled|focus|checked|target|active|visited|first-line|first-letter)\)?/g,P=/[^\w-]/g,K=/^(INPUT|SELECT|TEXTAREA|BUTTON)$/,J=/^(checkbox|radio)$/,v=m>6?/[\$\^*]=(['"])\1/:null,E=/([(\[+~])\s+/g,F=/\s+([)\]+~])/g,Q=/\s+/g,x=/^\s*((?:[\S\s]*\S)?)\s*$/,i="",o=" ",h="$1";(function(a,c){function d(){try{p.doScroll("left")}catch(a){setTimeout(d,50);return}b("poll")}function b(d){if(!(d.type=="readystatechange"&&f.readyState!="complete")&&((d.type=="load"?a:f).detachEvent("on"+d.type,b,!1),!e&&(e=!0)))c.call(a,d.type||d)}var e=!1,g=!0;if(f.readyState=="complete")c.call(a,i);else{if(f.createEventObject&&p.doScroll){try{g=!a.frameElement}catch(h){}g&&d()}k(f,"readystatechange",b);k(a,"load",b)}})(j,function(){for(var a in z){var c,d,b=j;if(j[a]){for(c=z[a].replace("*",a).split(".");(d=c.shift())&&(b=b[d]););if(typeof b=="function"){t=b;U();break}}}})}}})(this);
/**
 * Lists generic controls
 */


(function($)
{
	// List styles setup
	$.fn.addTemplateSetup(function()
	{
		// Closed elements
		this.find('.close').toggleBranchOpen().removeClass('close');
		
		// :first-of-type is buggy with jQuery under IE
		this.find('dl.accordion dt:first-child + dd').siblings('dd').hide();
		
		// Tasks dialog
		if (!$.browser.msie || $.browser.version > 8)	// IE is buggy on this animation
		{
			this.find('.task-dialog').parent().hover(function()
			{
				$(this).find('.task-dialog > li.auto-hide').expand();
				
			}, function()
			{
				$(this).find('.task-dialog > li.auto-hide').fold();
			});
		}
		
		// Arbo elements controls
		this.find('.arbo .toggle, .collapsible-list li:has(ul) > :first-child, .collapsible-list li:has(ul) > :first-child + span').click(function(event)
		{
			// Toggle style
			$(this).toggleBranchOpen();
			
			// Prevent link action
			if (this.nodeName.toLowerCase() == 'a')
			{
				event.preventDefault();
			}
		});
		
		// Accordions effect
		this.find('dl.accordion dt').click(function()
		{
			$(this).next('dd').slideDown().siblings('dd').slideUp().prev('dt');
			
			// Effect need for rounded corners
			$(this).addClass('opened').siblings('dt').removeClass('opened');
		});
		
	}, true);
	
	/**
	 * Open/close branch
	 */
	$.fn.toggleBranchOpen = function()
	{
		this.each(function()
		{
			/*
			 * Tip: if you want to add animation or do anything that should not occur at startup closing, 
			 * check if the element has the class 'close':
			 * if (!$(this).hasClass('close')) { // Anything that sould no occur at startup }
			 */
			 
			// Change
			$(this).closest('li').toggleClass('closed');
		});
		
		return this;
	};
	
})(jQuery);
/**
 * Template JS for mobile pages
 */


(function($)
{
	$(document).ready(function()
	{
		// Menu
		var menu = $('#menu > ul'),
			menuHeight = menu.height(),
			currentMenu = menu;
		
		// Open
		$('#menu > a').click(function(event)
		{
			event.preventDefault();
			
			var parent = $(this).parent();
			if (parent.hasClass('active'))
			{
				menu.css({
					display: '',
					height: menuHeight
				});
			}
			parent.toggleClass('active');
		});
		
		// Menus with sub-menus
		$('#menu ul li:has(ul)').addClass('with-subs').children('a').click(function(event)
		{
			// Stop link
			event.preventDefault();
			
			// Show sub-menu
			var li = $(this).parent();
			li.addClass('active').siblings().removeClass('active');
			
			// Scroll
			currentMenu = li.children('ul:first');
			menu.animate({
				scrollLeft:	currentMenu.offset().left+menu.scrollLeft(),
				height:		currentMenu.height()
			});
		})
		.siblings('ul').prepend('<li class="back"><a href="#">Back</a></li>')
		.find('li.back > a').click(function(event)
		{
			// Stop link
			event.preventDefault();
			
			// Prepare
			var li = $(this).parent().parent().parent();
			currentMenu = li.parent();
			var isRoot = (currentMenu.parent().attr('id') == 'menu'),
				scrollVal = isRoot ? currentMenu.offset().left : currentMenu.offset().left+menu.scrollLeft(),
				newHeight = isRoot ? menuHeight : currentMenu.height();
			
			// Animate
			menu.animate({
				scrollLeft:	scrollVal,
				height:		newHeight
			}, {
				complete: function()
				{
					// Close sub-menu
					li.removeClass('active');
				}
			});
		});
		
		// Watch for screen orientation change
		$(window).bind('orientationchange resize', function()
		{
			// Prepare
			var isRoot = (currentMenu.parent().attr('id') == 'menu'),
				scrollVal = isRoot ? currentMenu.offset().left : currentMenu.offset().left+menu.scrollLeft();
			
			menu.scrollLeft(scrollVal);
		});
	});

})(jQuery);
/**
 * Older browsers detection
 */

 
(function($)
{
	// Change these values to fit your needs
	if (
		($.browser.msie && parseFloat($.browser.version) < 7) ||			// IE 6 and lower
		($.browser.mozilla && parseFloat($.browser.version) < 1.9) ||		// Firefox 2 and lower
		($.browser.opera && parseFloat($.browser.version) < 9) ||			// Opera 8 and lower
		($.browser.webkit && parseInt($.browser.version) < 400)				// Older Chrome and Safari
	) {
		// If no cookie has been set
		if (getCookie('forceAccess') !== 'yes')
		{
			// If coming back from the old browsers page
			if (window.location.search.indexOf('forceAccess=yes') > -1)
			{
				// Mark for future tests
				setCookie('forceAccess', 'yes');
			}
			else
			{
				document.location.href = 'old-browsers.html?redirect='+escape(document.location.href);
			}
		}
	}
	
	/**
	 * Get cookie params
	 * @return object an object with every params in the cookie
	 */
	function getCookieParams()
	{
		var parts = document.cookie.split(/; */g);
		var params = {};
		
		for (var i = 0; i < parts.length; ++i)
		{
			var part = parts[i];
			if (part)
			{
				var equal = part.indexOf('=');
				if (equal > -1)
				{
					var param = part.substr(0, equal);
					var value = unescape(part.substring(equal+1));
					params[param] = value;
				}
			}
		}
		
		return params;
	}
	
	/**
	 * Get a cookie value
	 * @param string name the cookie name
	 * @return string the value, or null if not defined
	 */
	function getCookie(name)
	{
		var params = getCookieParams();
		return params[name] || null;
	}
	
	/**
	 * Write a cookie value
	 * @param string name the cookie name
	 * @param string value the value
	 * @param int days number of days for cookie life
	 * @return void
	 */
	function setCookie(name, value, days)
	{
		var params = getCookieParams();
		
		params[name] = value;
		
		if (days)
		{
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			params.expires = date.toGMTString();
		}
		
		var cookie = [];
		for (var thevar in params)
		{
			cookie.push(thevar+'='+escape(params[thevar]));
		}
		document.cookie = cookie.join('; ');
	}
	
})(jQuery);
/**
 * Template plugin for searchField
 */


(function($)
{
	/**
	 * Timeout for ajax requests
	 * @var int
	 */
	var ajaxTimeout;
	
	/**
	 * Timeout for search block close
	 * @var int
	 */
	var closeTimeout;
	
	/**
	 * Last request timer
	 * @var int
	 */
	var lastRequest;
	
	/**
	 * Setup the search field
	 * @param object options an object with any of the options defined below in the function's defaults
	 */
	$.fn.advancedSearchField = function(options)
	{
		var settings = $.extend({}, $.fn.advancedSearchField.defaults, options);
		
		// Setup
		this.before('<input type="hidden" name="search-last" id="search-last" value="">').focus(function() {
			
			// Stop closing
			if (closeTimeout)
			{
				clearTimeout(closeTimeout);
			}
			
			// Add event listener
			$(this).bind('keyup', updateSearch);
			updateSearch();
			
		}).blur(function() {
			
			// Remove event listener
			$(this).unbind('keyup', updateSearch);
			
			// Timeout for result hiding - needed for search block interactions
			closeTimeout = setTimeout(closeSearch, 500);
			
		}).after('<div id="search-result" class="result-block"><span class="arrow"><span></span></span><div id="server-search">'+settings.messageLoading+'</div><p id="search-info" class="result-info">-</p></div>').next().hide();
		
		/**
		 * Hide search result block
		 * @return void
		 */
		function closeSearch()
		{
			// Hide elements
			$('#s').hideTip();
			$('#search-result').fadeOut();
		};
		
		/**
		 * Update the search field results block
		 * @return void
		 */
		function updateSearch()
		{
			// Elements
			var result = $('#search-result');
			
			// Current search
			var s = $.trim($('#s').val());
			
			// Parsing
			if (s.length == 0)
			{
				// Tip
				$('#s').showTip({
					content: settings.tipFocus
				});
				
				result.fadeOut();
			}
			else if (s.length < settings.minSearchLength)
			{
				// Tip
				$('#s').showTip({
					content: settings.tipTooShort
				});
				
				result.fadeOut();
			}
			else
			{
				var last = $('#search-last');
				var lastS = last.val();
				var info = $('#search-info');
				
				// Hide tip
				$('#s').hideTip();
				
				// Show search results block
				result.fadeIn();
				
				// Detect changes
				if (lastS != s)
				{
					// Store search
					$('#search-last').val(s);
					
					// Stop previous request timeout
					if (ajaxTimeout)
					{
						clearTimeout(ajaxTimeout);
					}
					
					// Empty block
					result.children().not('.arrow, #server-search, #search-info').remove();
					
					// If search within nav
					if (settings.enableNavSearch)
					{
						result.children('.arrow:first').after('<h2>'+settings.titleTemplateResult+'</h2>'+searchInNav(s)+'<hr>');
						
						// If hiding too long matches list
						if ($.fn.accessibleList && (settings.moreButtonAfter > 0 || settings.matchesPerPage > 0))
						{
							result.children('ul:first').accessibleList({
								'moreAfter': settings.moreButtonAfter,
								'pageSize': settings.matchesPerPage,
								'after': function()
								{
									// Restore focus
									$('#s').focus();
								}
							});
						}
					}
					
					// Message
					$('#search-info').addClass('loading').text(settings.messageLoading);
					
					// Ajax call
					var date = new Date();
					if (!lastRequest || lastRequest < date.getTime()-noUpdateDelay)
					{
						var delay = settings.firstRequestDelay;
					}
					else
					{
						var delay = settings.nextRequestDelay;
					}
					ajaxTimeout = setTimeout(sendRequest, delay);
				}
			}	
		};
		
		/**
		 * Search within the main nav
		 * @param string s the search string
		 * @return void
		 */
		function searchInNav(s)
		{
			// Split keywords
			var keywords = s.toLowerCase().split(/\s+/);
			var nbKeywords = keywords.length;
			
			// Search links
			var links = $('nav a');
			var matches = [];
			links.each(function(i)
			{
				var text = $(this).text().toLowerCase();
				var textMatch = true;
				for (var i = 0; i < nbKeywords; ++i)
				{
					if (text.indexOf(keywords[i]) == -1)
					{
						textMatch = false;
						break;
					}
				}
				
				if (textMatch)
				{
					// All keywords found
					matches.push(this);
				}
			});
			
			// Build results list
			var nbMatches = matches.length;
			if (nbMatches > 0)
			{
				var output = '<p class="results-count"><strong>'+nbMatches+'</strong> match'+((nbMatches > 1) ? 'es' : '')+'</p>';
				output += '<ul class="small-files-list icon-html">';
				
				for (var m = 0; m < nbMatches; ++m)
				{
					// Text with highlighted keywords
					var link = $(matches[m]);
					var text = link.text();
					var path = [text];
					for (var i = 0; i < nbKeywords; ++i)
					{
						text = text.replace(new RegExp('('+keywords[i]+')', 'gi'), '<strong>$1</strong>');
					}
					
					// Path
					var parent = link;
					while ((parent = parent.parent().parent().prev('a')) && parent.length > 0)
					{
						path.push(parent.text());
					}
					
					output += '<li><a href="'+matches[m].href+'">'+text+'<br><small>'+path.reverse().join(' > ')+'</small></a></li>';
				}
				
				return output+'</ul>';
			}
			else
			{
				return '<p class="results-count">'+settings.messageNoMatches+'</p>';
			}
		};
		
		/**
		 * Send search request to server
		 */
		function sendRequest()
		{
			// Search url
			var url = $('#s').parents('form:first').attr('action');
			if (!url || url == '')
			{
				// Page url without hash
				url = document.location.href.match(/^([^#]+)/)[1];
			}
			
			var date = new Date();
			var timer = date.getTime();
			$('#server-search').load(url, {
				's': $('#search-last').val(),
				'timer': timer
			}, function(responseText, textStatus, XMLHttpRequest)
			{
				if (textStatus == 'success' || textStatus == 'notmodified')
				{
					$('#search-info').removeClass('loading').html(settings.messageSearchDone);
				}
				else
				{
					$('#server-search').html('<p class="error-message">'+settings.messageErrorFull+'</p>');
					$('#search-info').removeClass('loading').html(settings.messageError);
				}
			});
		};
		
		return this;
	};
	
	// Function's default configuration
	$.fn.advancedSearchField.defaults = {
		/**
		 * Minimum search string length
		 * @var int
		 */
		minSearchLength: 2,
		
		/**
		 * Max number of visible matches in each list above 'more' button (0 for no masking)
		 * @var int
		 */
		moreButtonAfter: 3,
		
		/**
		 * Number of visible matches per page (0 for no pagination)
		 * @var int
		 */
		matchesPerPage: 5,
		
		/**
		 * Delay before first request in ms (avoid multiple request while user types)
		 * @var int
		 */
		firstRequestDelay: 250,
		
		/**
		 * Minimum delay between search requests in ms (reduces server load)
		 * @var int
		 */
		nextRequestDelay: 750,
		
		/**
		 * Minimum delay upon which the plugin considers the user has stopped typing long enough 
		 * to start the next request with firstRequestDelay delay, thus responding faster
		 * @var int
		 */
		noUpdateDelay: 3000,
		
		/**
		 * Enable search within navigation
		 * @var boolean
		 */
		enableNavSearch: true,
		
		/**
		 * Message when user focuses the search field
		 * @var string
		 */
		tipFocus: 'Enter your search',
		
		/**
		 * Message is search is too short
		 * @var string
		 */
		tipTooShort: 'Enter at least 2 chars',
		
		/**
		 * Message while loading
		 * @var string
		 */
		messageLoading: 'Loading results...',
		
		/**
		 * Message when no matches found
		 * @var string
		 */
		messageNoMatches: 'No matches',
		
		/**
		 * Message when the search request is done
		 * @var string
		 */
		messageSearchDone: 'Not found? <a href="#">Try advanced search &raquo;</a>',
		
		/**
		 * Full message if an error occurs while loading results
		 * @var string
		 */
		messageErrorFull: 'Error while loading results, please try again',
		
		/**
		 * Status message if an error occurs while loading results
		 * @var string
		 */
		messageError: 'Error while loading',
		
		/**
		 * Title of the result section showing template nav items
		 * @var string
		 */
		titleTemplateResult: 'Admin pages'
	};

})(jQuery);
/**
 * Template JS for Internet Explorer 8 and lower - mainly workaround for missing selectors
 */


(function($)
{
	// Standard template setup for IE
	$.fn.addTemplateSetup(function()
	{
		// Clean existing classes
		this.find('.first-child').removeClass('first-child');
		this.find('.last-child').removeClass('last-child');
		this.find('.last-of-type').removeClass('last-of-type');
		this.find('.even').removeClass('even');
		this.find('.odd').removeClass('odd');
		
		// Missing selectors
		this.find(':first-child').addClass('first-child');
		this.find(':last-child').addClass('last-child');
		
		// Specific classes
		this.find('.head').each(function () { $(this).children('div:last').addClass('last-of-type'); });
		this.find('tbody tr:even, .task-dialog > li:even, .planning > li.planning-header > ul > li:even').addClass('even');
		this.find('tbody tr:odd, .planning > li:odd').addClass('odd');
		this.find('.form fieldset:has(legend)').addClass('fieldset-with-legend').filter(':first-child').addClass('fieldset-with-legend-first-child');
		
		// Disabled buttons
		this.find('button:disabled').addClass('disabled');
		
		// IE 7
		if ($.browser.version < 8)
		{
			// Clean existing classes
			this.find('.after-h1').removeClass('after-h1');
			
			this.find('.block-content h1:first-child, .block-content .h1:first-child').next().addClass('after-h1');
			this.find('.calendar .add-event').prepend('<span class="before"></span>');
		}
		
		// Input switches
		this.find('input[type=radio].switch:checked + .switch-replace, input[type=checkbox].switch:checked + .switch-replace').addClass('switch-replace-checked');
		this.find('input[type=radio].switch:disabled + .switch-replace, input[type=checkbox].switch:disabled + .switch-replace').addClass('switch-replace-disabled');
		this.find('input[type=radio].mini-switch:checked + .mini-switch-replace, input[type=checkbox].mini-switch:checked + .mini-switch-replace').addClass('mini-switch-replace-checked');
		this.find('input[type=radio].mini-switch:disabled + .mini-switch-replace, input[type=checkbox].mini-switch:disabled + .mini-switch-replace').addClass('mini-switch-replace-disabled');
	});
	
	// Document initial setup
	$(document).ready(function()
	{
		// Input switches
		$('input[type=radio].switch, input[type=checkbox].switch').click(function() {
			
			if (!this.checked)
			{
				$(this).next('.switch-replace').addClass('switch-replace-checked');
			}
			else
			{
				$(this).next('.switch-replace').removeClass('switch-replace-checked');
			}
		});
		$('input[type=radio].mini-switch, input[type=checkbox].mini-switch').click(function() {
			
			if (!this.checked)
			{
				$(this).next('.mini-switch-replace').addClass('mini-switch-replace-checked');
			}
			else
			{
				$(this).next('.mini-switch-replace').removeClass('mini-switch-replace-checked');
			}
		});
		
	});

})(jQuery);
/**
 * Template JS for standard pages
 */


(function($)
{
	// Standard template setup
	$.fn.addTemplateSetup(function()
	{
		// Mini menu
		this.find('.mini-menu').css({opacity:0}).parent().hover(function()
		{
			$(this).children('.mini-menu').stop(true).animate({opacity:1});
			
		}, function()
		{
			$(this).children('.mini-menu').css('display', 'block').stop(true).animate({opacity:0}, {'complete': function() { $(this).css('display', ''); }});
			
		});
		
		// CSS Menu improvement
		this.find('.menu, .menu li:has(ul)').hover(function()
		{
			$(this).openDropDownMenu();
			
		}, function()
		{
			// Remove in case of future window resizing
			$(this).children('ul').not('.keep-reverted').removeClass('reverted');
			
		}).children('ul.reverted').addClass('keep-reverted');	// Handle forced reverted menus
		
		// Scroll top button
		$('a[href="#top"]').click(function(event)
		{
			event.preventDefault();
			$('html, body').animate({scrollTop:0});
		});
	});
	
	// Close buttons
	$('.close-bt').live('click', function()
	{
		$(this).parent().fadeAndRemove();
	});
	
	// Document initial setup
	$(document).ready(function()
	{
		// Notifications blocks
		var notifications = $('<ul id="notifications"></ul>').appendTo(document.body);
		var notificationsTop = parseInt(notifications.css('top'));
		
		// If it is a standard page
		if (!$(document.body).hasClass('special-page'))
		{
			// Main nav - click style
			$('nav > ul > li').click(function(event) {
				// If not already active and has sub-menu
				if (!$(this).hasClass('current') && $(this).find('ul li').length > 0)
				{
					$(this).addClass('current').siblings().removeClass('current');
					$('nav > ul > li').refreshTip();
					event.preventDefault();
				}
			}).tip({
				stickIfCurrent: true,
				offset: -3
			});
			
			// Main nav - hover style
			/*$('nav > ul > li').hover(function() {
				$(this).addClass('current').siblings().removeClass('current');
				$('nav > ul > li').refreshTip();
			}, function() {}).tip({
				stickIfCurrent: true,
				offset: -3
			});*/
			
			// Advanced search field
			if ($.fn.advancedSearchField)
			{
				$('#s').advancedSearchField();
			}
			
			// Status bar buttons : drop-downs fade In/Out
			function convertDropLists()
			{
				$(this).find('.result-block .small-files-list').accessibleList({moreAfter:false});
				
				// Run only once
				$(this).unbind('mouseenter', convertDropLists);
			}
			$('#status-infos li:has(.result-block)').hover(function()
			{
				$(this).find('.result-block').stop(true).css('display', 'none').fadeIn('normal', function()
				{
					$(this).css('opacity', '');	
				});
				
			}, function()
			{
				$(this).find('.result-block').stop(true).css('display', 'block').fadeOut('normal', function()
				{
					$(this).css('opacity', '');	
				});
				
			}).bind('mouseenter', convertDropLists);
			
			// Fixed control bar
			var controlBar = $('#control-bar');
			if (controlBar.length > 0)
			{
				var cbPlaceHolder = controlBar.after('<div id="cb-place-holder" style="height:'+controlBar.outerHeight()+'px"></div>').next();
				
				// Effect
				controlBar.hover(function()
				{
					if ($(this).hasClass('fixed'))
					{
						$(this).stop(true).fadeTo('fast', 1);
					}
					
				}, function()
				{
					if ($(this).hasClass('fixed'))
					{
						$(this).stop(true).fadeTo('slow', 0.5);
					}
				});
				
				// Listener
				$(window).scroll(function()
				{
					// Check top position
					var controlBarPos = controlBar.hasClass('fixed') ? cbPlaceHolder.offset().top : controlBar.offset().top;
					
					if ($(window).scrollTop() > controlBarPos)
					{
						if (!controlBar.hasClass('fixed'))
						{
							cbPlaceHolder.height(controlBar.outerHeight()).show();
							controlBar.addClass('fixed').stop(true).fadeTo('slow', 0.5);
							
							// Notifications
							$('#notifications').animate({'top': controlBar.outerHeight()+notificationsTop});
						}
					}
					else
					{
						if (controlBar.hasClass('fixed'))
						{
							cbPlaceHolder.hide();
							controlBar.removeClass('fixed').stop(true).fadeTo('fast', 1, function()
							{
								// Required for IE
								$(this).css('filter', '');
							});
							
							// Notifications
							$('#notifications').animate({'top': notificationsTop});
						}
					}
				}).trigger('scroll');
			}
		}
		
	});
	
	/**
	 * Internal function to open drop-down menus, required for context menu
	 */
	$.fn.openDropDownMenu = function()
	{
		var ul = this.children('ul');
		
		// Position check
		if (ul.offset().left+ul.outerWidth()-$(window).scrollLeft() > $(window).width())
		{
			ul.addClass('reverted');
		}
		
		// Effect - IE < 9 uses filter for opacity, cutting out sub-menus
		if (!$.browser.msie || $.browser.version > 8)
		{
			ul.stop(true).css({opacity:0}).animate({opacity:1});
		}
	};
	
})(jQuery);


/**
 * Display a notification. If the page is not yet ready, delay the notification until it is ready.
 * @var string message a text or html message to display
 * @var object options an object with any options for the message - optional
 * 		- closeButton: true to add a close button to the message (default: true)
 * 		- autoClose: true to close message after (closeDelay) ms (default: true)
 * 		- closeDelay: delay before message close (default: 8000)
 */
var notify = function(message, options)
{
	var block = jQuery('#notifications');
	
	// If ready
	if (block.length > 0)
	{
		var settings = jQuery.extend({}, notify.defaults, options);
		
		// Append message
		var closeButton = settings.closeButton ? '<span class="close-bt"></span>' : '';
		var element = jQuery('#notifications').append('<li>'+message+closeButton+'</li>').children(':last-child');
		
		// Effect
		element.expand();
		
		// If closing
		if (settings.autoClose)
		{
			// Timer
			var timeoutId = setTimeout(function() { element.fadeAndRemove(); }, settings.closeDelay);
			
			// Prevent closing when hover
			element.hover(function()
			{
				clearTimeout(timeoutId);
				
			}, function()
			{
				timeoutId = setTimeout(function() { element.fadeAndRemove(); }, settings.closeDelay);
			});
		}
	}
	else
	{
		// Not ready, delay action
		setTimeout(function() { notify(message, options); }, 40);
	}
};

// Defaults values for the notify method
notify.defaults = {
	closeButton: true,			// Add a close button to the message
	autoClose: true,			// Message will close after (closeDelay) ms
	closeDelay: 8000			// Delay before message closes
};
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//

;
