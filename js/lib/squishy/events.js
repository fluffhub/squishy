"use strict"
Module(function M() {
	var Handler=M.Class(function C() {
		C.Init(function Handler(type,handler,target,object) {
			this.type=type;
      this.enabled=false;
			this.object=object;
			this._handler=handler || function() {};
			if(target) {
				if(target.element)
				{
					this.target=target.element;
					this.Target=target;
					this.object=this.object || this.Target;
				}
				else if(target.addEventListener)
					this.target=target;
				else throw new Exception('bad target for event');
			}
			else this.target=document.body;
			this.handler=this.handle(this._handler,this.object);
		});
    C.Def(function trigger() {
      this.handler();
    });
		C.Def(function handle(fun,obj) {
			var that=this;
			if(obj) that=obj;
			return function() {
				fun.apply(that,arguments);
			};
		});
    C.Def(function enable() {
      if(!this.enabled) {
    	this.target.addEventListener(this.type,this.handler,this.capture);
      this.enabled=true;
      }
		});
		C.Def(function disable() {
				this.target.removeEventListener(this.type,this.handler);
      this.enabled=false;
		});
		C.Mixin({type:'',object:null,handler:function() {} });
	});
	M.Class(function C()  {
    C.Init(function hasEvents() {});
    C.Def(function dispatch(n) {
      var event = document.createEvent('HTMLEvents');
      event.initEvent(n, true, false);
      this.element.dispatchEvent(event);
    });
    C.Def(function trigger(n) {
      if(n) {
        this.events[n].forEach(function(h) {
          h.trigger();
        });
      }
    });
		C.Def(function addEvent(name,typenames,handler,target,overwrite,capture) {
			if(this.events==null) {
				this.events={};
			}
			var	target=target || this.element || this.doc;
      if(overwrite&&name in this.events) {
        var es=this.events[name];
        for (var n in es) {
            var handler=es[n];
            handler.disable();

            delete es[n];
        }
      }
			if(!(name in this.events)||overwrite) {
				this.events[name]=[];
			}
			var types=typenames.split(' ');
			var type='';
			var E=null;
			for (var i in types) {
				type=types[i];
				E=new Handler(type,handler,target,this);
        E.capture=capture;
				this.events[name].push(E);
			}
		});
		C.Def(function removeEvent() {
			var name='';
			for (var i in arguments) {
				name=arguments[i];
				if(name in this.events) {
					var Es=this.events[name];
					var E=null;
					for (var j in Es ) {
						E=Es[j];
						E.disable();
					}
					delete this.events[name];
				}
			}
		});
		C.Def(function enableEvents() {
			if(arguments.length>0) {
				var name='';
				for(var i=0;i<arguments.length;i++) {
					name=arguments[i];
					if(name in this.events)
						for(var j in this.events[name])
							this.events[name][j].enable();
				}
			}
			else
				for (var name in this.events)
					for(var j in this.events[name])
						this.events[name][j].enable();
		});
		C.Def(function disableEvents() {
			if(arguments.length>0) {
				var name='';
				for(var i in arguments) {
					name=arguments[i];
					if(name in this.events)
						for(var j in this.events[name])
							this.events[name][j].disable();
				}
			}
			else {
				for (var name in this.events) {
					for(var j in this.events[name])
						this.events[name][j].disable();
				}
			}
		});
		C.Mixin({events:null});
	});
});
