package main
import(
	"io"
	"net/http"
)
type Shell interface {
	Dump(err error)
	Log(value string) 
	ReadAll(writer io.Writer) 
	ReadTo(writer io.Writer) 
	Check() byte 
	Init(name string, w http.ResponseWriter, r *http.Request) 
	Destroy() 
	Await(interrupt bool) 
	Unhold() 
	//Write(data []byte) 
	Exec(data []byte)
}


func Shells() map[string]Shell {
	return map[string]Shell {
	"static":&StaticShell{},
	"tty":&TtyShell{},
	}
}