// Basic types:
// Pkg 
//		- App
//		- Lib
// Wrkr
//		- Auto
//		- HMI
package main

import (
	"fmt"
	"errors"
	"os"
	"io/ioutil"
	"bytes"
	"strings"
	"os/exec"
	"path/filepath"
	
)

const template_root = "/var/www/templates"

type Package struct {
	Type string
	Name string
	Template string
	Path string
	GitRepo bool
	Membrane bool
	Context Env
	status byte
}
/*
const USERFOUND = 1
const DIRFOUND = 2
const INDEXFOUND = 4
const READMEFOUND = 8
const HTACCESSFOUND = 16
const PKGFOUND = 32
*/
const GITFOUND = 64
const HTMLFOUND = 128

func (p Package) Check() byte{
	var status byte = 0
	if _, err := exec.Command("id -u "+p.Name).Output(); err!=nil {
		status = USERFOUND | status
	} 
	public_dir := "/home/"+p.Name+"/public"
	dir,err := os.Open(public_dir)
	if err!=nil {
		if stat, err:=dir.Stat(); err==nil && stat.IsDir() {
			status = DIRFOUND | status
			files := []string{"index.html","README.md",".htaccess"}
			checks := []byte{INDEXFOUND, READMEFOUND, HTACCESSFOUND}
			for i, fn := range files {
				_,err:=os.Open(public_dir+"/"+fn)
				if(err==nil) {
					status = checks[i] | status
				}
			}			
		}
	}
	p.status=status
	return status
}
func ApplyTemplate(path string, context Env) ([]byte, error) {
	data, err:=ioutil.ReadFile(path);
	
	if err==nil {
		if data[0]==byte('#') && data[1]==byte('!') {
			return data, errors.New("scriptfile")
		} else {
			for name, value := range context {
				bytes.Replace(data, []byte(name), []byte(value), -1)	
			}
			bytes.Replace(data, []byte("'"), []byte("\\'"))
			bytes.Replace(data, []byte("$"), []byte("\\$"))
		} 
	}
	return data, err
}

func (p Package) LoadTemplate(template string, context Env) []Cmd {
	cmds := []Cmd{}
	if template_dir, err := os.Open(template); err==nil {
		if stat, err:=template_dir.Stat(); err==nil && stat.IsDir() {
			err := filepath.Walk(template, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					fmt.Printf("failure 	accessing a path %q: %v\n", path, err)
					return err
				}
				if path!=template {
					targetpath := p.Path+"/public"+path[len(template):]	
					fmt.Printf("targetpath: %s\n", targetpath)
					mode:=info.Mode()
					if mode & os.ModeSymlink != 0 {
						// full copy the symlink file to retain its link
						cmds=append(cmds, Exec{Cmd:fmt.Sprintf("su {name} -c cp -av %s %s", path, targetpath), Sudo:true})					
					} else if info.IsDir() {
						cmds=append(cmds, Exec{Cmd:fmt.Sprintf("su {name} -c mkdir -p %s", targetpath), Sudo:true})
					} else if mode.IsRegular() {
						// The only other possibility is a regular text file.
						tokens := strings.Split(path, ".")
						ext := tokens[len(tokens)-1]	
						copyonly := false
						fmt.Printf("Checking extension of %s, is %s\n", path, ext)
						if ext!="cgi" {
							result, err:=ApplyTemplate(path, context); 
							err==nil {
								cmds=append(cmds, Exec{Cmd:fmt.Sprintf("su {name} -c 'cat <<EOF > %s\n%s\nEOF'", targetpath, result), Sudo:true})
								return
							}
						}
						fmt.Printf("Encountered applying template %v %v, %s, %s;\n", err, context, path, fmt.Sprintf("su {name} -c cat <<EOF > %s\n%s\nEOF", targetpath, result))
						cmds=append(cmds, Exec{Cmd:fmt.Sprintf("su {name} -c 'cp %s %s", path, targetpath)})									
					} else if mode & 0111 != 0 {
						// File is executable - just create a symlink to it in the target dir
						cmds=append(cmds, Exec{Cmd:fmt.Sprintf("su {name} -c ln -s %s %s", path, targetpath), Sudo:true})
					}  else {
						fmt.Printf("File will not be copied, %s <%s>", path, mode)
					}		
				}
				return nil
			})
			if err != nil {
				fmt.Printf("Failed to traverse dir "+template)
			}
		} else {
			fmt.Printf("ERR Template dir <%s>, not a dir", template)
		}
	} else {
		fmt.Printf("Template dir <%s>, not found", template)
	}
	return cmds
}

