package commits

import (
	"backend/common"
	"fmt"
	"strings"
)

func DeriveDownScript(up string) (string, bool) {
	upTrim := strings.TrimSpace(up)

	if m := common.CreateTableRe.FindStringSubmatch(upTrim); m != nil {
		name := cleanName(m[2])
		return fmt.Sprintf("DROP TABLE IF EXISTS %s;", name), true
	}

	if m := common.AlterTableAddColumnRe.FindStringSubmatch(upTrim); m != nil {
		table := cleanName(m[1])
		column := m[2]
		return fmt.Sprintf(
			"ALTER TABLE %s DROP COLUMN %s;",
			table,
			column,
		), true
	}

	if m := common.DropTableRe.FindStringSubmatch(upTrim); m != nil {
		return "-- cannot automatically derive DOWN for DROP TABLE", false
	}

	return "", false
}

func cleanName(s string) string {
	s = strings.ReplaceAll(s, " ", "")
	s = strings.ReplaceAll(s, "\t", "")
	return s
}
