package databaseWorker

type ConnectionType struct {
	Id          int    `db:"id" json:"id"`
	TypeName    string `db:"type_name" json:"typeName"`
	Key         string `db:"key" json:"key"`
	Description string `db:"description" json:"description"`
	Active      bool   `db:"active" json:"active"`
}

type DatabaseQueryRequest struct {
	Query string `json:"query"`
}
