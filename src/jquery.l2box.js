/**
 * jquery.l2box.js
 *
 * lightweight lightbox plugin for Smartphone
 */
;(function ( $, window, undefined ) {
    
    var pluginName = 'l2box',
		prefix     = pluginName,
        document   = window.document,
        defaults   = {
			enableClipView: true, // コンテナの高さにコンテンツをクリップする
			closeOnClickShadow: true,
			closeOnClickButton: true,
			target: '',
			params: {},
			type  : 'get',
			shadowCss : {
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: '100%',
				background: 'rgba(0,0,0,0.5)',
				zIndex: 10000
			},
			btnCloseCss : {
				position: 'absolute',
				top: '0px',
				right: '0px',
				width: '40px',
				height: '40px',
				fontSize: '26px',
				textAlign: 'center',
				lineHeight: '40px',
				zIndex: 10001
			},
			containerCss : {
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: '94%',
				margin: '10px 0px 0px 3%',
				padding: '10px',
				minHeight: '100px',
				background: 'rgba(255,255,255,1)',
				borderRadius: '2px',
				boxShadow: '1px 0px 10px rgba(0,0,0,0.5)',
				'-webkit-box-sizing': 'border-box',
				'-moz-box-sizing': 'border-box',
				zIndex: 10001
			},
			loadingCss : {
				padding: '40px 0px 30px',
				textAlign: 'center'
			},
			duration: 200
        };

    function Plugin( element, options ) {
        this.element = element;
        this.settings = $.extend(true, {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;

		this.$contents = null;
		this.reqUrl = '';
        
        this.init();
    }

	var $shadow, $container, $contentsFrame, $btnClose, anchorPos = [];
			
    Plugin.prototype.init = function () {
		var self = this;

		$shadow = $('.'+prefix+'-shadow');
		if ($shadow.length === 0) {
			$shadow = $('<div>')
					.addClass(''+prefix+'-shadow')
					.css(self.settings.shadowCss)
					.hide()
					.appendTo($('body').css({ position: 'relative'}));

			if (self.settings.closeOnClickShadow) {
				$shadow.bind('click', function (e) {
					self.hide();
				});
			}
		}

		$container = $('.'+prefix+'-container');
		if ($container.length === 0) {
			$container = $('<div>')
					.addClass(''+prefix+'-container')
					.css(this.settings.containerCss)
					.hide()
					.appendTo($('body').css({ position: 'relative'}));

			$contentsFrame = $('<div>')
					.addClass(''+prefix+'-contents_frame')
					.appendTo($container);

			$loading = $('<div>')
					.css(this.settings.loadingCss)
					.html('Loading...')
					.addClass(''+prefix+'-loading');
		}

		$btnClose = $('.'+prefix+'-btn_close');
		if ($btnClose.length === 0) {
			if (self.settings.closeOnClickButton) {
				$btnClose = $('<div>')
					.addClass(''+prefix+'-btn_close')
					.css(self.settings.btnCloseCss)
					.append(
						$('<span>').html('+').css({
							display: 'inline-block',
							'-webkit-transform': 'rotate(45deg)',
							'-moz-transform': 'rotate(45deg)'
						})
					)
					.appendTo($container)
					.bind('click', function (e) {
						self.hide();
					});
			}
		}
		
		if (this.settings.target) {
			this.$contents = $(this.settings.target);
		} else {
			var _href = $(this.element).attr('href'),
				_dataHref = $(this.element).attr('data-'+pluginName+'-href');

			if (_dataHref) {
				// data-hrefを優先
				_href = _dataHref;
			}

			if (_href) {
				if (_href.match(/^#/)) {
					this.$contents = $(_href);
				} else { 
					this.reqUrl = $(this.element).attr('href');
				}
			}
		}

		$(this.element)
			.bind('click' , function (e) {
				e.preventDefault();
				self.show();
			});
	};

	// public mehtod
	Plugin.prototype.updateView = function () {
		$('body').css({
			maxHeight: Math.max(parseInt($container.height()) + parseInt($container.css('marginTop')) * 4, parseInt($(window).height())),
			overflowY: 'hidden'
		});
	};

	Plugin.prototype.show = function () {
		var self = this;
		if (!anchorPos.length) {
			anchorPos.push($(window).scrollTop());
		}

		if (this.$contents && this.$contents.length) {
			$shadow
				.height($('body').height())
				.fadeIn(this.settings.duration);

			$contentsFrame.empty().append(this.$contents.show());
			$container.fadeIn(this.settings.duration);
			enableClipView(this.settings);

		} else if (this.reqUrl) {
			$shadow
				.height($('body').height())
				.fadeIn(this.settings.duration);

			$container.fadeIn(this.settings.duration);
			$contentsFrame.empty().append($loading);
			enableClipView(this.settings);

			$.when($.ajax({
					url  : this.reqUrl,
					type : this.settings.type,
					data : this.settings.params
				}))
				.done(function (data) {
					self.$contents = $('<div>').html(data).find('img').load(function (e) {
						self.updateContainerSize();
					}).end();
					self.show();
				})
				.fail(function (data) {
					alert('データを取得できませんでした');
					self.hide();
				});
		}
	};

	Plugin.prototype.hide = function () {
		$container.hide();
		$shadow.hide();
		disableClipView(this.settings);
		window.scrollTo(0, anchorPos[0] || 0);
		anchorPos = [];
	};

	Plugin.prototype.updateContainerSize = function () {
		$shadow.height($('body').height());
		enableClipView(this.settings);
	};

	// private mehtod
	function enableClipView (options) {
		if (options.enableClipView) {
			$('body').css({
				height: Math.max(parseInt($container.height()) + parseInt($container.css('marginTop')) * 4, parseInt($(window).height())),
				overflowY: 'hidden'
			});
			$shadow.css({
				height: Math.max(parseInt($container.height()) + parseInt($container.css('marginTop')) * 4, parseInt($(window).height())),
			});
			window.scrollTo(0,1);
		}
	}
	function disableClipView (options) {
		if (options.enableClipView) {
			$('body').removeAttr('style');
		}
	}

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

}(jQuery, window));
