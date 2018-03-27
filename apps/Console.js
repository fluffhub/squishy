

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
    "spoon",
    function(DOM,Req,form,windowing,membrane,system,live,basic,spoon) {
      console.debug("imported");
      document.styleSheets[0].addRule(".Console>textarea","width: 100%;clear: both;min-height: 80%;");
      document.styleSheets[0].addRule(".trans","display: inline-block;position: relative;box-sizing: border-box;")
      document.styleSheets[0].addRule(".Console input[type=\"submit\"]", "position: absolute; right: 0;");

      document.styleSheets[0].addRule(".trans .output","padding: .5em;margin: .5em;border-radius: 1em 0 1em 1em;background-color: rgba(100,100,100,0.5);float:right;display:inline-block;");
      document.styleSheets[0].addRule(".trans .input","padding: 0.5em;margin: 0.5em;border-radius: 0em 1em 1em 1em; background-color: rgba(100,100,250,0.5);float:left;clear:right;display:inline-block;");
      document.styleSheets[0].addRule(".trans.loading","background-color:purple;");
      document.styleSheets[0].addRule(".output p","margin:0;");
      document.styleSheets[0].addRule(".Console","position: absolute;bottom: 0;width: 100%;");
      document.styleSheets[0].addRule(".Console>input:first-child","position: absolute;bottom: 0;width: 100%;");

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
              input.element.focus();
              input.element.select();
              var update=commander.addTransaction(command);
              commander.send(command,function(result) {
                update(result);
                commander.contents.element.scrollTop=commander.contents.element.scrollHeight;
              });
            });
            myform.element.action="#";

            myform.Madd(input,submit);
            commander.add(myform);
          });
        });

        C.Def(function addTransaction(input) {
          var commander=this;
          var trans=new basic.Div("trans");
          var inp=new basic.Div("input");
          inp.content(input);
          trans.add(inp);
          trans.addClass("loading");
          commander.output.add(trans);
          return function(output) {
            trans.removeClass("loading");
            if(output.trim()!="") {
              var out=new basic.Div("output");
              var outwords=output.split("\n");
              for(var i=0;i<outwords.length;i++) {
                out.add(new basic.P(outwords[i]));
              }
              trans.add(out);
            }

          }


        });

        C.Def(function send(command,receive) {
          this.session.exec(command,receive);
        });
      });

      var open=M.Def(function open() {
        return new Commander();

      });
      spoon.main.addApp("console",open);

    });


});
