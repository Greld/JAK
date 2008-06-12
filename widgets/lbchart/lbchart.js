/**
 * @overview line + bar chart
 * @version 1.0
 * @author zara
*/   

/**
 * @class LBChart
 * @constructor
 * carovy a sloupcovy graf
 * @param {string} id id prvku, do ktereho se graf vlozi
 * @param {array} data pole objektu s vlastnostmi 'data', 'label', 'marker', 'type'; 'data' je pole hodnot
 * @param {object} options asociativni pole parametru, muze obsahovat tyto hodnoty:
 *	 <ul>
 *		<li><em>padding</em> - vycpavka</li>
 *		<li><em>rows</em> - priblizny pocet vodorovnych radek</li>
 *		<li><em>legend</em> - bool, zda-li kreslit legendu</li>
 *		<li><em>legendWidth</em> - sirka prvku legendy</li>
 *		<li><em>markerSize</em> - velikost znacky</li>
 *		<li><em>labels</em> - pole popisku osy x</li>
 *		<li><em>barWidth</em> - sirka sloupce</li>
 *		<li><em>lineWidth</em> - sirka cary</li>
 *		<li><em>outlineWidth</em> - sirka oramovani sloupce</li>
 *		<li><em>zero</em> - bool, ma-li graf zahrnovat nulu</li>
 *		<li><em>colors</em> - pole barev</li>
 *   </ul>
 */

SZN.LBChart = SZN.ClassMaker.makeClass({
	NAME:"LBChart",
	VERSION:"1.0",
	CLASS:"class"
});

SZN.LBChart.prototype.$constructor = function(id, data, options) {
	this.options = {
		padding: 30,
		rows: 6,
		legend: true,
		legendWidth: 25,
		markerSize: 8,
		labels: [],
		barWidth: 10,
		lineWidth: 1,
		outlineWidth: 1,
		zero:false,
		colors: ["rgb(0,76,140)","rgb(255,73,17)","rgb(255,214,37)","rgb(94,162,33)","rgb(132,0,38)", 
			"rgb(137,205,255)","rgb(55,71,5)","rgb(179,210,0)","rgb(82,36,118)","rgb(255,155,17)",
			"rgb(201,0,14)","rgb(0,138,212)"]
	}
	
	for (var p in options) { this.options[p] = options[p]; }
	this.container = SZN.gEl(id);
	this.barCount = 0;
	this.appended = [];
	
	this.width = this.container.offsetWidth;
	this.height = this.container.offsetHeight;
	this.offsetLeft = this.options.padding;
	
	this.canvas = SZN.Vector.getCanvas(this.width, this.height);
	this.container.style.position = "relative";
	this.container.appendChild(this.canvas.getContainer());
	
	this.data = data;
	for (var i=0;i<this.data.length;i++) {
		if (data[i].type == "bar") { this.barCount++; }
	}
	
	if (this.data.length) { 
		this.dataLength = this.data[0].data.length;
		this._draw(); 
	}
}

SZN.LBChart.prototype.$destructor = function() {
	this.canvas.$destructor();
	for (var i=0;i<this.appended.length;i++) {
		var elm = this.appended[i];
		elm.parentNode.removeChild(elm);
	}
}

/**
 * @method
 * @private
 * prepocita rozmery volne plochy + krok osy X
 */
SZN.LBChart.prototype._compute = function() {
	var o = this.options;
	this.availh = this.height - 2*o.padding;
	this.availw = this.width - (o.padding + this.offsetLeft + this.lw);

	if (this.barCount) {
		this.interval = (this.availw - this.dataLength * this.barCount * o.barWidth) / this.dataLength;
	} else {
		this.interval = this.availw / (this.dataLength - 1);
	}
}

/**
 * @method
 * @private
 * vykresli graf
 */
