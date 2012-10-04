/*	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt	Licenced under the MIT Licence, complete text is available in licence.txt file*//** * @overview Widget pro práci s ukazatelem průběhu. Využívá HTML5 tag &lt;progress&gt; pokud je k dispozici. Vychazi ze specifikace: http://www.w3schools.com/html5/tag_progress.asp * @author jerry */  /** * @class Ukazatel průběhu (&lt;progress&gt;) * @group jak-widgets * @version 1.0 */JAK.Progress = JAK.ClassMaker.makeClass({	NAME: "JAK.Progress",	VERSION: "1.0"});JAK.Progress.HTML5 = ("max" in JAK.mel("progress"));/** * Pokud voláme konstruktor bez parametrů, vytvoří se nekonečný progress bar * @param {object} options objekt volitelných nastavení * @param {number} options.max nastavuje maximum, tedy maximální možnou hodnotu, kterou lze zadat jako value * @param {number} options.value nastavuje ukazatel na aktuální hodnotu */JAK.Progress.prototype.$constructor = function(options) {	this._defaultOptions();		for (var i in options) {		this._checkNumber(options[i],i);		this._options[i] = options[i];	}		this._options.max = this._options.max || this._options.value;		this._dom = {		container: null,		barValue: null	};	this._animateProgress = this._animateProgress.bind(this);	this._build();}/** * destructor ruší případný interval animovaného "nekonečného" progress baru */JAK.Progress.prototype.$destructor = function() {	clearInterval(this._animInterval);}/** * vrací html element s vytvořeným meterem * @returns {HTMLElement} element s vytvořeným meterem */JAK.Progress.prototype.getContainer = function() {	return this._dom.container;}/** * nastavuje ukazatel na aktuální hodnotu * @param {number} value aktuální hodnota  */JAK.Progress.prototype.setValue = function(value) {	this._checkNumber(value, "value");	if (value > this._options.max) { throw new Error("Arg value must not be greater than max."); }	this._options.value = value;	this._sync();}/** * nastavuje maximální hodnotu ukazatele * @param {number} max maximální možná hodnota  */JAK.Progress.prototype.setMax = function(max) {	this._checkNumber(max, "max");	if (this._options.value > max) { throw new Error("Arg max must not be lower than current value."); }	this._options.max = max;	this._sync();}/** * vrací aktuálně nastavenou hodnotu ukazatele * @returns {number} aktuálně nastavená hodnota */JAK.Progress.prototype.getValue = function(value) {	return this._options.value;}/** * vrací maximálně nastavitelnou hodnotu ukazatele * @returns {number} maximálně nastavitelná hodnota ukazatele */JAK.Progress.prototype.getMax = function(max) {	return this._options.max;}JAK.Progress.prototype._sync = function() {	var value = this._options.value;	var max = this._options.max;	if (!max) { return; }	if (this.constructor.HTML5) {		this._dom.container.value = value;		this._dom.container.max = max;		this._dom.container.innerHTML = '<strong>' + percent + '%</strong>'	} else {		clearInterval(this._animInterval);		var percent = Math.round((value/max)*100);		percent = percent > 100 ? 100 : percent;		this._dom.barValue.style.width = percent + "%";		this._dom.barValue.style.position = "";	}}JAK.Progress.prototype._build = function() {	var options = this._options;	if (this.constructor.HTML5) {		this._dom.container = JAK.mel("progress",{className:"progress"});		if (this._options.value) { this._dom.container.value = options.value; }		if (this._options.max) { this._dom.container.max = options.max; }	} else {		this._buildCustom();	}	this._sync();}JAK.Progress.prototype._buildCustom = function() {	var options = this._options;	var container = JAK.mel("span", {className:"progress no-html5"});	var barValue = JAK.mel("em");	container.appendChild(barValue);	this._dom.container = container;	this._dom.barValue = barValue;	if (!options.max && !options.value) {		this._animInterval = setInterval(this._animateProgress, 50);		this._dom.barValue.style.width = "10%";		this._dom.barValue.style.position = "relative";	}}JAK.Progress.prototype._animateProgress = function() {	var value = parseInt(this._dom.barValue.style.left, 10);	value = isNaN(value) ? -2 : value;	if ((value+=2) > 90) { value=0; }	this._dom.barValue.style.left = value + "%";}JAK.Progress.prototype._defaultOptions = function() {	this._options = {value:0};}JAK.Progress.prototype._checkNumber = function(value, type) {	if (typeof(value) != "number") { throw new Error("Arg " + type + " must be a number."); }}