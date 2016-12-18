Module(function M() {
  M.Import(
    "squishy/request",
    "squishy/system",
    "squishy/live",
    function(Req,system,live) {
      var default_url="/squishy/membrane"
      var default_root="/squishy/"
      var default_id="pool"
      var Device=M.Class(function C() {
        C.Super(system.Device);
        C.Def("session",null);
        C.Def("url",default_url)
        C.Def("root",default_root)
        C.Def("id",default_id)

        C.Init(function Device(path, name) {
          if(typeof name=="string") {
            this.name=name
          } else {
            name=this.name="membrane"
          }


          system.Device.call(this,path,name);
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;

          var env=this;

          this.pwd=""
          var home=system.uri("").pathname
          function assign(pwd) {
            env.pwd=pwd;
            env.home=pwd;
            env.root=new M.Self.Dir("/",{});
            env.root.loc="/";
            env.root.env=env;
            var dirs=pwd.split("/");
            var dirname,dir;
            var cursor=env.root.contents;
            var i;
            if(dirs[0]=="") i=1;
            else i=0;
            console.debug(pwd);
            for (;i<dirs.length;i++) {
              dirname=dirs[i];
              dir=new M.Self.Dir(dirname,{});
              dir.env=env;
              dir.loc=dirs.slice(0,i).join('/');
              console.debug({pwd:dir.loc})
              cursor[dirname]=dir;
              cursor=dir.contents;


            }
            dir.list(function (ls) {
              console.debug({ls:this});
            });
          }
          this.status(function(status) {
            var home=status.home;

            // env.exec("pwd",function(pwd) {

            var dirs=home.split('/');
            var dirname=dirs[dirs.length-1];

            if(dirname=="membrane") {
              home=dirs.slice(0,-1).join("/")
              //  env.cd("..",function(pwd) {
              //    assign(pwd);
              //  })

            } else {


            }
            assign(home);
            //});
          });

        });
        C.Def(function retrieve(path, result) {
          if(path[0]=="/") {
            //use absolute path to membrane host

          } else {
            path=this.home+"/"+path;

          }
          var dirs=path.split("/");
          var cursor=this.root;
          var i=dirs.length;

          var fn=dirs[dirs.length-1];
          if(fn in cursor.contents) {
            result( cursor.contents[fn]);
          } else {

          }
        });
        C.Def(function status(result) {
          this.request.Get(this.url+"/membrane.cgi",{op:"status",id:this.id},function(r) {
            result(JSON.parse(r));
          });
        });
        C.Def(function pwd() {

        });
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


            if(upon instanceof Function) { upon.call(this,val) }
          });


        });
      });
      M.Class(function C() {
        C.Super(system.File);
        C.Init(function File(name,loc,env) {
          this.name=null
          this.value=null
         // this.env=env;
          this.loc=loc;

          Object.defineProperty(this,"env",{writable:true,enumerable:false,configurable:false,value:env })
          if(typeof name=="string")this.name=name;
          //if(value!==undefined) this.value=value;


        });
        C.Def(function read(success) {
          var F=this;
          this.env.exec("cat "+this.loc,function(val) {
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
          Object.defineProperty(this,"env",{writable:true,enumerable:false,configurable:false })
        });
        C.Def(function list(success) {
          var dir=this;
          this.env.exec("ls -AF "+this.loc+"",function(val) {
            //"cd "+this.loc+"; cd ~-
            var files=val.split(/[\s]+/);

            console.debug({VAL:val});
            console.debug({files:files});

            files.forEach(function(filename) {
              var tokens=filename.match(/^([\w.]+)([\W]?)$/)
              var F;
              if(tokens[1] in dir.contents) {

              } else {
                var dirloc=dir.loc+"/"+tokens[1]
                if(tokens[2]=="/") {


                  F=new M.Self.Dir(tokens[1]);
                  F.loc=dirloc;
                  F.env=dir.env;

                } else {
                  //is a file

                  F=new M.Self.File(tokens[1],dirloc,dir.env,function() {
                    if(tokens[2]!="*")
                      this.refresh();
                    this.open();
                  });


                }

                dir.contents[tokens[1]]=F;
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

