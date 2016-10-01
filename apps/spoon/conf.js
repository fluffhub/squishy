Module(function M() {
  M.Import("apps/",
           //"spoon/FSE/FileSystem",
           //"spoon/HTMLe/",
           function(spoon) {
             //Import("spoon",function(spoon) {
               console.debug("spoon loaded from conf");
             Import("apps/",function() {console.debug("fse loaded from conf")})
    spoon.openers=spoon.openers+[

      ]
             //});
  });
})
