

Module(function M() {
  //console.debug(Import);
  M.Import("squishy/DOM",
           "squishy/request",
           "squishy/form",
           "apps/spoon/windowing",
           "squishy/membrane",
           "squishy/system",
           function(DOM,Req,form,windowing,membrane,system) {
             console.debug("imported");
               document.styleSheets[0].addRule(".Console>textarea","width: 100%;clear: both;min-height: 80%;");

             var Commander=M.Class(function C() {
               C.Def("session",null);
               C.Def("url","/squishy/src")
               C.Def("id","pool")
               C.Super(windowing.AppContainer);
               C.Init(function  Commander(id) {
                 this.session=new membrane.Device(system.uri("").href)
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
                 Import("squishy/form",function(form) {
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

                   form.Madd(output,input,submit);
                   commander.add(form);
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

