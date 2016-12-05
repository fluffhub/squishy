Module(function M() {
  M.Import(
    "squishy/request",
    "squishy/system",
    "squishy/live",
    function(Req,system,live) {

      var Device=M.Class(function C() {
        C.Super(system.Device);
        C.Def("session",null);
        C.Def("url","/squishy/membrane")
        C.Def("root","/squishy/")
        C.Def("id","pool")

        C.Init(function Device(name,struct,session) {
          system.Device.call(this,name);
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;
          if(typeof name=="string") {
            this.name=name;
          }
          this.session=session;
          if(struct instanceof system.Dir) {
            this.root=struct;
          }
          var env=this;
          this.pwd=""
          this.status(function(home) {
            env.home=home.pwd;
            env.root=new M.Self.Dir("/",{});
            env.exec("pwd",function(pwd) {

              var dirs=pwd.split('/')
              var dirname=dirs[dirs.length-1];

              if(dirname=="membrane") {
                pwd=dirs.slice(0,-1).join("/")
              }
              env.pwd=pwd;
            });
          });
        });
        C.Def(function status(result) {
          this.request.Get(this.url+"/membrane.cgi",{op:"status",id:this.id},function(r) {
            result(JSON.parse(r))
          });
        })
        C.Def(function pwd() {

        })
        C.Def(function exec(command,receive) {
          command=command.replace(/;/g,"\u00b6")
          command=command.replace(/\n/,"\u00ac")
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;
          console.debug("sending:"+command);
          this.request.Get(this.url+"/membrane.cgi",{op:"w",cmd:command,id:this.id},function(result){
            console.debug("received:"+command);
            receive(result.slice(0,-1));

          });
        });
        C.Def(function cd(to, upon) {
          var lib=this;
          lib.exec("cd "+to+";pwd",function(val) {
            lib.pwd=val;
            var dirs=val.split('/')
            var dirname=dirs[dirs.length-1];
            var i;
            var curs=lib.dirs;


            if(lib.dirs[val] instanceof Object) {

            } else {
              console.debug("initializing dir "+dirs.join("/"));

            }

            if(upon instanceof Function) { upon.call(this,val) }
          });


        });
      });
      M.Class(function C() {
        C.Super(system.File);
        C.Init(function File(name,value) {
          this.name=null
          this.value=null
          if(typeof name=="string")this.name=name;
          if(value!==undefined) this.value=value;


        });
        C.Def(function read(success) {
          var F=this;
          this.env.exec("cat "+this.loc+"/"+this.name+"",function(val) {
            F.value=val;
            success(val);
          });
        });
        C.Def(function write(value,success) {
          if(value!==undefined) this.value=value;
        });
        C.Def(function rename(name,success) {
          if(typeof name=="string") this.name=name;
        });
      });

      var Dir=M.Class(function C() {
        C.Super(system.Dir);
        C.Init(function Dir(name,contents) {
          if(typeof name=="string") {
            this.name=name
          }
          if(contents!==undefined) {
            this.contents=contents
          } else {
            this.contents={}
          }
        });
        C.Def(function list(success) {
          var dir=this;
          this.env.exec("ls -AF "+this.loc+"",function(val) {
            //"cd "+this.loc+"; cd ~-
            var files=val.split(/[\s]+/);
            console.debug({VAL:val});
            console.debug({files:files});

            files.forEach(function(filename) {
              if(filename.slice(-1)=="/") {
                console.debug("creating dir: "+filename);
                var dirloc=dir.loc+"/"+filename
                var D=new M.Self.Dir(filename);
                D.loc=dirloc;
                dir.contents[filename]=D;
              } else {
                //is a file

                var F=new M.Self.File(filename,dir.loc+"/"+filename,dir.env,function() {
                  if(filename.slice(-1)!="*")
                    this.refresh();
                  this.open();
                });

                dir.contents[filename]=F;
              }

            });
            success.call(dir)
          });
        });
        C.Def(function mkdir(success) {

        });
        C.Def(function rename(success) {

        });
        C.Def(function remove(success) {

        });
        //C.Def(function load() {

        //})

        C.Def(function lookup(loc,success) {

        });
      });

      var Commander=M.Class(function C() {

      });

    });
});
