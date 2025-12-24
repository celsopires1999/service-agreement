#!/bin/bash

set -e

echo "get Docker GID"
export DOCKER_GROUP_ID=$(stat -c '%g' /var/run/docker.sock)
echo DOCKER_GROUP_ID=$DOCKER_GROUP_ID

echo "starting containers"
docker compose -f docker-compose.ci.yaml up -d

echo "generate envs"
docker compose -f docker-compose.ci.yaml exec -u root -T sav cp .env.e2e.example ./.env.e2e

echo "unit and integration tests"
docker compose -f docker-compose.ci.yaml exec -T sav npm run test || exit 1

echo "run e2e tests"
docker compose -f docker-compose.ci.yaml exec -T sav npm run test:e2e || exit 1

echo "removing containers"
docker compose -f docker-compose.ci.yaml down
docker ps -a --filter "label=org.testcontainers=true" -q | xargs -r docker rm -fv
docker volume prune -f
docker network ls --filter "label=org.testcontainers=true" -q | xargs -r docker network rm
docker rmi $(basename "$PWD")-sav