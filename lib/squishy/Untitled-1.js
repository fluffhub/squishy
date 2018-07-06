
function gimp(code, env) {
    var all=Object.getOwnPropertyNames(window);
    var thisvalue=undefined;
    if(env.this) {
        thisvalue=env.this;
        delete env.this;
    }
    var envnames=Object.keys(env);
    var envvalues=envnames.map(function (v) { return env[v] })


    for(var i=0;i<envnames.length;i++)  {
        var envname=envnames[i];
        var j=all.indexOf(envname);
        if(j>=0) {
            all.splice(j,1);
        }
    }

    return function () {

        Function.apply(thisvalue,envnames.concat(all).concat([code])).apply(env,envvalues);
    }
}

var create=document.createElement.bind(document);

var output=create("textarea");
function write(value) {
    if(value===null) 
        value="null";
    else if(value===undefined)
        value="undefined";
    else if(typeof(value)==="string") {
        value=value;
    } else if(value.toString instanceof Function) {
        value=value.toString();
    }
    output.value=output.value+"\n"+value
}

var input=create("textarea");

var activator=create("input");
activator.setAttribute("type","submit");
activator.addEventListener("click",function(e) {
    gimp(input.value,{console:{debug:write,log:write}});
})

document.body.appendChild(input);
document.body.appendChild(activator);
document.body.appendChild(output);