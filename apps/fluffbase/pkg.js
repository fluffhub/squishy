Module(function M () {
    M.Import(
    "/lib/squishy/", 
    "squishy/DOM", 
    "squishy/basic", function(squishy,DOM, basic)  {
        M.Import(
        "/app/spoon/",
        "/app/fork/", 
        "app/spoon/windowing", function(spoon, fork, windowing) {
            M.Class(function C() {
                C.Super(DOM.Frame);
                C.Init(function Package(src) {
                    DOM.Frame.call(this, )
                    if(src instanceof Element) {

                        var contents = new DOM.Tag(src.querySelector("#contents"))

                    } else if(typeof (src) === "string") {

                    }
                });
            });
        });
    });
});