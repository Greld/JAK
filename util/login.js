/**
 * @class Login - komunikace s RUSem na pozadi, pomoci iframe a window.postMessage() nebo CORS.
 * @group jak-utils
 */
JAK.Login = JAK.ClassMaker.makeClass({
	NAME: "JAK.Login",
	VERSION: "1.0",
	DEPEND: [{
		sClass:JAK.Promise,
		ver:"1.0"
	}]
});

JAK.Login.URL = "http://login.szn.cz";

JAK.Login.isSupported = function() {
	return (JAK.Login.Request.isSupported() || JAK.Login.Iframe.isSupported());
}

JAK.Login.getTransport = function(conf) {
	return (JAK.Login.Request.isSupported() ? new JAK.Login.Request(conf) : new JAK.Login.Iframe(conf));
}

JAK.Login.prototype.$constructor = function(conf) {
	this._methods = {
		status: "/beta/status",
		login: "/beta/login",
		autologin: "/beta/autologin"
	}

	this._conf = {
		serviceId: "email",
		returnURL: location.href
	}
	for (var p in conf) { this._conf[p] = conf[p]; }

	this._transport = JAK.Login.getTransport();
	this._loginCookie = true;
}

/**
 * Ověření stavu uživatele. Z pohledu služby není přihlášený, co na to login?
 */
JAK.Login.prototype.check = function() {
	var promise = new JAK.Promise();
	var url = JAK.Login.URL + this._methods.status;
	var data = this._commonData();

	this._transport.get(url, data).then(function(data) {
		this._loginCookie = data.cookie;
		promise.fulfill(data.logged);
	}, function(reason) { 
		promise.reject(reason); 
	});
	return promise;
}

/**
 * Ověření stavu uživatele. Z pohledu služby není přihlášený, co na to login?
 */
JAK.Login.prototype.autologin = function() {
	var promise = new JAK.Promise();
	var url = JAK.Login.URL + this._methods.autologin;
	var data = this._commonData();

	this._transport.get(url, data).then(function(data) {
		promise.fulfill(data);
	}, function(reason) { 
		promise.reject(reason); 
	});
	return promise;
}

JAK.Login.prototype.login = function(name, pass, remember) {	
	var promise = new JAK.Promise();
	var url = JAK.Login.URL + this._methods.login;

	var data = this._commonData();
	data.user = name;
	data.password = pass;
	data.remember = (remember ? 1 : 0);
	data.ajax = (this._loginCookie ? 1 : 0);

	if (!this._loginCookie) { /* presmerovat celou stranku */
		var form = JAK.mel("form", {action:url, method:"post"});
		for (var p in data) {
			var input = JAK.mel("input", {type:"hidden", name:"p", value:data[p]});
			form.appendChild(input);
		}
		document.body.appendChild(form);
		form.submit();
		return promise;
	}

	this._transport.post(url, data).then(function(data) {
		promise.fulfill(data);
	}, function(reason) { 
		promise.reject(reason); 
	});
	return promise;
}

JAK.Login.prototype._commonData = function() {
	return {
		serviceId: this._conf.serviceId,
		returnURL: this._conf.returnURL,
	}
}
JAK.Login.Request = JAK.ClassMaker.makeClass({
	NAME: "JAK.Login.Request",
	VERSION: "1.0"
});

JAK.Login.Request.isSupported = function() {
	return (window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest() && JAK.Browser.client == "gecko"); /* :-( */
}

JAK.Login.Request.prototype.get = function(url, data) {
	return this._send(url, data, "get");
}

JAK.Login.Request.prototype.post = function(url, data) {
	return this._send(url, data, "post");
}

JAK.Login.Request.prototype._send = function(url, data, method) {
	var promise = new JAK.Promise();

	var request = new JAK.Request(JAK.Request.TEXT, {method:method, withCredentials:true});
	request.setHeaders({"Accept": "application/json"});
	request.setCallback(function(data, status) {
		if (status == 200) {
			try {
				data = JSON.parse(data);
				promise.fulfill(data);
			} catch (e) {
				promise.reject(e);
			}
		} else {
			promise.reject(data);
		}
	});
	request.send(url, data);

	return promise;
}
JAK.Login.Iframe = JAK.ClassMaker.makeClass({
	NAME: "JAK.Login.Iframe",
	VERSION: "1.0"
});

JAK.Login.Iframe.isSupported = function() {
	return !!window.postMessage;
}

JAK.Login.Iframe.prototype.$constructor = function() {
	this._origins = [
		JAK.Login.URL,
		"http://login." + window.location.hostname // http://login.sluzba.cz
	];


	this._id = "iframe" + JAK.idGenerator();
	this._promise = null;
	this._frame = this._buildIframe();

	JAK.Events.addListener(window, "message", this, "_message");
}

JAK.Login.Iframe.prototype.get = function(url, data) {
	this._promise = new JAK.Promise();

	var arr = [];
	for (var name in data) {
		arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
	}
	this._frame.src = url + "?" + arr.join("&");

	return this._promise;
}

JAK.Login.Iframe.prototype.post = function(url, data) {
	this._promise = new JAK.Promise();

	var form = JAK.mel("form", {method:"post", target:this._id, action:url});

	for (var name in data) {
		var value = data[name];
		var input = JAK.mel("input", {type:"hidden", name:name, value:value});
		form.appendChild(input);
	}

	document.body.appendChild(form);
	form.submit();
	form.parentNode.removeChild(form);

	return this._promise;
}

JAK.Login.Iframe.prototype._buildIframe = function() {
	if (JAK.Browser.client == "ie" && parseInt(JAK.Browser.version) < 9) {
		var frame = JAK.mel("<iframe name='" + this._id + "'>");
	} else {
		var frame = JAK.mel("iframe");
		frame.setAttribute("name", this._id);
	}
	frame.style.display = "none";

	document.body.insertBefore(frame, document.body.firstChild);
	return frame;
}

JAK.Login.Iframe.prototype._message = function(e) {
	if (!this._isAllowedUrl(e.origin)) { return; }

	this._promise.fulfill(e.data);
	this._promise = null;
}

/**
 * kontrola, zda je url v seznamu povolenych rl
 */
JAK.Login.Iframe.prototype._isAllowedUrl = function(url) {
	url = url.split("//")[1];
	if (!url) { return false; }
	
	for (var i = 0, max = this._origins.length; i < max; i++) {
		var origin = this._origins[i].split('//')[1];
		if (origin && origin == url) {
			return true;
			break;
		}
	}
	return false;
}