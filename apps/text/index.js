Module(function M() {
  M.Import(
    "spoon","basic","system","live",
    //  context actions
    //  list view
    //  tile view
    //  editor
    //  viewer
    function (spoon,basic,system,live) {
      M.Def(function match(file,name) {
        if (file instanceof system.File) {// || typeof file=="string" ) {
          return true;

        }

      });
      var TextEditor=M.Class(function C() {
        C.Super(basic.Div)
        C.Init(function TextEditor(loc,items) {
          basic.Div.call(this);
          live.DeviceManager.retrieve(loc,function(results) {
            console.debug("ok");
          });
          });
          this.addClass("TextEditor");

        });
      });
      M.Class(function C() {
        C.Super(spoon.Tile);
        C.Init(function Tile() {

        });
      });

      M.Class(function C() {
        C.Init(function ListItem() {

        });
      });

      M.Class(function C() {
        C.Init(function Icon() {

        });
      });
      M.Class(function C() {
        C.Init(function Editor() {

        });
      });

      M.Class(function C() {
        C.Init(function Viewer() {

        });
      });
      M.Def(function open(loc) {
        return new TextEditor(loc);

      });


    });
});
