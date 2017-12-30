

Module(function M() {
  //console.debug(Import);
  M.Import(
    "squishy/DOM",
    "squishy/request",
    "squishy/form",
    "apps/spoon/windowing",
    "squishy/membrane",
    "squishy/system",
    "squishy/live",
    "squishy/basic",
    function(DOM,Req,form,windowing,membrane,system,live,basic) {
      console.debug("imported");
      document.styleSheets[0].addRule(".Console>textarea","width: 100%;clear: both;min-height: 80%;");

      document.styleSheets[0].addRule(".Console input[type=\"submit\"]", "position: absolute; right: 0;");

      document.styleSheets[0].addRule(".trans .output","padding: .5em;margin: .5em;border-radius: 1em 0 1em 1em;background-color: rgba(100,100,100,0.5);");
      document.styleSheets[0].addRule(".trans .input","padding: 0.5em;margin: 0.5em;border-radius: 0em 1em 1em 1em; background-color: rgba(100,100,250,0.5);");
}
      var Commander=M.Class(function C() {
        C.Def("session",null);
        C.Def("url","/squishy/src")
        C.Def("id","pool")
        C.Super(windowing.AppContainer);
        C.Init(function  Commander(id) {
          try {
            this.session=new membrane.Device(system.uri("").hostname)
          } catch (e) {
            this.session=live.DeviceManager.devices[system.uri("").hostname].membrane;
          }
          windowing.AppContainer.call(this);
          this.titlebar.content("Membrane Console");
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;
          var commander=this;

          if(id!==undefined) {
            this.id=id;
          } else {
            this.id="pool";
          }
          commander.output=new basic.Div("output");
          commander.contents.add(commander.output);

          Import("squishy/live","squishy/form",function(live,form) {
            var  selector=new form.Selector();
            var manager=live.DeviceManager;
            var devnames=Object.keys(manager.devices);
            for(var i=0;i<devnames.length;i++) {
              var devname=devnames[i];

            }


            //var commander=new Commander("pool1");

            var input=new form.TextInput("input","",function() {

            });

            var submit=new form.Submit();

            var myform=new form.Form("Console",function(e) {
              e.preventDefault();
              var command=input.value();
              commander.send(command,function(result) {
                if(result.trim()!="")
                commander.addTransaction(command,result);
              });
            });
            myform.element.action="#";

            myform.Madd(input,submit);
            commander.contents.add(myform);
          });
        });

        C.Def(function addTransaction(input,output) {
          var commander=this;
          var trans=new basic.Div("trans");
          var out=new basic.Div("output");
          out.content(output);
          var inp=new basic.Div("input");
          inp.content(input);
          trans.Madd(inp,out);
          commander.output.add(trans);
        });

        C.Def(function send(command,receive) {
          this.session.exec(command,receive);
        });
      });

      M.Def(function open() {
        return new Commander();

      });


    });


});
