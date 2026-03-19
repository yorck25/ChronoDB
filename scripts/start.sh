#!/usr/bin/env bash
set -e

# Load .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

PROJECT_NAME="${PROJECT_NAME:-chronodb}"

echo "Project name: $PROJECT_NAME"
echo "Reset running services: $RESET_RUNNING_SERVICES"

function project_containers_exist() {
    docker ps -a --format '{{.Names}}' | grep -q "^${PROJECT_NAME}_"
}

if [ "$RESET_RUNNING_SERVICES" = "true" ]; then
    if project_containers_exist; then
        echo "Stopping and removing existing containers for project $PROJECT_NAME..."
        docker compose -p $PROJECT_NAME down --remove-orphans
    else
        echo "No running containers found for project $PROJECT_NAME."
    fi
else
    if project_containers_exist; then
        echo "Containers for project $PROJECT_NAME already exist. They will not be reset."
    else
        echo "No existing containers found. Starting fresh..."
    fi
fi

echo "Starting services..."
docker compose -p $PROJECT_NAME up --build -d