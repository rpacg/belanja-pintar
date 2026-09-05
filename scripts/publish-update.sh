#!/usr/bin/env bash
set -e

message="${*:-Update application}"
git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$message"
git push