/* 
	Initialize copies the files referenced by src, 
	if provided, into a new instance of Package. 
*/

func (p Package) Delete() error {
	cmds:=Seq{ Vars:Env{"{name}":p.Name} }

	cmds.Push(
		Exec{Cmd:"deluser {name}", Sudo:true},
		Exec{Cmd:"rm -r /home/{name}",  Sudo:true},
	)
	return cmds.Run()
}

func (p Package) Initialize(overwrite bool,  name string, src string) error {
	template_name := p.Template
	path := src
	status:=p.Check()
	p.status=status
	p.Name=name
    dirname := p.Name
    targetpath:=""
	targetdir:=""
	homedir := fmt.Sprintf("/home/%s", dirname)
	p.Path = homedir

	fmt.Printf("Locating source file(s) %s\n", src)
	
	targetpath=fmt.Sprintf("%s/public/%s",homedir, p.Type)
	targetdir=fmt.Sprintf("%s/public", homedir)
	dirname=p.Name
    if fi,err := os.Stat(src); err==nil {
		if !fi.Mode().IsDir() {
			fmt.Printf("Found source file %s\n", src)
			dirname=strings.Split(p.Name, ".")[0]
			targetpath=fmt.Sprintf("%s/public/%s/%s",homedir,p.Type,p.Name)
			targetdir=targetpath
		} else  {
			fmt.Printf("Found source files in %s\n", src)
			//path=path+"/"
		}
	} else {
		// copy source not found locally, maybe try https:// etc here
		fmt.Printf("%s source dir not found, not copying.", src)
	}

	p.Context = Env {
		"{name}":dirname,
		"{type}":p.Type,
		"{git_root}":fmt.Sprintf("%s/repo.git",homedir),
		"{path}":path, 
		"{targetdir}":targetdir,
		"{targetpath}":targetpath,
	}
	fmt.Printf("\nSetting context: %v\n\n", p.Context)
	cmds := Seq{Vars:p.Context}
	
	cmds.Push(
        Cond{Cmd:"useradd -m {name}", Do:overwrite || !(USERFOUND & status == USERFOUND), Sudo:true},
        Exec{Cmd:"mkdir -p {targetdir}/{type}", Sudo:true},
		Exec{Cmd:"mkdir -p /var/www/indexes", Sudo:true},
		Cond{Do:overwrite, Cmd:"cp -TRf {path} {targetdir}/{type}", Else:"cp -TRn {path} {targetdir}/{type}",Sudo:true},
		Exec{Cmd:"chown -R {name} /home/{name}", Sudo:true},	
	)
	/*cmds.Push(
		Exec{Cmd:"mkdir -p /tmp/{name}"},
		Exec{Cmd:"cp -r {path} /tmp/{name}/{type}"},
		Cond{Do:overwrite, Cmd:"cp -rf /tmp/{name}/{type} {targetdir}", Else:"cp -rn /tmp/{name}/{type} {targetdir}"},
	)*/
//	cmds.Push(p.LoadTemplate(path, Env{})...)
	fmt.Printf("Loading template %s...\n", template_root+"/"+template_name)
	cmds.Push(p.LoadTemplate(template_root+"/"+template_name, p.Context)...)

	if p.GitRepo {
		cmds.Push(Exec{Sudo:true, Cmd:`su {name} -c '
			ln -s /usr/lib/git-core/git-http-backend /home/{name}/public/git;
			git config --global user.email app_{name}@fluffbase.com;
			git config --global user.name "{name}";
			cd /home/{name};
			git --bare  init repo.git;
			cd public;
			git init .;
			git add .;
			git commit -m "Initial commit of {name}";
			git remote add fs file:///home/{name}/repo.git;
			git push fs master;
			'`})
	}
/*	if p.Membrane {
		cmds.Push(Exec{Sudo:true,
			Cmd:"su {name} -c 'ln -s /home/admin/go/bin/membrane /home/{name}/public/membrane'",
		})
	}*/

	if overwrite {
		p.Delete()
	}
	fmt.Printf("\nRunning commands: %v\n\n", cmds)
	
	err := cmds.Run()
	if (err != nil) {
		fmt.Printf("Failed to complete sequence %v.\n",cmds)
		return err
	}
	return err
}

func init() {
	addHostess("pkg-app", Package{Template:"pkg", Type:"app", GitRepo:true, Membrane:true})
	addHostess("pkg-lib", Package{Template:"pkg", Type:"lib", GitRepo:true, Membrane:true})
}