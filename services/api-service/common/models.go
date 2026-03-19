package common

import "regexp"

var (
	CreateTableRe = regexp.MustCompile(
		`(?is)^\s*create\s+table\s+(if\s+not\s+exists\s+)?(?P<name>(?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s*\(`,
	)

	AlterTableAddColumnRe = regexp.MustCompile(
		`(?is)^\s*alter\s+table\s+(?P<name>(?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s+add\s+column\s+(?P<col>\w+)`,
	)

	DropTableRe = regexp.MustCompile(
		`(?is)^\s*drop\s+table\s+(if\s+exists\s+)?(?P<name>(?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)`,
	)
)

type Config struct {
	JwtSecretKey []byte
	PsqlHost     string
	PsqlPort     int
	PsqlUser     string
	PsqlPassword string
	PsqlDatabase string
}

type DatabaseQueryResult struct {
	Kind         string           `json:"kind"`
	Rows         []map[string]any `json:"rows,omitempty"`
	RowsAffected int64            `json:"rowsAffected,omitempty"`
	Message      string           `json:"message,omitempty"`
}
