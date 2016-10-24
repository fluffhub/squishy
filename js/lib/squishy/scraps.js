var CSSDIRECTIONS=['left','top','width','height'];

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};


function handler(object, callback ) { 
  var args=Array.prototype.slice.call(arguments);
  return function() { 
  	callback.apply(object,args.slice(2));         
  	}; 
}
function getDomain() {
	var a=document.createElement('a');
	return a.hostname;
}
function style2string(s) {
	var ret='';
	for (var n in s) {
		ret=ret+n+':'+s[n]+';';
	}
	return ret;
}
function sub(parent, child){
	child.prototype=Object.create(parent.prototype);
}

function cssify (q) {
	var vs=CSSDIRECTIONS;
	var r={};
	var m;
	r=$.extend(r,q);
	if($.isArray(q)) {
		for (var v in vs) {
			m=""+q[v];
			if(m!=undefined) {
				if(!isNaN(m))
					r[vs[v]]=m+'px';
				else
					if(m.indexOf('px')!==-1)
						r[vs[v]]=m;
			}
		}
	}
	else {
	for (var v in vs) {
		m=""+q[vs[v]];
		if(m!=undefined) {
			if(!isNaN(m))
				r[vs[v]]=m+'px';
						else
		if(m.indexOf('px')!==-1) 
			r[vs[v]]=m;
 
		}
	}
	}
	return r;
}
//stackoverflow  http://stackoverflow.com/a/384380/895656
function isNode(o){
  return (
    typeof Node === "object" ? o instanceof Node : 
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

//Returns true if it is a DOM element    http://stackoverflow.com/a/384380/895656 
function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
);
}
if (typeof Object.create != 'function') {
  Object.create = (function() {
    var Object = function() {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw Error('Second argument not supported');
      }
      if (typeof prototype != 'object') {
        throw TypeError('Argument must be an object');
      }
      Object.prototype = prototype;
      var result = new Object();
      Object.prototype = null;
      return result;
    };
  })();
}
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
 function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}