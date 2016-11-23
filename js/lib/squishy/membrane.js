Module(function M() {
  M.Import(
    "squishy/request",
    "squishy/system",
    function(Req,system) {

      var Device=M.Class(function C() {
        C.Super(system.Device);
        C.Def("session",null);
        /*these are default values and should be updated via the init command */
        C.Def("url","/squishy/membrane")
        C.Def("webroot","/squishy/")
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
          this.exec("pwd",function(pwd) {

            var dirs=pwd.split('/')
            var dirname=dirs[dirs.length-1];

            if(dirname=="membrane") {
              pwd=dirs.slice(0,-1).join("/")
            }

            env.home=pwd;
            env.root=new Dir
          });
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
      });
      M.Class(function C() {
        C.Super(system.File);
        C.Init(function File(name,value) {

          this.name=null
          this.value=null
          if(typeof name=="string") {
            name=name.split(/\W/)[0]
            this.name=name;
          }
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
