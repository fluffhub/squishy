
function Filesystem(path,files) { 
	this.path=path;
	var that=this;
	this.values={};
	if(files instanceof Array) {
		files.forEach(function(F) {
			var target={};
			target.type=ft;
			target.path=this.path+'/'+F;
			
			Object.defineProperty(this,root,{
				get:function file() {
					if(that.values[fn]) {
						return that.values[fn];
					}
					else {
						
					}
				}	
			});
		});
		
	}
	else if(typeof files=='object'&&files.constructor==Object) {
		for (var fn in files) {
			var f=fn;
			var target=this.values;
			for (var fn2 in f) {
				if(fn2 in this.values) {
					target=target[fn2];
				}
				else {
					target={};
				}
			}
		}
	}
}
/*Filesystem.prototype.loaders={
	js:function load(path) {
		
	},
	css:function load(path) {
		
	},
	json:function load(path) {
		
	}
};*/
/*Filesystem.prototype.Import=function Imported() {		
	//check global imports for name
	var name=arguments[0];
	var types={};
	var module=this;
	if(name in this) {
		//import has already loaded, return the loaded version
		return this[name];
	}	
	else {
		//check if page is loaded
		if(document.readyState=='complete') {
			//the import must be loaded asynchronously
			
		}
		else {
			//the iport can be loaded as a script tag		
			var script=document.createElement('script');
			script.src=module.path+'/'+module.files[name];
			script.type='text/javascript';
			console.debug(script.src);
			document.head.appendChild(script);
		}
	}
}*/
var UI=new Filesystem("chewy",[
						"index.js", 
						"types.js",
						"styles.js", 
						"cookies.js", 
						"layout.js", 
						"svg.js", 
						"graphics.js", 
						"oldclass.js", 
						"events.js", 
						"ui.js", 
						"keyboard.js", 
						"scraps.js"
]);

//Features
//  Class
//		Method
//		Property
//		Constructor

//	Module
//		File
//		



