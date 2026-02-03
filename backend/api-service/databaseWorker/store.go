package databaseWorker

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

var (
	createTableRe = regexp.MustCompile(
		`(?is)^\s*create\s+table\s+(if\s+not\s+exists\s+)?(?P<name>(?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s*\(`,
	)

	alterTableAddColumnRe = regexp.MustCompile(
		`(?is)^\s*alter\s+table\s+(?P<name>(?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s+add\s+column\s+(?P<col>\w+)`,
	)

	dropTableRe = regexp.MustCompile(
		`(?is)^\s*drop\s+table\s+(if\s+exists\s+)?(?P<name>(?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)`,
	)
)

func DeriveDownScript(up string) (string, bool) {
	upTrim := strings.TrimSpace(up)

	if m := createTableRe.FindStringSubmatch(upTrim); m != nil {
		name := cleanName(m[2])
		return fmt.Sprintf("DROP TABLE IF EXISTS %s;", name), true
	}

	if m := alterTableAddColumnRe.FindStringSubmatch(upTrim); m != nil {
		table := cleanName(m[1])
		column := m[2]
		return fmt.Sprintf(
			"ALTER TABLE %s DROP COLUMN %s;",
			table,
			column,
		), true
	}

	if m := dropTableRe.FindStringSubmatch(upTrim); m != nil {
		return "-- cannot automatically derive DOWN for DROP TABLE", false
	}

	return "", false
}

func cleanName(s string) string {
	s = strings.ReplaceAll(s, " ", "")
	s = strings.ReplaceAll(s, "\t", "")
	return s
}

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
