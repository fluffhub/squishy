

Module(function M() {
  //console.debug(Import);
  M.Import("squishy/DOM",
           "squishy/request",
           "squishy/form",
           "apps/spoon/windowing",
           "squishy/membrane",
           "squishy/system",
           "squishy/live",
           function(DOM,Req,form,windowing,membrane,system,live) {
             console.debug("imported");
             document.styleSheets[0].addRule(".Console>textarea","width: 100%;clear: both;min-height: 80%;");

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
                     var output=new form.TextBox("output")

                     var submit=new form.Submit();

                     var myform=new form.Form("Console",function(e) {
                       e.preventDefault();
                       commander.send(input.value(),function(result) {
                         console.debug("received:"+result);
                         input.content(input.content()+result);
                       });
                     });

                     myform.Madd(output,input,submit);
                     commander.add(myform);
                   });


                 });
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

