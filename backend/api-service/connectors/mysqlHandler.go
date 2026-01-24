package connectors

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"

	"github.com/jmoiron/sqlx"

	_ "github.com/go-sql-driver/mysql"
)

func (m *MySQLConnector) Connect(connectionString string) (*sql.DB, error) {
	fmt.Println("Connecting to MySQL...")
	db, err := sql.Open("mysql", connectionString)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func (m *MySQLConnector) BuildConnectionString(projectID int, metaDB *sqlx.DB) (string, error) {
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

	// Base64 decode helper
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
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		decode(auth.DatabaseAuth["Username"]),
		decode(auth.DatabaseAuth["Password"]),
		decode(auth.DatabaseAuth["Host"]),
		decode(auth.DatabaseAuth["Port"]),
		decode(auth.DatabaseAuth["databaseName"]),
	)

	return connectionString, nil
}

func (m MySQLConnector) GetVersionQuery() string {
	return "SELECT VERSION();"
}

func (m *MySQLConnector) ExecuteQuery(projectID int, query string) ([]map[string]any, error) {
	conStr, err := m.BuildConnectionString(projectID, m.MetaDataClient)
	if err != nil {
		return nil, err
	}

	db, err := m.Connect(conStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

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
		valuePtrs := make([]any, len(cols))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}

		rowMap := make(map[string]any, len(cols))
		for i, col := range cols {
			v := values[i]

			if b, ok := v.([]byte); ok {
				rowMap[col] = string(b)
			} else {
				rowMap[col] = v
			}
		}

		out = append(out, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return out, nil
}

func (m MySQLConnector) GetDatabaseStructure(projectID int) (*DatabaseStructureResponse, error) {
	conStr, err := m.BuildConnectionString(projectID, m.MetaDataClient)
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
