Module(function M () {
  M.Import("squishy/svg",function(svg) {
    SquishyLogo=new svg.SVG(100,100);
    SquishyLogo.addClass("sitemenu");
    var svglogo=new svg.SVG({src:"img/squishy.svg",onload:function(svg) {
      var logo=svg.query("#SquishyLogo")[0];
      console.debug({squishylogo:logo,svg:svg});
      logo.remove();
      SquishyLogo.add(logo);
      SquishyLogo.NSattrs({viewbox:"0 0 100 100"});
    }})
    Content.add(SquishyLogo);
  });
});
