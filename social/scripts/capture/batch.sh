#!/bin/sh
# Capture the MauriSchool app screens the posts use, at a frozen 10:24, from a local review database
# (see README.md, "Refresh the captures"). Never against a real school's data.
# Env: CHROMIUM, and the review accounts' passwords as `python -m scripts.review_db` prints them:
#   ADMIN_PASSWORD, TEACHER_PASSWORD, PARENT_PASSWORD
# usage: sh social/scripts/capture/batch.sh <outDir>
set -u
cd "$(dirname "$0")"
OUT="$(cd "$1" && pwd)"
export FIXED_TIME=2026-11-04T10:24:00Z
run() { user="$1"; pass="$2"; lang="$3"; name="$4"; steps="$5"; goto="${6:-}"
  PASSWORD="$pass" GOTO="$goto" timeout 400 node capture-app.cjs "$user" "$lang" "$OUT/app-$name-$lang.png" "$steps" > /dev/null 2>&1 && echo "ok $name-$lang" || echo "FAIL $name-$lang"; }
for lang in fr ar; do
  if [ $lang = fr ]; then FIN=Finance; FEES="~Reçus"; else FIN="المالية"; FEES="~الوصولات"; fi
  run review_admin "$ADMIN_PASSWORD" $lang admin-home ""
  run review_admin "$ADMIN_PASSWORD" $lang admin-finance "$FIN"
  run review_teacher_01 "$TEACHER_PASSWORD" $lang teacher-home ""
  run review_parent_046 "$PARENT_PASSWORD" $lang parent-home ""
  run review_parent_046 "$PARENT_PASSWORD" $lang parent-fees "$FEES"
  run review_parent_046 "$PARENT_PASSWORD" $lang parent-notifications "" "/notifications"
  node capture-register-offline.cjs review_teacher_01 "$TEACHER_PASSWORD" $lang "$OUT/app-teacher-register-offline-$lang.png" > /dev/null 2>&1 \
    && echo "ok teacher-register-offline-$lang" || echo "FAIL teacher-register-offline-$lang"
done
