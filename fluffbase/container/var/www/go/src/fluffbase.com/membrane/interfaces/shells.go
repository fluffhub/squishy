package interfaces
import(
	"io"
	"net/http"
)

const NAMEFOUND = 1
const DIRFOUND = 2
const INFOUND = 4
const OUTFOUND = 8
const PROCFOUND = 16
const PWDFOUND = 32


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

var Shells map[string]Shell

func init() {
	Shells = make(map[string]Shell)	
}