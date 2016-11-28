package main
import ( 
"os"
)
func dump(err error) {
  if(err!=nil) {
    eo,_:=os.OpenFile(".err", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
    eo.WriteString(err.Error())
    eo.Close()
  }
}
func main() {
//p,_:=os.FindProcess(4427)
name:="_"
   in,err:=os.OpenFile(".in_"+name, os.O_WRONLY | os.O_CREATE | os.O_TRUNC, 0777)
	dump(err)

in.Write([]byte("ls"))

out,err:=os.Open(".out_"+name)
dump(err)
//     for {
            bn:=make([]byte,1024)
            n,_:=out.Read(bn)
             _,_=os.Stdout.Write(bn)
            if( n==0 ){ 
    //             break
            } 
//}
}
