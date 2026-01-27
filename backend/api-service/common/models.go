package common

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
