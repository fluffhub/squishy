package main

import (
  //"fmt"
  //"net/http"
  //"net/http/cgi"
  "os/exec"
  //"strings"
  "bufio"
  //"io/ioutil"
  "os"
//"log"
"io"
//  "math/rand"
//  "strconv"
)
func main() {
var session *exec.Cmd
name:="butt"
  exec.Command("mkfifo",".in_"+name).Start()  
 exec.Command("mkfifo",".out_"+name).Start()
session=exec.Command("sh","-c","cat .in_"+name+" | (sh > .out_"+name+")")
session.Start()

 out,_:=os.Open(".out_"+name)

r:=bufio.NewReader(out)
buf := make([]byte, 0, 4*1024)
for {
n,err:=r.Read(buf[:cap(buf)])
buf=buf[:n]
if n==0 {
if err==nil { 
continue
} 
if err==io.EOF {
break
}
buf := make([]byte, 0, 4*1024)
os.Stdout.Write(buf)
}
if err!=nil && err != io.EOF {

//log.Fatal(err)
}
}
}
