#!/bin/bash
# Script to add all environment variables from .env.local to Vercel
# Usage: ./add-all-env.sh

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env.local file not found"
    exit 1
fi

echo "Reading environment variables from .env.local..."
echo "This will add variables to Vercel for all environments."
echo ""

ENVIRONMENTS=("production" "preview" "development")

while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove quotes from value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    # Skip empty values
    [[ -z "$value" ]] && continue
    
    # Skip Vercel internal variables
    [[ "$key" =~ ^VERCEL_ ]] && continue
    
    echo "Adding: $key"
    
    for env in "${ENVIRONMENTS[@]}"; do
        echo "$value" | npx vercel env add "$key" "$env" --yes
    done
    
    echo ""
done < "$ENV_FILE"

echo "Done!"