SZN.LBChart.prototype._draw = function() {
	var o = this.options;
	var all = [];
	for (var i=0;i<this.data.length;i++) {
		var dataset = this.data[i];
		for (var j=0;j<this.dataLength;j++) { all.push(dataset.data[j]); }
	}
	all.sort(function(a,b) {return a-b;});
	var min = all.shift();
	var max = all.pop();
	
	this.lw = 0;
	if (o.legend) { this.lw = this._prepareLegend(); }
	this._compute();

	if (o.zero) {
		if (min > 0) { min = 0; }
		if (max < 0) { max = 0; }
	}
	
	if (this.options.rows) {
		var step = (max-min) / (this.options.rows);
		var base = Math.floor(Math.log(step) / Math.log(10));
		var divisor = Math.pow(10,base);
		var result = Math.round(step / divisor) * divisor;
		max = Math.ceil(max / result) * result;
		min = Math.floor(min / result) * result;
	}
		
	var availh = this.availh;
	var scale = function(value) { return Math.round((value-min) / (max-min) * availh); }

	if (this.options.rows) { /* horizontal lines */
		var style = {
			color:"#888",
			width:1
		}
		
		var m = 0;
		var labels = [];
		for (var i=min;i<=max;i+=result) {
			i = Math.round(i * 1000) / 1000;
			var top = this.height - o.padding - scale(i);
			var text = SZN.cEl("div", false, false, {position:"absolute", left:"0px", top:top+"px"});
			text.innerHTML = i;
			this.container.appendChild(text);
			this.appended.push(text);
			var w = text.offsetWidth;
			var h = text.offsetHeight;
			top -= Math.round(h/2);
			text.style.top = top+"px";
			
			m = Math.max(m, w);
			labels.push(text);
		}

		this.offsetLeft += m+10;
		this._compute();
		
		var idx = 0;
		for (var i=min;i<=max;i+=result) {
			var text = labels[idx];
			var ow = text.offsetWidth;
			text.style.left = (this.offsetLeft - 10 - ow) + "px";
			i = Math.round(i * 1000) / 1000;
			var top = this.height - o.padding - scale(i);
			
			new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(this.offsetLeft, top), new SZN.Vec2d(this.offsetLeft+this.availw, top)], style)
			idx++;
		}
		new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(this.offsetLeft, o.padding), new SZN.Vec2d(this.offsetLeft, this.height-o.padding)], style);
	}
	

	if (o.labels) {
		var labels = [];
		var total = 0;
		var x = this.offsetLeft;
		if (this.barCount) { x += this.interval/2 + this.barCount * o.barWidth / 2; }
		var y = this.height - o.padding + 5;
		
		for (var i=0;i<o.labels.length;i++) {
			var label = SZN.cEl("div",false, false, {position:"absolute", top:y+"px", left:Math.round(x)+"px"});
			var l2 = SZN.cEl("div", false, false, {position:"relative", left:"-50%"});
			label.appendChild(l2);
			l2.innerHTML = o.labels[i];
			this.container.appendChild(label);
			this.appended.push(label);
			x += this.interval + this.barCount * o.barWidth;
			total += 5 + label.offsetWidth;
			labels.push(label);
		}

		if (total > this.availw) {
			var frac = Math.ceil(total / this.availw);
			for (var i=0;i<labels.length;i++) {
				if (i % frac) { labels[i].style.display = "none"; }
			}
		}
	}
	
	var idx = 0;
	for (var i=0;i<this.data.length;i++) { 
		if (this.data[i].type == "bar") { 
			this._drawBars(i, idx, scale, min, max); 
			idx++;
		}
	}

	for (var i=0;i<this.data.length;i++) { 
		if (this.data[i].type != "bar") { this._drawLine(i, scale); }
	}
	
	if (o.legend) { this._drawLegend(); }
}

/**
 * @method
 * @private
 * vykresli sloupcovy dataset
 * @param {number} indexTotal poradi datasetu
 * @param {number} index poradi datasetu v ramci sloupcovych datasetu
 * @param {function} scale skalovaci funkce
 * @param {number} min nejmensi hodnota, potreba k orientaci sloupce
 * @param {number} max nejvetsi hodnota, potreba k orientaci sloupce
 */
