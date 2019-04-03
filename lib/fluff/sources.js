Package(function P() {
  var Source=P.Block(function B() {
    B.Name('Source');
   // B.Inputs(1,2);
    B.Outputs(3);
  });

  P.Block(function B() {
    B.Super(Source);
    B.Def('repr','clock');
    B.Call(function clock() {
      $1=Date.time.now()
    });
  });
  P.Block(function B() {
    B.Super(Source);
    B.Def('repr','random');
    B.Call(function random() {
      $1=Date.time.now()
    });
  });
  P.Block(function B() {
    B.Super(Source);
    B.Def('repr','counter');
    B.Def('start',1);
    B.Def('step',1);
    B.Call(function counter() {
      if($1!=null) $1=$1+this.step;
      else $1=this.start;
    });
  });
  P.Block(function B() {
    B.Super(Source);
    B.Def('repr','constant');
    B.Def('value',0)
    B.Call(function Source() {
      $1=this.value;
    });
  });
});
