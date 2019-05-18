package main
import(
  "./db"
  )
func main() {
  DB,_:=db.Opendb()

  db.Cleardb(DB)
  db.Initdb(DB)

  DB.Close()

}