SZN.LBChart.prototype._drawBars = function(indexTotal, index, scale, min, max) {
	var o = this.options;
	var obj = this.data[indexTotal];
	var color = o.colors[indexTotal % o.colors.length];

	var points = [];
	var x1 = this.offsetLeft + index*o.barWidth + this.interval/2;
	
	for (var i=0;i<obj.data.length;i++) {
		var value = obj.data[i];

		var x2 = x1 + o.barWidth;
		
		var ref = 0;
		if (min >= 0) {
			ref = min;
		} else if (max <= 0) {
			ref = max;
		}
		var y1 = this.height - o.padding - scale(ref);
		var y2 = this.height - o.padding - scale(value);
		

		new SZN.Vector.Polygon(this.canvas, 
							[new SZN.Vec2d(x1,y1), new SZN.Vec2d(x2,y1), new SZN.Vec2d(x2,y2), new SZN.Vec2d(x1,y2)], 
							{color:color, outlineWidth:o.outlineWidth, outlineColor:"black", title:value});

		x1 += this.interval + this.barCount	* o.barWidth;
	}
}

/**
 * @method
 * @private
 * vykresli carovy dataset
 * @param {number} index poradi datasetu
 * @param {function} scale skalovaci funkce
 */
SZN.LBChart.prototype._drawLine = function(index, scale) {
	var o = this.options;
	var obj = this.data[index];
	var color = o.colors[index % o.colors.length];

	var points = [];
	var x = this.offsetLeft;
	if (this.barCount) { x += this.interval/2 + this.barCount * o.barWidth / 2; }
	for (var i=0;i<obj.data.length;i++) {
		var value = obj.data[i];
		var y = this.height - o.padding - scale(value);
		points.push(new SZN.Vec2d(x, y));
		x += this.interval + this.barCount * o.barWidth;
	}
	
	new SZN.Vector.Line(this.canvas, points, {color:color, width:o.lineWidth});

	if (!obj.marker) { return; }
	for (var i=0;i<points.length;i++) {
		new obj.marker(this.canvas, points[i], o.markerSize, color, obj.data[i]);
	}	
}


/**
 * @method
 * @private
 * vyrobi popisky k legende a spocte, kolik zabiraji mista
 */
SZN.LBChart.prototype._prepareLegend = function() {
	var labels = [];
	var max = 0;
	
	var o = this.options;
	for (var i=0;i<this.data.length;i++) {
		var text = SZN.cEl("div", false, false, {position:"absolute"});
		text.innerHTML = this.data[i].label;
		this.container.appendChild(text);
		this.appended.push(text);
		var w = text.offsetWidth;
		max = Math.max(max, w);
		labels.push(text);
	}
	
	this.legendLabels = labels;
	return max + 2*o.padding + 10 + o.legendWidth;
}

/**
 * @method
 * @private
 * vykresli legendu
 */
SZN.LBChart.prototype._drawLegend = function() {
	var labels = this.legendLabels;
	var o = this.options;

	var w = this.availw;

	for (var i=0;i<this.data.length;i++) {
		var dataset = this.data[i];
		var color = o.colors[i % o.colors.length];

		if (dataset.type == "bar") {
			var x1 = this.offsetLeft + w + 2*o.padding;
			var x2 = x1 + o.legendWidth;

			var y1 = i*(o.legendWidth + 10) + o.padding;
			var y2 = y1 + o.legendWidth;

			new SZN.Vector.Polygon(this.canvas, 
								[new SZN.Vec2d(x1,y1), new SZN.Vec2d(x2,y1), new SZN.Vec2d(x2,y2), new SZN.Vec2d(x1,y2)], 
								{color:color, outlineColor:"#000", outlineWidth:o.outlineWidth});
		} else {
			var x1 = this.offsetLeft + w + 2*o.padding;
			var x2 = x1 + o.legendWidth;
			var y = i*(o.legendWidth + 10) + o.padding + Math.round(o.legendWidth/2);
			new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(x1,y), new SZN.Vec2d(x2,y)], {color:color, width:1+o.lineWidth});

			/* marker */
			if (dataset.marker) { new dataset.marker(this.canvas, new SZN.Vec2d(x1 + o.legendWidth/2,y), o.markerSize, color); }
		}
		
		var l = this.offsetLeft + w + 2*o.padding+o.legendWidth+10;
		var t = i*(o.legendWidth+10) + o.padding;
		var text = labels[i];

		t += Math.round((o.legendWidth - text.offsetHeight)/2);
		text.style.left = l+"px";
		text.style.top = t+"px";
	}
}

/**
 * @class Marker
 * @constructor
 * znacka na care grafu
 * @param {object} canvas vektorovy canvas, do ktereho se kresli
 * @param {vec2d} point souradnice bodu
 * @param {number} size velikost znacky
 * @param {string} color barva znacky
 * @param {string} title title znacky
 */
