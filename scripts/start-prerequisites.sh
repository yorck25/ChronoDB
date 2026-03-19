#!/bin/bash

echo "Starting Postgres service..."
brew services start postgresql@14

printf "%s " "Type 'exit' to stop Postgres or press Enter to continue: "

read ans

if [ "$ans" = "exit" ]; then
    echo "Stopping Postgres service..."
    brew services stop postgresql@14
    exit 0
fi
