/* TODO
 *
 * - Horiz. support
 * - Always inside the container
 * - Option for hooks
 * - Handle resize
 * - API to refresh (e.g. when uncollapse a menu)
 * - Clean up the code
 *
*/
(function($) {

$.fn.smartflow = function(uopts) {
"use strict";

var
	dopts = {},
	opts = $.extend(dopts, uopts),

	$w = $(window),	// the window
	elems = [],	// elements stack
	style = {},	// current style
	hooks = null,	// current hooks
	info,		// current infos
	route,		// current route
	diff,		// scroll diff
	t1, t2,		// temp variables

	// routes
	UP = 1,
	DOWN = 2,
	LEFT = 3,
	RIGHT = 4,

	getinfo = function(e) {
		t1 = $w.scrollTop();
		t2 = $w.data('scrollTop');
		diff = t1 > t2 ? t1 - t2 : t2 - t1;

		if(t1 != t2) {
			route = t1 > t2 ? DOWN : UP;
		}
		else {
			t1 = $w.scrollLeft();
			t2 = $w.data('scrollLeft');
			route = t1 > t2 ? RIGHT : LEFT;
		}

		return {
			wx: $w.scrollLeft(),
			wy: $w.scrollTop(),
			ww: $w.width(),
			wh: $w.height(),
			ex: $(e).offset().left,
			ey: $(e).offset().top,
			ew: $(e).outerWidth(true),
			eh: $(e).outerHeight(true),
			route: route,
			diff: diff
		};
	},

	update = function() {
		$w.data('scrollTop', $w.scrollTop());
		$w.data('scrollLeft', $w.scrollLeft());
	},

	isintoview = function(r) {
		if(!r)
			r = info.route;
		switch(r) {
			case UP:
				t1 = info.wy + info.wh; // wbot
				return (info.ey >= info.wy && info.ey <= t1);

			case DOWN:
				t1 = info.ey + info.eh; // ebot
				t2 = info.wy + info.wh; // wbot
				return (t1 >= info.wy && t1 <= t2);

			case LEFT:
				t1 = info.ex + info.ew; // eright
				t2 = info.wx + info.ww; // wright
				return (info.ex >= info.wx && t1 <= t2);

			case RIGHT:
				t1 = info.ex + info.ew; // eright
				t2 = info.wx + info.ww; // wright
				return (info.ex >= info.wx && t1 <= t2);
		}
	},

	isintohook = function(e) {
		hooks = $(e).data('hooks');

		switch(info.route) {
			case UP: return (info.ey < hooks.top);
			case DOWN:
				t1 = info.ey + info.eh; // ebot
				return (hooks.bot < t1);
		}

		return false;
	},

	isvisible = function() {
		t1 = info.ey + info.eh; // ebot
		t2 = info.wy + info.wh; // wbot

		return (t1 >= info.wy && info.ey <= t2);
	},

	flow = function(e) {
		switch(info.route) {
			case UP: style.top += diff; break;
			case DOWN: style.top -= diff; break;
		}

		$(e).css({top:style.top+'px'});
	},

	hook = function(e) {
		switch(info.route) {
			case UP: style.top = 0; break;
			case DOWN: style.top = info.wh - info.eh; break;
		}

		$(e).css({top:style.top+'px'});
	},

	repos = function(e) {
		hooks = $(e).data('hooks');

		switch(info.route) {
			case UP:
				style.top = hooks.top;
				break;
			case DOWN:
				t1 = info.ey + info.eh; // ebot
				style.top = hooks.bot - t1;
				console.log(style.top);
				break;
		}

		$(e).css({top:style.top+'px'});
	},

	pushelem = function(e) {
		style.top = $(e).offset().top;

		hooks = {
			// the element top itself
			top: style.top,

			// the parent element bottom
			bot: $(e).parent().offset().top + $(e).parent().outerHeight(true),
		};

		$(e).css({top:style.top+'px',position:'fixed'}).data('hooks', hooks);
		elems.push(e);
	},

	place = function(e) {
		info = getinfo(e);

		if(isintoview() && !isintohook(e))
			hook(e);
		else {
			flow(e);

			info = getinfo(e);
			if(!isvisible())
				repos(e);
		}

		update();
	};

	/* init */
	$w.data({scrollTop:0,scrollLeft:0}).on('scroll.smartflow', function() {
		$.each(elems, function(i) {
			place(elems[i]);
		});
	});

	return this.each(function(i) {
		pushelem(this);
	});
};

})(jQuery);
