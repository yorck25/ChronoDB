package databaseWorker

import (
	"errors"
	"strings"
)

func GetPerformanceType(query string) (PerformanceType, error) {
	q := normalizeSQL(query)

	if q == "" {
		return "", errors.New("empty query")
	}

	first := firstKeyword(q)

	switch first {
	case "CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME",
		"COMMENT", "GRANT", "REVOKE":
		return DDL, nil

	case "INSERT", "UPDATE", "DELETE", "MERGE", "SELECT":
		return DML, nil

	default:
		return "", errors.New("unknown SQL statement type: " + first)
	}
}

func normalizeSQL(q string) string {
	q = strings.TrimSpace(q)

	for {
		switch {
		case strings.HasPrefix(q, "--"):
			if idx := strings.Index(q, "\n"); idx != -1 {
				q = strings.TrimSpace(q[idx+1:])
			} else {
				return ""
			}
		case strings.HasPrefix(q, "/*"):
			if idx := strings.Index(q, "*/"); idx != -1 {
				q = strings.TrimSpace(q[idx+2:])
			} else {
				return ""
			}
		default:
			return strings.ToUpper(q)
		}
	}
}

func firstKeyword(q string) string {
	fields := strings.Fields(q)
	if len(fields) == 0 {
		return ""
	}
	return fields[0]
}
