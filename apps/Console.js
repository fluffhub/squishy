Module(function M() {
  //console.debug(Import);
  M.Import(
    "squishy/DOM",
    "squishy/request",
    "squishy/form",
    "squishy/membrane",
    "squishy/system",
    "squishy/live",
    "squishy/basic",
    "squishy/styles",
    "spoon",
    "spoon/windowing",
    function(DOM,Req,form,membrane,system,live,basic,styles,spoon,windowing) {
      M.Style(function S() {
        S.addRule(".Console .acc form ", "position:absolute;bottom:0;height:2em;width:100%;display:flex;")
        S.addRule(".Console .acc textarea",{width: "100%",clear: "both",'min-height': "80%"});
        S.addRule(".Console .acc .trans",{display: "block",width:"100%",position: "relative",'box-sizing': "border-box"});
        S.addRule(".Console .acc form input[type=\"submit\"]", "flex:0 0 2em;border:none; display:block;width:2em;bottom:0px;line-height:2em;font-family:monospace serif;position: absolute; right: 0;");
        S.addRule(".Console .acc form input:first-child",{flex:"1 1 auto", "text-indent":"0.5em", border:"none","font-family":"monospace, serif"});
       
        S.addRule(".Console .acc .tty p","padding:0 0.5em; display:inline-block;float:left;clear:both;");
        S.addRule(".Console .acc .tty", "position:absolute;left:0;right:0;top:0;bottom:2em;overflow:scroll;font-family:monospace serif;")

        S.addRule(".Console","position: absolute;");
      });

      var Commander=M.Class(function C() {
        C.Def("url","/squishy/src")
        C.Def("id","pool")

        C.Super(windowing.AppContainer);

        C.Init(function Commander(id) {
          try {
            Object.defineProperty(this, "session", { value:new membrane.Device(system.uri("").hostname) });
          } catch (e) {
            Object.defineProperty(this,"session", { value:live.DeviceManager.devices[system.uri("").hostname].membrane});
          }
          windowing.AppContainer.call(this);
          this.titlebar.content("Membrane Console");
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;
          var commander=this;
          this.addClass("Console");
          if(id!==undefined) {
            this.id=id;
          } else {
            this.id="pool";
          }
          commander.output=new basic.Div("tty");
          commander.contents.add(commander.output);

          Import("squishy/live","squishy/form",function(live,form) {
            var  selector=new form.Selector();
            var manager=live.DeviceManager;
            var devnames=Object.keys(manager.devices);
            for(var i=0;i<devnames.length;i++) {
              var devname=devnames[i];
            }
            var input=new form.TextInput("input","",function() { 

            });

            var submit=new form.Submit();

            var myform=new form.Form(undefined,function(e) {
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
            commander.contents.add(myform);
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
      spoon.main.addApp("console",M.Self);
    });
});
