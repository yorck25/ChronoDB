package core

import (
	"backend/common"
	"errors"
	"github.com/joho/godotenv"
	"os"
	"strconv"
)

func LoadConfig() (*common.Config, error) {
	config := &common.Config{}

	if os.Getenv("KUBERNETES_SERVICE_HOST") == "" {
		err := godotenv.Load()
		if err != nil {
			return nil, err
		}
	}

	key := os.Getenv("JWT_SECRET")
	if key == "" {
		return nil, errors.New("no secret key")
	}
	config.JwtSecretKey = []byte(key)

	psqlHost := os.Getenv("PSQL_HOST")
	if psqlHost == "" {
		return nil, errors.New("no psql host")
	}
	config.PsqlHost = psqlHost

	psqlPortStr := os.Getenv("PSQL_PORT")
	if psqlPortStr == "" {
		return nil, errors.New("no psql port")
	}
	psqlPort, err := strconv.Atoi(psqlPortStr)
	if err != nil {
		return nil, errors.New("invalid psql port")
	}
	config.PsqlPort = psqlPort

	psqlUser := os.Getenv("PSQL_USER")
	if psqlUser == "" {
		return nil, errors.New("no psql user")
	}
	config.PsqlUser = psqlUser

	psqlPassword := os.Getenv("PSQL_PASSWORD")
	if psqlPassword == "" {
		return nil, errors.New("no psql password")
	}
	config.PsqlPassword = psqlPassword

	psqlDatabase := os.Getenv("PSQL_DATABASE")
	if psqlDatabase == "" {
		return nil, errors.New("no psql database")
	}
	config.PsqlDatabase = psqlDatabase

	return config, nil
}
