Package(function P() {
  P.Templates("control.templates.js");
  P.Block(function B() {
    B.Name("For");
    B.Outputs(1);
    B.Def("repr","For...");
    B.Def("start",1);
    B.Def("end",10);
    B.Def("step",1);
    B.Call(function For() {

      for(var i=start;i<=end;i+=step) {
        $1=i;

      }
    });


  });

  P.Block(function B() {
    B.Name("Timer");
    B.Outputs(1);
    B.Def("repr","Timer");
    B.Def("interval",1);
    B.Def("running",true);
    B.Def("previous",0);
    B.Call(function Timer() {
      $1=previous;
      window.setTimeout(function timer() {
        $1=previous++;
        window.setTimeout(function() {

          timer();
        },interval*1000);
      },interval*1000);


    });


  });
});
