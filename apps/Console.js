
Module(function M() {
  //console.debug(Import);
  M.Import("squishy/DOM",  "squishy/request", "squishy/form", "apps/spoon/windowing",function(DOM,Req,form,windowing) {
    var f=new DOM.Frame();
    console.debug("imported");
    var Commander=M.Class(function C() {
      C.Def("session",null);
      C.Def("url","/squishy/src")
      C.Def("id","pool")
      C.Super(windowing.AppContainer);
      C.Init(function  Commander(id) {
        windowing.AppContainer.call(this);
        this.request=new Req.Request("URI","TEXT");
        this.request.request.timeout=60000;
        if(id!==undefined) {
          this.id=id;
        } else {
          this.id="pool";
        }

        //var commander=new Commander("pool1");
        var commander=this;
        var input=new form.TextInput("input","",function() {

        });

        var output=new form.TextBox("output")

        var submit=new form.Submit();

        var form=new form.Form("Console",function(e) {
          e.preventDefault();
          commander.send(input.value(),function(result) {
            console.debug("received:"+result);
            input.content(input.content()+result);
          });
        });

        form.Madd(input,output,submit);
        commander.add(form);
      });


      C.Def(function send(command,receive) {
        this.request.Get(this.url+"/membrane.cgi",{op:"w",cmd:command,id:this.id},function(result){
          console.debug("sending:"+command);
          receive(result);

        });
      });
    });

    M.Def(function open() {
      return new Commander();

    });


  });

});

