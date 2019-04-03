Package(function P() {
  var Operator=P.Block(function B() {
    B.Def('dimensions',{x:0,y:0,w:30,h:30});
    B.Name('Operator');
    B.Inputs(1,2);
    B.Outputs(3);
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','>=');
    B.Call(function gte() {
      $3=$2>=$1;
    });
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','<=');
    B.Call(function lte() {
      $3=$2<=$1;
    });
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','==');
    B.Call(function eq() {
      $3=$2==$1;
    });
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','&');
    B.Call(function And() {
      $3=$2&&$1;
    });
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','+');
    B.Call(function plus() {
      $3=$2+$1;
    });
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','-');
    B.Call(function minus() {
      $3=$2-$1;
    });
  });
  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','*');
    B.Call(function mult() {
      $3=$2*$1;
    });
  });

  P.Block(function B() {
    B.Super(Operator);
    B.Def('repr','/');
    B.Call(function div() {
      $3=$2/$1;
    });
  });
});
