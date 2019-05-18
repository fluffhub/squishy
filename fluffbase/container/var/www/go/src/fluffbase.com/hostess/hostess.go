package main

import(
    "io"
    "os"
    "strings"
    "os/exec"
    "bytes"
	"github.com/google/shlex"
    "fmt"
    "github.com/kr/pty"
)

type Hostess interface {
    Initialize(bool, string, string) error
    Check() byte
}

const USERFOUND = 1
const DIRFOUND = 2
const INDEXFOUND = 4
const READMEFOUND = 8
const HTACCESSFOUND = 16
const PKGFOUND = 32

type Seq struct {
    Vars Env
    Cmds []Cmd
    
}
func (s *Seq) Push(cmds ...Cmd) {
    for i,cmd := range cmds {
        fmt.Printf("Adding %dth command: %s\n", i, cmd)
        s.Cmds = append(s.Cmds, cmd)
    }
    fmt.Printf("\nAdded all commands, now is %v\n\n", s.Cmds)
}
func (s *Seq) Run() error {
    fmt.Printf("\nRunning me, %v\n\n", s)

    for _, cmd := range s.Cmds {
        fmt.Printf("Running %s\n", cmd )
		err := cmd.Run(s.Vars)
		if err!=nil {
            return err
		}
    }
    return nil
}

type Env map[string]string
func (v Env)Format(str string) string {
    for k,v := range v {
        str = strings.Replace(str, k, v, -1)
    }
    return str
}

type Exec struct {
    Cmd string
    Sudo bool
    Pty bool
}
func (e Exec) Run(envs ...Env) error {
    cmd := e.Cmd
    if e.Sudo {
        cmd = fmt.Sprintf("/usr/bin/sudo %s", cmd)
    }
    fmt.Printf("FMT\t%s\n", cmd)
    if len(envs)>0 {
        for _,env := range envs {
            cmd=env.Format(cmd)
        }
    }
    args, err := shlex.Split(cmd)
    runnable := exec.Command(args[0], args[1:]...)
    //if err!=nil {
    fmt.Printf("RUN\t%s\n", cmd)
    var stderr bytes.Buffer
    runnable.Stderr = &stderr
    f, err2 := pty.Start(runnable)
    if err2!=nil {
        fmt.Printf("\n\nError running %s; %v; %s\n\n", cmd, err2, stderr.String())
        return err2
    }
    io.Copy(os.Stdout, f)
    //} else {
    //    fmt.Printf("%v... %v\n", args, err)
    //}
    return err
}



type Cond struct {
    Cmd string
    Sudo bool
    Do bool
    Else string
    Pty bool
}
func (c Cond) Run (env ...Env) error {
    if c.Do {
        return Exec{Cmd:c.Cmd, Sudo:c.Sudo}.Run(env...)
    } 
    if c.Else != "" {
        return Exec{Cmd:c.Else, Sudo:c.Sudo}.Run(env...)
    }
    return nil    
}
type Cmd interface {
    Run(...Env) error
}




var Hostesses = make(map[string]Hostess)
func addHostess(name string, hostess Hostess) {
    Hostesses[name] = hostess
}

type Action func()


func main() {
    args := os.Args
    
    hostess_name := args[1]
    action := args[2]

    if action == "create" {
        name := args[3]
        
        src := ""
        if len(args)>4 {
            src = args[4]
        }
        

        hst := Hostesses[hostess_name]
        fmt.Printf("Starting initialize of %v\n", hst)
        err := hst.Initialize(true, name, src)    
        if err != nil {
            fmt.Printf("Error, %v\n", err)
        }   
    }
    if action == "delete" {

    }
    return
}