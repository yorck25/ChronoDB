package version

import (
	"backend/core"
	"fmt"
	"math/rand/v2"
	"strings"

	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(ctx *core.WebContext) *Repository {
	return &Repository{db: ctx.GetDb()}
}

func GetCreateTableUpScript(tableName string, columns []CreateColumnRequest) (SQLScript, error) {
	script := SQLScript{
		ID:     rand.IntN(1000000),
		Script: "",
	}

	if len(columns) == 0 {
		return script, fmt.Errorf("no columns provided")
	}

	var columnDefs []string
	var primaryKeys []string

	for _, col := range columns {
		def := fmt.Sprintf("%s %s", col.Name, col.Type)

		if col.Nullable {
			def += " NOT NULL"
		}

		if col.Default != "" {
			def += fmt.Sprintf(" DEFAULT %s", col.Default)
		}

		columnDefs = append(columnDefs, def)

		if col.PrimaryKey {
			primaryKeys = append(primaryKeys, col.Name)
		}
	}

	if len(primaryKeys) > 0 {
		columnDefs = append(columnDefs, fmt.Sprintf("PRIMARY KEY (%s)", strings.Join(primaryKeys, ", ")))
	}

	upScript := fmt.Sprintf(
		"CREATE TABLE %s (\n  %s\n);",
		tableName,
		strings.Join(columnDefs, ",\n  "),
	)

	script.Script = upScript

	return script, nil
}

func GetCreateTableDownScript(tableName string) (SQLScript, error) {
	script := SQLScript{
		ID:     rand.IntN(1000000),
		Script: "",
	}

	downScript := fmt.Sprintf("DROP TABLE %s", tableName)
	fmt.Println(tableName)

	script.Script = downScript

	return script, nil
}

func (r *Repository) CreateTable(ctr CreateTableRequest) error {

	stmt, err := r.db.PrepareNamed("INSERT INTO versions (version, up, down, state, project_id) VALUES (:version, :up, :down, :state, :projectId)")
	if err != nil {
		return err
	}

	upScript, err := GetCreateTableUpScript(ctr.TableName, ctr.Columns)
	if err != nil {
		return err
	}

	downScript, err := GetCreateTableDownScript(ctr.TableName)
	if err != nil {
		return err
	}

	params := map[string]any{
		"version":   "v1.0.0",
		"up":        upScript,
		"down":      downScript,
		"state":     "pending",
		"projectId": ctr.ProjectID,
	}

	_, err = stmt.Exec(params)
	return err
}
