
Module(function M() {
  M.Import('squishy/events',function(events) {

  var APIModel=M.Class(function C() {
    C.Init(function APIModel(model,name) {
      this.model=model;
      this.name=name;
    });
    C.Mixin({
      /*

      load:function(callback) {
        var that=this;
        $.getJSON('/!user/'+this.id, function(data) {
          that.user=data;
        });
        $.getJSON('/!program/all', function(data) {
          that.programs=data;

          that.draw_programs();
        });
        $.getJSON('/!panel/all', function(data) {
          that.panels=data;
          that.draw_panels();
        });
      },

      */
    	baseUrl:'',
	    loader:function(callback) {
		    var that=this;
		    var callback=callback || function() {};
		    return function(data) {
			    callback(data);
		    };
	    },
      locate:function(name,callback) {
        this.name=name;
        this.request=new Request('URI','JSON');
        this.request.Get(this.makeUrl('locate',name),null,this.loader(callback));
      },
      create:function(callback) {
        var that=this;
        var callback=callback || function() {};
        this.request=new Request('URI','JSON');
        this.request.Get(this.makeUrl('create'),null,this.loader(
          function(data) {
            that.name=data.uid;
            callback(data);
          })
        );
      },
      list:function(data,callback) {
        this.request=new Request('URI','JSON');
        var that=this;
        this.request.Get(this.makeUrl('list',this.name),data,callback);
      },
      update:function(data,ballsack) {
        this.request=new Request('URI','TEXT');
        this.request.Post(this.makeUrl('update',this.uid),data,this.loader(ballsack));
      },
      remove:function(callback) {
        this.request=new Request('URI','TEXT');
        this.request.Get(this.makeUrl('remove',this.uid),null,this.loader(callback));
      },
      makeUrl:function(action,name){
        var args=[''];
        if(action) args.push(action);
        if(this.model) args.push(this.model);
        if(name) args.push(name);
        var url=this.baseUrl+args.join('/');
        return url;
      },
    });
  });

  var LocalApi=M.Class(function C() {
        C.Super(APIModel);
    C.Init(function LocalApi(model,name) {
      this.baseUrl='/please';
      APIModel.call(this,model,name);
    });

  });

  var Model=M.Class(function C() {
     C.Super(LocalApi);
    C.Init(function Model(model,name) {
      if(model)
        this.model=model;
      if(name)
        this.name=name;
      this.values={};
      for(var i in this.columns)
        this.addColumn(this.columns[i].name,this.columns[i]);
    	LocalApi.call(this,model,name);
    });

    C.Mixin({
      model:null,
      encoders:{
        'TimeStamp':function(data) { return data; },
        'DateTime':function(data) {return data; },
        'String':function(data) { return data; },
        'Boolean':function (data) { return data?true:false; },
        'JSON':function(data) { return JSON.stringify(data); }
      },
      decoders:{
        'TimeStamp':function(data) {},
        'DateTime':function(data) {return data; },
        'Boolean':function (data) { return data?true:false; },
        'String':function(data) { return data; },
        'JSON':function(data) { if(data!='undefined'&&data!='null') return JSON.parse(data); else return null; }
      },
      list:function(callback, data, model) {
        var that=this;
        APIModel.prototype.list.call(this,data, function(data) {
          var ret=[];
          for (var i=0;i<data.length;i++) {
            var item=data[i];
            var P=new that.constructor();
            P.decodeFields(item);
            ret.push(P);
          }
          callback(ret);

        });
      },
      create:function(callback) {
        var that=this;
        APIModel.prototype.create.call(this,function(data) {
          var P=new that.constructor();
          P.decodeFields(data);
          callback(P);
        });
      },
      addColumn:function(name,column) {
        var prop={ };
        if(column.default) {
          that.values[name]=this.decoders[column.type](column.defaultValue);
        }
        if(column.live) {
          if(column.editable)
            prop.set=this.setLiveValue(name);
          prop.get=this.getLiveValue(name);
        }
        else {
          if(column.editable)
            prop.set=this.setValue(name);
          prop.get=this.getValue(name);
        }
        Object.defineProperty(this,name,prop);

      },
      pushColumns:function(columns) {
        try {
          if(this.columns.length>=0)
            this.columns=this.columns.concat(columns);
          else throw new Exception();
        }
        catch(e) {
          this.columns=[].concat(columns);
        }
      },
      getValue:function(name) {
        var that=this;
        return function() {
          try {
            return that.values[name];
          } catch(e) {
            return undefined;
          }
        };
      },
      setValue:function(name) {
        var that=this;
        return function(value) {
          that.values[name]=value;
        };
      },
      getLiveValue:function(name) {
        var that=this;
        return function() {
          try {
            return that.values[name];
          }
          catch(E) {
            that.load();
            return that.values[name];
          }
        };
      },
      setLiveValue:function(name) {
        var that=this;
        return function(value) {
          that.values[name]=value;
          that.save();
        };
      },
      decodeFields:function(data,into) {
        var col;
        if(into) {} else into=this.values;
        for (cn in this.columns) {
          col=this.columns[cn];
          if(data[col.name])
            into[col.name]=this.decoders[col.type](data[col.name]);
        }
        return into;
      },
      encodeFields:function(data) {
        var saves={},
            col,
            that=this;

        for (cn in this.columns) {
          col=this.columns[cn];
          if(col.editable)
            saves[col.name]=that.encoders[col.type](that.values[col.name]);
        }
        return saves;
      },
      load:function(callback) {
        var that=this;
        var callback=callback || function(data) {};
        this.locate(this.name,function(data) {
          that.decodeFields(data);
          that.saved=true;
          callback(that.values);
        });
      },
      save:function(callback) {
        var saves={},
            col,
            that=this,
            callback=callback || function(data) {};

        saves=that.encodeFields();
        console.debug(saves);
        this.update(saves,function(data) {
          that.saved=true;
          callback(that.values);
        });
      },
    });
  });

  var BasicModel=M.Class(function C() {
        C.Super(Model);
    C.Init(function BasicModel(model,name) {
      this.name=name;
      this.pushColumns([
            {name:'uid',	editable:false,	type:'String', 				},
            {name:'created',editable:false,	type:'DateTime'				},
            {name:'updated',editable:false,	type:'DateTime'				},
            {name:'data',	editable:true,	type:'JSON', defaultValue:"{}",live:true	}
      ]);

      Model.call(this,model,name);
    });

  });

  var UserModel=M.Class(function C() {
    C.Super(BasicModel);
    C.Init(function UserModel(name) {
      this.pushColumns([{name:'email',editable:false,type:'String'}]);
      this.pushColumns([{name:'username',editable:false,type:'String'}]);
      BasicModel.call(this,'user',name);
    });
  });

  var User=M.Class(function C() {
    C.Super(UserModel);
    C.Init(function User(name,callback) {
      UserModel.call(this,name);
      if(name) {
        this.name=name;
        this.load(callback);
      }
      else {
        ut=readCookie('token');
        if(ut) {
          this.name=ut;
          this.load(callback);
        }
        else {
          var that=this;
          this.create(function() {
            createCookie('token',that.name);
          });

        }
      }
    });
  });

  var ImageModel=M.Class(function C() {
        C.Super(BasicModel);
    C.Init(function ImageModel(name) {
	    BasicModel.call(this,'image',name);
    });

    C.Mixin({
      upload:function(data,callback) {
        var that=this;
        this.request=new Request('URI','JSON');
        this.request.Post(this.makeUrl('upload'),data,
          function(data) {
            that.name=data.uid;
            that.decodeFields(data);
            callback(that.values);
          });
      }
    });
  });

  var ProductModel=M.Class(function C() {
    C.Super(BasicModel);
    C.Init(function ProductModel(name) {

      this.pushColumns([{name:'title',type:'String',editable:true},
                        {name:'description',type:'String',editable:true},
                        //{name:'name',type:'String',editable:true},
                        {name:'type',type:'String',editable:true},
                        {name:'public',type:'Boolean',editable:true}]);
      		  BasicModel.call(this,'products',name);
	  });

  });
});
});
