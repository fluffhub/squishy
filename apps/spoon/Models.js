Module(function M() {
M.Import('squishy/localstorage',function(LM) {
////M.Import('fluff',function(FI) {
  //var Graph=FI.Graph;
  var LocalDB=LM.LocalDB;
  var LocalModel=LM.LocalModel;
  var Local=LocalDB(function L() {
    L.Name("Local");
    L.Model(function Mdl() {
      Mdl.Init(function User(val) {
      });
      Mdl.Template({
        id:1,
        username:"Localuser"
      });
    });
   /* L.Model(function Mdl() {
      Mdl.Init(function Program(obj) {

      });
      Mdl.Def(function spawn(obj) {
        var model=this.__proto__.spawn.call(this,obj);
        var P=new FI.Graph(null, model);
       try {
        P.compile(function() {});
        } catch(e) {
        }
        return P;
      });
      Mdl.Template({
        id:1,
        cls:"fluff#Graph",
        //cls:"fluff#Graph",
        name:"Program",
        nodes:{},wires:{},
        code:"",
      });

    });*/
  /*    L.Model(function Mdl() {
      Mdl.Init(function State(val) {

      });
      Mdl.Template({
        id:'Global',
        value:{}
      });
    });
    */
});

M.Def("Local",Local);
//});
});
});
