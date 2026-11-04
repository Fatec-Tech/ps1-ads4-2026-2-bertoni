#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://api-clinica-alexandre-bertoni.onrender.com"
EMAIL="teste.cli.$(date +%s)@email.com"

printf '\n=== 1. GET /pacientes ===\n'
curl -i -X GET "$BASE_URL/pacientes"
printf '\n\n=== 2. POST /pacientes ===\n'
# Guarda a resposta para recuperar o ID criado, mas também mostra os cabeçalhos e JSON.
POST_RESPONSE=$(curl -sS -i -X POST "$BASE_URL/pacientes" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Paciente Teste CLI\",\"email\":\"$EMAIL\",\"nascimento\":\"1998-05-20\"}")
printf '%s\n' "$POST_RESPONSE"
PATIENT_ID=$(printf '%s\n' "$POST_RESPONSE" | tail -n 1 | node -e 'let data="";process.stdin.on("data",chunk=>data+=chunk);process.stdin.on("end",()=>{try{const obj=JSON.parse(data);if(obj.id===undefined)process.exit(1);console.log(obj.id)}catch(e){process.exit(1)}})')
if [[ -z "$PATIENT_ID" ]]; then
  echo "Nao foi possivel recuperar o ID do paciente criado." >&2
  exit 1
fi

printf '\n=== 3. GET /pacientes/%s ===\n' "$PATIENT_ID"
curl -i -X GET "$BASE_URL/pacientes/$PATIENT_ID"
printf '\n\n=== 4. PUT /pacientes/%s ===\n' "$PATIENT_ID"
curl -i -X PUT "$BASE_URL/pacientes/$PATIENT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Paciente Atualizado CLI\",\"email\":\"$EMAIL\",\"nascimento\":\"1998-05-20\"}"
printf '\n\n=== 5. DELETE /pacientes/%s ===\n' "$PATIENT_ID"
curl -i -X DELETE "$BASE_URL/pacientes/$PATIENT_ID"
printf '\n\nTestes executados. Confira os status HTTP acima.\n'
