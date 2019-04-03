// go build -ldflags "-s -w" -o index.cgi cgi.go

package db

import (
  "fmt"
  "os"
  "github.com/jinzhu/gorm"
  _ "github.com/jinzhu/gorm/dialects/postgres"
  _"github.com/lib/pq"
  "os/user"
  "./models"
  "reflect"
)

func dump(err interface{}) {
  if(err!=nil) {
    eo,_:=os.OpenFile(".dberr", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)

    var todump interface{}

    switch err.(type) {
      case error:
      todump=err.(error).Error()
      break
      case string:
      todump=err
    }
    eo.WriteString(todump.(string)+"\n")
    eo.Close()
  }
}



func Opendb() (*gorm.DB, error) {
  conn:=fmt.Sprintf("dbname=%s password=%s",os.Getenv("PG_DB"),os.Getenv("PG_DB_PW"))
  DB,err := gorm.Open("postgres", conn)

  return DB,err

}


func Initdb( DB *gorm.DB)  {
  for _,tbl := range models.Tables {
    DB.CreateTable(tbl)
  }


  for _,fix := range models.Fixtures {
    DB.Create(fix)
    fmt.Printf("%s: %+v (%+v)\n", DB.NewScope(fix).TableName(),fix,reflect.TypeOf(fix))
  }
}

func Cleardb(DB *gorm.DB) {
  user,err:=user.Current()
  dump(err)

  query:="select tablename from pg_tables where tableowner = ?"
  fmt.Println(query,user.Username)

  rows,err:=DB.Raw(query,user.Username).Rows();
  // dump (err)
  dump(err)

  for rows.Next () {
    var exec string

    err:=rows.Scan (&exec)

    dump(err)
    exec="DROP TABLE "+exec+" CASCADE;";
    fmt.Println(exec)

    DB.Exec(exec)
  }
  rows.Close()
}

