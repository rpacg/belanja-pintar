#!/usr/bin/env bash
set -e

message="${*:-Update application}"
git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

today="$(date +%Y-%m-%d)"
changed_files="$(git diff --cached --name-only)"
changelog="docs/CHANGELOG.md"
temp_file="$(mktemp)"

{
  printf '# Changelog\n\n'
  printf '## Update - %s\n\n' "$today"
  printf '### Automated change log\n\n- %s\n\n' "$message"
  printf '### Changed files\n\n'
  while IFS= read -r file; do
    printf -- '- `%s`\n' "$file"
  done <<< "$changed_files"
  if [[ -f "$changelog" ]]; then
    tail -n +2 "$changelog"
  fi
} > "$temp_file"
mv "$temp_file" "$changelog"
git add "$changelog"

git commit -m "$message"
git push
