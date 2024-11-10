#!/bin/bash

TEMP_FILE=$(mktemp)
curl -s https://www.caniemail.com/api/data.json > "$TEMP_FILE"

API_VERSION=$(jq -r '.api_version' "$TEMP_FILE")
if [[ ! $API_VERSION =~ ^1\. ]]; then
  echo "The API Version has changed. Aborting"
  rm "$TEMP_FILE"
  exit 1
fi

parse_date() {
    date -u -d "$1" +%s
}

REMOTE_DATE=$(jq -r '.last_update_date' "$TEMP_FILE")
LOCAL_DATE=$(jq -r '.last_update_date' data/caniemail.json)
REMOTE_TIMESTAMP=$(parse_date "$REMOTE_DATE")
LOCAL_TIMESTAMP=$(parse_date "$LOCAL_DATE")

if [ "$REMOTE_TIMESTAMP" -gt "$LOCAL_TIMESTAMP" ]; then
  cp "$TEMP_FILE" data/caniemail.json
  git add data/caniemail.json
  git commit -m "chore: update caniemail.json"
  git push
fi

rm "$TEMP_FILE"
