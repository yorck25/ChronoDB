package databaseWorker

import "time"

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

type PerformanceType string

const (
	DDL PerformanceType = "ddl"
	DML PerformanceType = "dml"
)

type ActionType string

const (
	ActionInitial     ActionType = "initial"
	ActionFull        ActionType = "full"
	ActionIncremental ActionType = "incremental"
)

type SchemaCommit struct {
	ID int64 `json:"id" db:"id"`

	ProjectID int `json:"projectId" db:"project_id"`

	Checksum       string  `json:"checksum" db:"checksum"`
	ParentChecksum *string `json:"parentChecksum,omitempty" db:"parent_checksum"`

	ActionType ActionType `json:"actionType" db:"action_type"`
	Title      string     `json:"title" db:"title"`
	Message    string     `json:"message" db:"message"`

	UpScript   string `json:"upScript" db:"up_script"`
	DownScript string `json:"downScript" db:"down_script"`

	AuthorUserID *int       `json:"authorUserId,omitempty" db:"author_user_id"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	DeletedAt    *time.Time `json:"deletedAt,omitempty" db:"deleted_at"`
}
