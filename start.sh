#!/bin/sh

# Run database migrations
yarn medusa db:migrate

# Seed the database
yarn seed

# Start the Medusa server
yarn start
