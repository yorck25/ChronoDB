package connectors

import (
	"backend/common"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"

	_ "github.com/denisenkom/go-mssqldb"
)

func (m *MSSQLConnector) Connect(connectionString string) (*sql.DB, error) {
	fmt.Println("Connecting to MSSQL...")
	db, err := sql.Open("sqlserver", connectionString)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func (m *MSSQLConnector) BuildConnectionString(projectID int, metaDB *sqlx.DB) (string, error) {
	query := `
		SELECT database_auth
		FROM projects_credentials
		WHERE project_id = $1
	`
	var authJSON string
	if err := metaDB.QueryRow(query, projectID).Scan(&authJSON); err != nil {
		return "", err
	}

	var auth DatabaseAuth
	if err := json.Unmarshal([]byte(authJSON), &auth.DatabaseAuth); err != nil {
		return "", fmt.Errorf("failed to parse database_auth JSON: %v", err)
	}

	decode := func(s string) string {
		if s == "" {
			return ""
		}
		data, err := base64.StdEncoding.DecodeString(s)
		if err != nil {
			return s
		}
		return string(data)
	}

	connectionString := fmt.Sprintf(
		"sqlserver://%s:%s@%s:%s?database=%s",
		decode(auth.DatabaseAuth["Username"]),
		decode(auth.DatabaseAuth["Password"]),
		decode(auth.DatabaseAuth["Host"]),
		decode(auth.DatabaseAuth["Port"]),
		decode(auth.DatabaseAuth["databaseName"]),
	)

	return connectionString, nil
}

func (m *MSSQLConnector) ExecuteQuery(projectID int, query string) (*common.DatabaseQueryResult, error) {

	conStr, err := m.BuildConnectionString(projectID, m.MetaDataClient)
	if err != nil {
		return nil, err
	}

	db, err := m.Connect(conStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	normalized := strings.TrimSpace(strings.ToLower(query))

	isRead :=
		strings.HasPrefix(normalized, "select") ||
			strings.HasPrefix(normalized, "with") ||
			strings.HasPrefix(normalized, "exec") ||
			strings.HasPrefix(normalized, "execute")

	if !isRead {
		res, err := db.Exec(query)
		if err != nil {
			return nil, err
		}

		ra, _ := res.RowsAffected()

		return &common.DatabaseQueryResult{
			Kind:         "write",
			RowsAffected: ra,
			Message:      "Query executed successfully",
		}, nil
	}

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	out := make([]map[string]any, 0, 50)

	for rows.Next() {
		values := make([]any, len(cols))
		ptrs := make([]any, len(cols))
		for i := range values {
			ptrs[i] = &values[i]
		}

		if err := rows.Scan(ptrs...); err != nil {
			return nil, err
		}

		row := make(map[string]any, len(cols))
		for i, col := range cols {
			if b, ok := values[i].([]byte); ok {
				row[col] = string(b)
			} else {
				row[col] = values[i]
			}
		}
		out = append(out, row)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &common.DatabaseQueryResult{
		Kind: "rows",
		Rows: out,
	}, nil
}

func (m MSSQLConnector) GetVersionQuery() string {
	return "SELECT @@VERSION;"
}

func (m MSSQLConnector) GetDatabaseStructure(projectId int) (*DatabaseStructureResponse, error) {
	conStr, err := m.BuildConnectionString(projectId, m.MetaDataClient)
	if err != nil {
		return nil, err
	}

	db, err := m.Connect(conStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
        SELECT
            TABLE_SCHEMA,
            TABLE_NAME,
            COLUMN_NAME,
            DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;
    `
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return parseDatabaseStructure(rows)
}
