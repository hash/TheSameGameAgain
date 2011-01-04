/*
 * Same game
 */

(function () {
	var game = window.game = (function () {
		var name, score, hovered_value,
		canvas, context,
		coord,
		score_val, val,
		matrix, r, lock_on, debug,
		settings = {
			block_size: 50,
			colors_count: 4,
			matrix: {Height: 10, Width: 16}
		};

		function line(a, b) {
			context.moveTo(a.x + 0.5, a.y + 0.5);
			context.lineTo(b.x + 0.5, b.y + 0.5);
		}

		function circle(a) {
			context.beginPath();
			context.arc(a.x + 0.5, a.y + 0.5, r, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
			context.stroke();
		}

		function draw() {
			canvas.width = canvas.width;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.save();
			matrix.i_draw();
			context.restore();
		}

		matrix = new (function () {
			var matrix = [], grouped = [], colors = [];

			function get_random(a, b) {
				if (a === undefined) {
					return 0;
				}
				if (b === undefined) {
					b = a;
					a = 0;
				}
				if (a < b) {
					return a + (Math.random() * (1 + (b - a))).int();
				} else {
					return b + (Math.random() * (1 + (a - b))).int();
				}
			}

			function compare_numbers(a, b) {
				return a - b;
			}

			function make_colors(n) {
				var d = (360 / n).int(), b = get_random(360), i,
				s = 0, l = 0, h = 0;
				colors = [];
				b = b % d;
				context.save();
				context.fillStyle = "hsl(0, 0%, 0%)";
				colors.push(context.fillStyle);
				for (i = 0 ; i < n ; i += 1) {
					s = get_random(50, 80);
					l = get_random(35, 65);
					h = b + (d * i);
					context.fillStyle = "hsl(" + h + ", " + s + "%, " + l + "%)";
					colors.push(context.fillStyle);
				}
				context.restore();
			}

			function is_grouped(x, y) {
				var i;
				for (i = 0 ; i < grouped.length ; i += 1) {
					if (grouped[i].x === x && grouped[i].y === y) {
						return true;
					}
				}
				return false;
			}

			function walk_on(x, y) {
				if (x > 0) {
					if (matrix[x - 1][y] === matrix[x][y]) {
						if (!is_grouped(x - 1, y)) {
							grouped.push({x: x - 1, y: y});
							walk_on(x - 1, y);
						}
					}
				}
				if (x + 1 < matrix.length) {
					if (matrix[x + 1][y] === matrix[x][y]) {
						if (!is_grouped(x + 1, y)) {
							grouped.push({x: x + 1, y: y});
							walk_on(x + 1, y);
						}
					}
				}
				if (y > 0) {
					if (matrix[x][y - 1] === matrix[x][y]) {
						if (!is_grouped(x, y - 1)) {
							grouped.push({x: x, y: y - 1});
							walk_on(x, y - 1);
						}
					}
				}
				if (y + 1 < matrix[0].length) {
					if (matrix[x][y + 1] === matrix[x][y]) {
						if (!is_grouped(x, y + 1)) {
							grouped.push({x: x, y: y + 1});
							walk_on(x, y + 1);
						}
					}
				}
			}

			function group(x, y) {
				grouped = [];
				grouped.push({x: x, y: y});
				walk_on(x, y);
				return grouped.length;
			}

			function fall() {
				var i, j, k, fallen = [];
				for (i = 0 ; i < grouped.length ; i += 1) {
					if (fallen[grouped[i].x] === undefined) {
						fallen[grouped[i].x] = [];
						fallen[grouped[i].x].push(grouped[i].y);
					} else {
						fallen[grouped[i].x].push(grouped[i].y);
					}
				}
				for (i = 0 ; i < fallen.length ; i += 1) {
					if (fallen[i] === undefined) {
						continue;
					} else {
						fallen[i].sort(compare_numbers);
						for (j = 0 ; j < fallen[i].length ; j += 1) {
							for (k = fallen[i][j] ; k > 0 ; k -= 1) {
								matrix[i][k] = matrix[i][k - 1];
							}
							matrix[i][0] = 0;
						}
					}
				}
			}

			function swap_columns(a, b) {
				var i, c;
				for (i = 0 ; i < matrix[0].length ; i += 1) {
					c = matrix[a][i];
					matrix[a][i] = matrix[b][i];
					matrix[b][i] = c;
				}
			}

			function swipe_columns() {
				var i, j, zeros = [];
				for (i = 1 ; i < matrix.length ; i += 1) {
					if (matrix[i][matrix[i].length - 1] === 0) {
						zeros.push(i);
					}
				}
				zeros.sort(compare_numbers);
				for (i = 0 ; i < zeros.length ; i += 1) {
					for (j = zeros[i] ; j > 0 ; j -= 1) {
						swap_columns(j, j - 1);
					}
				}
			}

			this.is_it_the_end = function () {
				return false;
			};

			this.let_go = function () {
				grouped = [];
				return false;
			};

			this.is_value = function (c) {
				if (matrix[c.x][c.y] !== 0) {
					group(c.x, c.y);
					return true;
				} else {
					return this.let_go();
				}
			};

			this.get_value = function () {
				return grouped.length;
			};

			this.i_clean = function () {
				var i;
				for (i = 0 ; i < grouped.length ; i += 1) {
					matrix[grouped[i].x][grouped[i].y] = 0;
				}
				fall();
				swipe_columns();
			};

			this.i_draw = function () {
				var i, j, a = {x: r, y: r};
				for (i = 0 ; i < matrix.length ; i += 1) {
					for (j = 0 ; j < matrix[0].length ; j += 1) {
						context.fillStyle = colors[matrix[i][j]];
						circle(a);
						a.y += settings.block_size;
					}
					a.x += settings.block_size;
					a.y = r;
				}
			};

			this.build = function (rows, columns, colors) {
				var i, j, row, column;
				matrix = [];
				for (i = 0 ; i < columns ; i += 1) {
					row = [];
					for (j = 0 ; j < rows ; j += 1) {
						column = get_random(1, colors);
						row.push(column);
					}
					matrix.push(row);
				}
				make_colors(colors);
			};
		})();

		coord = new (function () {
			var Mouse = {x: 0, y: 0},
				Matrix = {x: 0, y: 0},
				Canvas = {x: 0, y: 0};
			this.mouse = function (x, y) {
				if (x === undefined) {
					return Mouse;
				} else {
					if (y === undefined) {
						Mouse.x = x.x;
						Mouse.y = x.y;
					} else {
						Mouse.x = x;
						Mouse.y = y;
					}
				}
			};
			this.matrix = function (x, y) {
				if (x === undefined) {
					return Matrix;
				} else {
					if (y === undefined) {
						Matrix.x = x.x;
						Matrix.y = x.y;
					} else {
						Matrix.x = x;
						Matrix.y = y;
					}
				}
			};
			this.canvas = function (x, y) {
				if (x === undefined) {
					return undefined;
				} else {
					Canvas.x = Canvas.y = r;
					if (y === undefined) {
						Canvas.x += x.x * settings.block_size;
						Canvas.y += x.y * settings.block_size;
					} else {
						Canvas.x += x * settings.block_size;
						Canvas.y += y * settings.block_size;
					}
					return Canvas;
				}
			};
		})();

		function up_debug() {
			debug.textContent = "x: " + coord.matrix().x + ", y: " + coord.matrix().y;
			if (matrix.is_it_the_end()) {
				debug.textContent += " it's the end ;)";
			}
		}

		function up_name() {
			score.textContent = score_val;
			if (val > 1) {
				hovered_value.textContent = val;
			} else {
				hovered_value.textContent = '_';
			}
		}

		function is_circle(a, b) {
			context.beginPath();
			context.arc(a.x + 0.5, a.y + 0.5, r, 0, 2 * Math.PI, false);
			var hmm = context.isPointInPath(b.x, b.y);
			context.closePath();
			return hmm;
		}

		function on_mouse_move(e) {
			var x, y, is_ch, is_c;
			is_ch = is_c = false;
			coord.mouse(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
			x = (coord.mouse().x / settings.block_size).int() % settings.matrix.Width;
			y = (coord.mouse().y / settings.block_size).int() % settings.matrix.Height;
			if (coord.matrix().x !== x || coord.matrix().y !== y) {
				coord.matrix(x, y);
				is_ch = true;
			}
			if (is_circle(coord.canvas(coord.matrix()), coord.mouse())) {
				is_c = true;
			}
			if (is_c) {
				if (!lock_on || is_ch) {
					lock_on = matrix.is_value(coord.matrix());
				}
			} else {
				if (lock_on) {
					lock_on = matrix.let_go();
				}
			}
			val = matrix.get_value();
			val = ((val - 1) * val);
			up_name();
			up_debug();
		}

		function on_click(e) {
			on_mouse_move(e);
			if (lock_on) {
				if (val > 0) {
					score_val += val;
					matrix.i_clean();
					lock_on = matrix.let_go();
				}
			}
			on_mouse_move(e);
			draw();
		}

		function setup() {
			function build_dom() {
				var h1, hd, p, game_name = 'Same game';
				h1 = document.createElement("h1");
				name = h1.appendChild(document.createElement("span"));
				score = h1.appendChild(document.createElement("span"));
				hovered_value = h1.appendChild(document.createElement("span"));
				name.textContent = document.title = game_name;
				score.textContent = "";
				hovered_value.textContent = "";
				hd = document.createElement("header");
				hd.appendChild(h1);
				document.body.appendChild(hd);
				p = document.createElement("p");
				canvas = p.appendChild(document.createElement("canvas"));
				document.body.appendChild(p);
				debug = document.createElement("p");
				document.body.appendChild(debug);
			}

			function fix() {
				Function.prototype.method = function (name, func) {
					this.prototype[name] = func;
					return this;
				};
				Number.method('int', function () {
					return Math[this < 0 ? 'ceiling' : 'floor'](this);
				});
			}

			fix();
			build_dom();
			context = canvas.getContext("2d");
		}

		function resize_canvas() {
			canvas.width = (settings.block_size * settings.matrix.Width).int();
			canvas.height = (settings.block_size * settings.matrix.Height).int();
		}

		function reset() {
			score_val = 0;
			lock_on = false;
			r = (settings.block_size / 2).int() - 1;
			resize_canvas();
		}

		function run() {
			setup();
			reset();
			matrix.build(settings.matrix.Height, settings.matrix.Width, settings.colors_count);
			draw();
			$(canvas).click(on_click);
			$(canvas).mousemove(on_mouse_move);
		}

		return {
			init: run
		};
	}());

	$(document).ready(game.init);
}());
