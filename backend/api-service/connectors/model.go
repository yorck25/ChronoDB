package connectors

import (
	"backend/common"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type DBConnector interface {
	Connect(connectionString string) (*sql.DB, error)
	ExecuteQuery(projectID int, query string) (*common.DatabaseQueryResult, error)
	GetVersionQuery() string
	GetDatabaseStructure(projectID int) (*DatabaseStructureResponse, error)
	BuildConnectionString(projectID int, metaDB *sqlx.DB) (string, error)
}

type DatabaseAuth struct {
	DatabaseAuth map[string]string `json:"databaseAuth"`
}

type PostgresConnector struct {
	MetaDataClient *sqlx.DB
}

type MySQLConnector struct {
	MetaDataClient *sqlx.DB
}

type MSSQLConnector struct {
	MetaDataClient *sqlx.DB
}

type DatabaseStructureResponse struct {
	Schemas []SchemaStructureResponse `json:"schemas"`
}

type SchemaStructureResponse struct {
	SchemaName string                   `json:"schemaName"`
	Tables     []TableStructureResponse `json:"tables"`
}

type TableStructureResponse struct {
	TableName string                    `json:"tableName"`
	Columns   []ColumnStructureResponse `json:"columns"`
}

type ColumnStructureResponse struct {
	ColumnName string `json:"columnName"`
	DataType   string `json:"dataType"`
}
