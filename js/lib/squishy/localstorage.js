Module(function M() {
M.Import('squishy/model',function(model) {
M.Import('squishy/events',function(events) {
  function LocalModelError(val) {
    this.message=val.target.error.message;
    this.name=val.target.error.name;
  }
  var LocalModel=M.Class(function C() {
    C.Init(function LocalModel(mdef) {
      var Mdl=this;
      mdef.Template={
        Def:function() {
          if(typeof (arguments[0])=='function') {
            Object.defineProperty(Mdl,arguments[0].name,{
              enumerable:false,
              writable:true,
              configurable:false,
              value:arguments[0]
            });
          } else { }
        }
      };
      Object.defineProperty(this,"Model",{
        enumerable:false,
        writable:true,
        value:window.Model(mdef)
      });
      Object.defineProperty(this,"modelname",{
        enumerable:false,
        writable:true,
        value:this.Model.modelname
      });

    });
    C.Def(function transact(fun) {
      if(this.IDB.state=='loaded')
        fun({target:this.IDB.element});
      else
        this.IDB.dependencies[this.IDB.dependencies.length]=fun;
    });
    C.Def(function create(val,callback) {
      var V=new this.Model(val);
      var Mdl=this;
      this.transact(function _create(e) {
        var IDB=e.target.result;
        var transaction=IDB.transaction([Mdl.modelname],
                                        "readwrite");
        transaction.addEventListener("complete",function(e) {
        });
        var os=transaction.objectStore(Mdl.modelname);

        if(V[os.keyPath]&&V[os.keyPath]!=Mdl.Model.default[os.keyPath]) {}
        else { delete V[os.keyPath]; }
        var req=os.add(V);

        if(callback) {
          req.addEventListener("success",function(e) {
            V.id=e.target.result;
            callback(Mdl.spawn(V));
          });
        }
        req.addEventListener("error",function(e) {
          throw new LocalModelError(e);
        });
      });

    });
    C.Def(function get_or_create(val) {

    });
    C.Def(function spawn(val) {
      var IDB=this.IDB;
      var Mdl=new this.Model(val);
      Object.defineProperty(Mdl,"del",{value:function(callback) {
        var callback=callback || function() {};
        var transaction=IDB.element.result.transaction([Mdl.constructor.modelname],
                                                       "readwrite");
        transaction.objectStore(Mdl.constructor.modelname).delete(this.id);
        transaction.addEventListener("complete",function(e) {
          callback(e);
        });
      }});
      Object.defineProperty(Mdl,"save",{value:function(callback) {
        var callback=callback || function() {};
        var transaction=IDB.element.result.transaction([Mdl.constructor.modelname],
                                                       "readwrite");
        console.debug(this);
        transaction.objectStore(Mdl.constructor.modelname).put(this);
        transaction.addEventListener("complete",function(e) {
          callback(e);
        });
      }});
      return Mdl;
    });
    C.Def(function all(callback) {
      var LDBM=this;
      this.transact(function _all(e) {
        var IDB=e.target.result;
        var transaction = IDB.transaction([LDBM.modelname]);
        var os=transaction.objectStore(LDBM.modelname);
        var cursor=os.openCursor();

        cursor.addEventListener("success",function(e) {
          var c=e.target.result;
          if(c) {
            callback(LDBM.spawn(c.value));
            c.continue();
          }
        });
      });
    });
    C.Def(function get(key,callback) {
      var LDBM=this;
      this.transact(function _get(e) {
        var IDB=e.target.result;
        var transaction = IDB.transaction([LDBM.modelname]);
        var os=transaction.objectStore(LDBM.modelname);
        var req=os.get(key);

        req.addEventListener("success",function(e) {
          callback(LDBM.spawn(e.target.result));
        });
        req.addEventListener("error",function(e) {
          throw new LocalModelError(e);
        });

        //get returns a promise...?
      });
    });

  });
  var LocalDB=M.Class(function C() {
    C.Mixin(events.hasEvents);
    C.Init(function LocalDB(def) {
      if(this instanceof LocalDB) {
        var LDB=this;
        Object.defineProperties(this,{
          dependencies:{configurable:false,writable:true,value:[]},
          version:{configurable:false,writable:true,value:1},
          name:{configurable:false,writable:true,value:"Unnamed"},
          upgrades:{configurable:false,writable:true,value:[] },
          element:{configurable:false,writable:true,value:null},
          state:{configurable:false,writable:true,value:"new"}
        });
        LocalDB.Template={
          Name:function(name) {
            LDB.name=name;
          },
          Model:function(mdef) {
            LDB.version=LDB.version+1;

            var Mdl=new LocalModel(mdef);

            // @FUCK: this is spaghetti code?
            Object.defineProperty(Mdl,"IDB",{enumerable:false,writable:false,configurable:false,value:LDB});

            LDB.upgrades[LDB.upgrades.length]=function(e) {
              console.debug('upgrading');
              var idb=e.target.result;
              var objectStore = idb.createObjectStore(Mdl.modelname,
                                                      { keyPath: "id",
                                                       autoIncrement : true });
            };
            LDB[Mdl.modelname]=Mdl;
          },
        };
        extend(def,LocalDB.Template);
        def();
        LDB.load();


      } else {
        return new LocalDB(def);
      }
    });
    C.Def(function load(callback) {
      var callback=callback || function() {}
      this.element=window.indexedDB.open(this.name,this.version);
      var LDB=this;
      this.element.addEventListener("upgradeneeded",function(e) {
        for(var i in LDB.upgrades) {
          LDB.upgrades[i](e);
        }
      });
      this.element.addEventListener("error",function(e) {
        LDB.state="err";
      });

      this.element.addEventListener("success",function(e) {
        for(var i in LDB.dependencies) {
          LDB.dependencies[i](e);
        }
        LDB.state="loaded";
      });
    });
  });
});
});
});
