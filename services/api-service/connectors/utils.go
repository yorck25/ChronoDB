package connectors

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"github.com/jmoiron/sqlx"
)

func getDatabaseAuth(projectID int, metaDB *sqlx.DB) (map[string]string, error) {
	var rawJSON string

	stmt, err := metaDB.PrepareNamed(`SELECT database_auth FROM projects_credentials WHERE project_id = :id`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	params := map[string]any{"id": projectID}
	if err := stmt.Get(&rawJSON, params); err != nil {
		return nil, err
	}

	var auth DatabaseAuth
	if err := json.Unmarshal([]byte(rawJSON), &auth); err != nil {
		return nil, err
	}

	authMap := auth.DatabaseAuth
	if authMap == nil {
		if err := json.Unmarshal([]byte(rawJSON), &authMap); err != nil {
			return nil, err
		}
	}

	decodeIfBase64 := func(s string) string {
		decoded, err := base64.StdEncoding.DecodeString(s)
		if err == nil {
			return string(decoded)
		}
		return s
	}

	for key, val := range authMap {
		authMap[key] = decodeIfBase64(val)
	}

	return authMap, nil
}

func parseDatabaseStructure(rows *sql.Rows) (*DatabaseStructureResponse, error) {
	type TableMap struct {
		TableName string
		Columns   []ColumnStructureResponse
	}
	type SchemaMap struct {
		SchemaName string
		Tables     map[string]*TableMap
	}

	schemaMap := make(map[string]*SchemaMap)

	for rows.Next() {
		var schemaName, tableName, columnName, dataType string
		if err := rows.Scan(&schemaName, &tableName, &columnName, &dataType); err != nil {
			return nil, err
		}

		if _, ok := schemaMap[schemaName]; !ok {
			schemaMap[schemaName] = &SchemaMap{
				SchemaName: schemaName,
				Tables:     make(map[string]*TableMap),
			}
		}

		schema := schemaMap[schemaName]

		if _, ok := schema.Tables[tableName]; !ok {
			schema.Tables[tableName] = &TableMap{
				TableName: tableName,
				Columns:   []ColumnStructureResponse{},
			}
		}

		schema.Tables[tableName].Columns = append(schema.Tables[tableName].Columns, ColumnStructureResponse{
			ColumnName: columnName,
			DataType:   dataType,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	response := DatabaseStructureResponse{}
	for _, schema := range schemaMap {
		schemaResponse := SchemaStructureResponse{
			SchemaName: schema.SchemaName,
			Tables:     []TableStructureResponse{},
		}
		for _, table := range schema.Tables {
			schemaResponse.Tables = append(schemaResponse.Tables, TableStructureResponse{
				TableName: table.TableName,
				Columns:   table.Columns,
			})
		}
		response.Schemas = append(response.Schemas, schemaResponse)
	}

	return &response, nil
}
