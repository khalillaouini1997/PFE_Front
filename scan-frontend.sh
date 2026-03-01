#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
    export $(cat ../.env | xargs)
fi

echo "🚀 Starting Frontend SonarCloud Scan..."

# Run Angular tests with coverage
npm test -- --watch=false --code-coverage

# Trigger sonar-scanner (assumes it's installed globally or via npx)
npx sonar-scanner \
  -Dsonar.token=$SONAR_TOKEN \
  -Dsonar.organization=$SONAR_ORGANIZATION \
  -Dsonar.projectKey=$SONAR_PROJECT_KEY_FRONTEND \
  -Dsonar.host.url=$SONAR_HOST_URL

echo "✅ Frontend Scan Finished!"
