package version

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type CreateTableRequest struct {
	ProjectID int                   `json:"projectId"`
	TableName string                `json:"tableName"`
	Columns   []CreateColumnRequest `json:"columns"`
}

type CreateColumnRequest struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	Nullable   bool   `json:"nullable"`
	PrimaryKey bool   `json:"primaryKey"`
	Default    string `json:"default,omitempty"`
}

type Version struct {
	Id        int        `db:"id" json:"id"`
	Version   string     `db:"version" json:"version"`
	Up        SQLScript  `db:"up" json:"up"`
	Down      SQLScript  `db:"down" json:"down"`
	State     string     `db:"state" json:"state"`
	CreatedAt string     `db:"created_at" json:"createdAt"`
	AppliedAt *time.Time `db:"applied_at" json:"appliedAt"`
	ProjectId int        `db:"project_id" json:"projectId"`
}

type SQLScript struct {
	ID     int    `json:"id"`
	Script string `json:"script"`
}

func (s SQLScript) Value() (driver.Value, error) {
	return json.Marshal(s)
}

type VersionAudit struct {
	ID        int       `db:"id" json:"id"`
	VersionID int       `db:"version_id" json:"versionId"`
	AppliedAt time.Time `db:"applied_at" json:"appliedAt"`
	AppliedBy int       `db:"applied_by" json:"appliedBy"`
	Notes     string    `db:"notes" json:"notes"`
}

func (s *SQLScript) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, s)
}
