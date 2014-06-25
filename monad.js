/**
	Produce an monad given:
	- point 
	and one or:
	- bind
	- map + join

	So long as you have a minimum definition, the remainder of the ops will be derived.
	You can explicitly specify any of these - e.g. you can specify point, map and bind if you like.

	Derives several useful operations from the monad definition.

	Yes, they need to be curried.
	Types are different to haskell - convention will be function types in the second argument.

*/
function monad(ops) {

	var isFn = function(fieldName) {
		return typeof ops[fieldName] === 'function';
	};

	var valid = isFn('point') && (isFn('bind') || isFn('map') && isFn('join'));
	if (!valid) {
		throw "Invalid monad definition. Requires point+(bind or map+join)";
	}

	/** point :: a -> m a */
	var point = ops.point;
	
	/** bind :: m a -> (a -> m b) -> m b */
	var bind = ops.bind || function(ma) {
		return function(famb) {
			return join(map(ma)(famb));
		};
	};

	/** map :: m a -> (a -> b) -> m b */
	var map = ops.map || function(ma) {
		return function(fab) {
			return bind(ma)(function(a) { 
				return point(fab(a));
			});
		};
	};

	/** Similar to <*> in Haskell
	    ap :: m a -> m (a -> b) -> m b  */ 
	var ap = ops.ap || function(ma) {
		return function(mfab) {
			return bind(ma)(function(a) {
				return map(mfab)(function(fab) {
					return fab(a);
				});
			});
		};
	};

	/** join :: m (m a) -> m a */
	var join = ops.join || function(mma) {
		return bind(mma)(function(ma) {
			return ma;
		});
	};

	/** liftA2 :: m a -> m b -> (a -> b -> c) -> m c */
	var liftA2 = function(ma) {
		return function(mb) {
			return function(fabc) {
				return ap(mb)(map(ma)(fabc));
			};
		};
	};

	return {
		point: point,
		bind: bind,
		map: map,
		ap: ap,
		join: join,
		liftA2: liftA2
	};
};

var arrayMonad = monad({
	point: function(a) { 
		return [a]; 
	},
	join: function(mma) {
		var r = [];
		for (var i = 0; i < mma.length; i++) {
			r = r.concat(mma[i]);
		}
		return r;
	},
	map: function(ma) {
		return function(fab) {
			var r = [];
			for (var i = 0; i < ma.length; i++) {
				r.push(fab(ma[i]));
			}
			return r;
		};
	}
});

var Maybe = 


(function() {

	var a1 = ['a', 'b', 'c'];
	var a2 = arrayMonad.map(a1)(function(a) {
		return a + "...";
	})
	console.log("array map", a1, " ==> ",  a2);

})();


(function() {

	var a1 = [['a', 'b'], ['c', 'd'], ['e']];
	var a2 = arrayMonad.join(a1);
	console.log("array join", a1, " ===> ", a2);

})();

(function() {
	var a1 = [3, 7];
	var a2 = arrayMonad.bind(a1)(function(a) {
		return [String(a), String(a + 3)];
	});
	console.log("array bind", a1, " ===> ", a2);

})();

(function() {
	var xs = [3, 7];
	var ys = [1, 2];

	var zs = arrayMonad.liftA2(xs)(ys)(function(x) { 
		return function(y) {
			return [x, y];
		};
	});
	console.log("liftA2", xs, ys, " ===> ", zs);

})();