SZN.Marker = SZN.ClassMaker.makeClass({
	NAME:"Marker",
	VERSION:"1.0",
	CLASS:"class"
});

SZN.Marker.prototype.$constructor = function(canvas, point, size, color, title) {
	this.canvas = canvas;
	this.point = point;
	this.size = size;
	this.color = color;
	this.title = title;
	this._draw();
}
SZN.Marker.prototype._draw = function() {}

/**
 * znacka kolecka
 * @see SZN.Marker
 */
SZN.Marker.Circle = SZN.ClassMaker.makeClass({
	NAME:"Circle",
	VERSION:"1.0",
	CLASS:"class",
	EXTEND:SZN.Marker
});

SZN.Marker.Circle.prototype._draw = function() {
	new SZN.Vector.Circle(this.canvas, this.point, this.size/2, {color:this.color, outlineWidth:0, title:this.title});
}

/**
 * znacka ctverecku
 * @see SZN.Marker
 */
SZN.Marker.Square = SZN.ClassMaker.makeClass({
	NAME:"Square",
	VERSION:"1.0",
	CLASS:"class",
	EXTEND:SZN.Marker
});

SZN.Marker.Square.prototype._draw = function() {
	var x1 = this.point.getX() - this.size/2;
	var y1 = this.point.getY() - this.size/2;
	var x2 = x1 + this.size;
	var y2 = y1 + this.size;
	
	new SZN.Vector.Polygon(this.canvas, [
		new SZN.Vec2d(x1,y1), new SZN.Vec2d(x2,y1), 
		new SZN.Vec2d(x2,y2), new SZN.Vec2d(x1,y2)
	], {color:this.color, outlineWidth:0, title:this.title});
}

/**
 * znacka krizku 'x'
 * @see SZN.Marker
 */
SZN.Marker.Cross = SZN.ClassMaker.makeClass({
	NAME:"Cross",
	VERSION:"1.0",
	CLASS:"class",
	EXTEND:SZN.Marker
});

SZN.Marker.Cross.prototype._draw = function() {
	var x1 = this.point.getX() - this.size/2;
	var y1 = this.point.getY() - this.size/2;
	var x2 = x1 + this.size;
	var y2 = y1 + this.size;
	
	new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(x1,y1), new SZN.Vec2d(x2,y2)], {color:this.color, outlineWidth:0, width:2, title:this.title});
	new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(x2,y1), new SZN.Vec2d(x1,y2)], {color:this.color, outlineWidth:0, width:2, title:this.title});
}

/**
 * znacka plus
 * @see SZN.Marker
 */
SZN.Marker.Plus = SZN.ClassMaker.makeClass({
	NAME:"Plus",
	VERSION:"1.0",
	CLASS:"class",
	EXTEND:SZN.Marker
});

SZN.Marker.Plus.prototype._draw = function() {
	var x1 = this.point.getX() - this.size/2;
	var y1 = this.point.getY() - this.size/2;
	var x2 = x1 + this.size;
	var y2 = y1 + this.size;
	
	new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(x1,this.point.getY()), new SZN.Vec2d(x2,this.point.getY())], {color:this.color, width:2, outlineWidth:0, title:this.title});
	new SZN.Vector.Line(this.canvas, [new SZN.Vec2d(this.point.getX(),y1), new SZN.Vec2d(this.point.getX(),y2)], {color:this.color, width:2, outlineWidth:0, title:this.title});
}

/**
 * znacka trojuhelnicku
 * @see SZN.Marker
 */
SZN.Marker.Triangle = SZN.ClassMaker.makeClass({
	NAME:"Triangle",
	VERSION:"1.0",
	CLASS:"class",
	EXTEND:SZN.Marker
});

SZN.Marker.Triangle.prototype._draw = function() {
	var coef = Math.sqrt(3);
	var x = this.point.getX();
	var y = this.point.getY();
	
	new SZN.Vector.Polygon(this.canvas, [
		new SZN.Vec2d(x-this.size/2, y+this.size*coef/6), new SZN.Vec2d(x+this.size/2, y+this.size*coef/6), 
		new SZN.Vec2d(x, y-this.size*coef/3)],
		{color:this.color, outlineWidth:0, title:this.title});
}