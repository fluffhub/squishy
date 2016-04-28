        var splitter=/(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)/
         var i=-1;
         var result=samplepage;

         var chunk=true
          while(chunk&&i+chunk.length<samplepage.length) {
          chunk=splitter.exec(result)
          if(chunk&&chunk.index>i) {
            var Code=new DOM.Tag({type:"div",cls:"content right",content:result.slice(i,chunk.index)})
                                  i=chunk.index;
                                  Content.add(Code);

          }
            if(chunk) {
           result=result.slice(i+chunk.length);

           var Comment=new DOM.Tag({type:"div",cls:"content left",content:chunk});
           Content.add(Comment);
            }
          }
