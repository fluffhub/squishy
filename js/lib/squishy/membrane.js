Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "squishy/request",
    "squishy/svg",
    "squishy/form",
    function(event,basic,interactive,Req,svg,form) {

      var Environment=M.Class(function C() {
        C.Def("session",null);
        C.Def("url","/squishy/membrane")
        C.Def("root","/squishy/")
        C.Def("id","pool")

        C.Init(function Environment(id,session,struct) {
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;
          if(id!==undefined) {
            this.id=id;
          }
          this.session=session;
          if(struct instanceof Object) {
            this.root=struct;
          } else {
            this.root={}
          }
          var env=this;
          this.pwd=""
          this.exec("pwd",function(pwd) {
            env.root=pwd;

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
        })


      });



      var Commander=M.Class(function C() {

      });

    });
});
