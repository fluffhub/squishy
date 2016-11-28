package main
import("os"
//"os/exec"
//"fmt"
)
func main() {
//f,err:=os.Open(".test")
f,err:=os.OpenFile(".in_butt", os.O_WRONLY, 0666)
if err != nil { panic(err) }
//for {
//n,err:=fmt.Fprintf(f,"ls")
f.Write([]byte("ls"))
f.Write([]byte(";\n\n"))
//if err!=nil && n>0 { panic(err) }

//}
f.Close()
return 
}

