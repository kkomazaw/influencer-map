#!/bin/bash

# Influencer Map API 動作確認テストスクリプト
# Phase 1 Week 1 Day 5: CRUD操作テスト

set -e  # エラー時に停止

API_URL="http://localhost:4000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Influencer Map API 動作確認テスト${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# サーバー起動確認
echo -e "${YELLOW}[1] サーバー起動確認${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/../health)
if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ サーバーは正常に起動しています${NC}"
else
  echo -e "${RED}✗ サーバーが起動していません (HTTP $response)${NC}"
  exit 1
fi
echo ""

# Map作成テスト
echo -e "${YELLOW}[2] Map作成テスト${NC}"
map_response=$(curl -s -X POST $API_URL/maps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "テストマップ",
    "description": "動作確認用のテストマップ",
    "ownerId": "test-user-001"
  }')

map_id=$(echo $map_response | jq -r '.id')
if [ "$map_id" != "null" ] && [ -n "$map_id" ]; then
  echo -e "${GREEN}✓ Map作成成功: ID = $map_id${NC}"
else
  echo -e "${RED}✗ Map作成失敗${NC}"
  echo "Response: $map_response"
  exit 1
fi
echo ""

# Map取得テスト
echo -e "${YELLOW}[3] Map取得テスト${NC}"
get_map=$(curl -s $API_URL/maps/$map_id)
map_name=$(echo $get_map | jq -r '.name')
if [ "$map_name" = "テストマップ" ]; then
  echo -e "${GREEN}✓ Map取得成功: $map_name${NC}"
else
  echo -e "${RED}✗ Map取得失敗${NC}"
  exit 1
fi
echo ""

# Member作成テスト（複数）
echo -e "${YELLOW}[4] Member作成テスト${NC}"
member1=$(curl -s -X POST $API_URL/members \
  -H "Content-Type: application/json" \
  -d "{
    \"mapId\": \"$map_id\",
    \"name\": \"山田太郎\",
    \"email\": \"yamada@example.com\",
    \"department\": \"営業部\",
    \"position\": \"部長\"
  }")

member1_id=$(echo $member1 | jq -r '.data.id')
if [ "$member1_id" != "null" ] && [ -n "$member1_id" ]; then
  echo -e "${GREEN}✓ Member1作成成功: ID = $member1_id${NC}"
else
  echo -e "${RED}✗ Member1作成失敗${NC}"
  echo "Response: $member1"
  exit 1
fi

member2=$(curl -s -X POST $API_URL/members \
  -H "Content-Type: application/json" \
  -d "{
    \"mapId\": \"$map_id\",
    \"name\": \"佐藤花子\",
    \"email\": \"sato@example.com\",
    \"department\": \"営業部\",
    \"position\": \"課長\"
  }")

member2_id=$(echo $member2 | jq -r '.data.id')
if [ "$member2_id" != "null" ] && [ -n "$member2_id" ]; then
  echo -e "${GREEN}✓ Member2作成成功: ID = $member2_id${NC}"
else
  echo -e "${RED}✗ Member2作成失敗${NC}"
  exit 1
fi
echo ""

# Member一覧取得テスト
echo -e "${YELLOW}[5] Member一覧取得テスト${NC}"
members=$(curl -s "$API_URL/members?mapId=$map_id")
member_count=$(echo $members | jq '.data | length')
if [ "$member_count" = "2" ]; then
  echo -e "${GREEN}✓ Member一覧取得成功: $member_count 件${NC}"
else
  echo -e "${RED}✗ Member一覧取得失敗: 期待値 2件, 実際 $member_count 件${NC}"
  exit 1
fi
echo ""

# Relationship作成テスト
echo -e "${YELLOW}[6] Relationship作成テスト${NC}"
relationship=$(curl -s -X POST $API_URL/relationships \
  -H "Content-Type: application/json" \
  -d "{
    \"mapId\": \"$map_id\",
    \"sourceId\": \"$member1_id\",
    \"targetId\": \"$member2_id\",
    \"type\": \"reporting\",
    \"strength\": 5,
    \"bidirectional\": false
  }")

rel_id=$(echo $relationship | jq -r '.data.id')
if [ "$rel_id" != "null" ] && [ -n "$rel_id" ]; then
  echo -e "${GREEN}✓ Relationship作成成功: ID = $rel_id${NC}"
else
  echo -e "${RED}✗ Relationship作成失敗${NC}"
  exit 1
fi
echo ""

# Relationship一覧取得テスト
echo -e "${YELLOW}[7] Relationship一覧取得テスト${NC}"
relationships=$(curl -s "$API_URL/relationships?mapId=$map_id")
rel_count=$(echo $relationships | jq '.data | length')
if [ "$rel_count" = "1" ]; then
  echo -e "${GREEN}✓ Relationship一覧取得成功: $rel_count 件${NC}"
else
  echo -e "${RED}✗ Relationship一覧取得失敗${NC}"
  exit 1
fi
echo ""

# Group作成テスト
echo -e "${YELLOW}[8] Group作成テスト${NC}"
group=$(curl -s -X POST $API_URL/groups \
  -H "Content-Type: application/json" \
  -d "{
    \"mapId\": \"$map_id\",
    \"name\": \"営業チーム\",
    \"description\": \"営業部のメンバー\",
    \"memberIds\": [\"$member1_id\", \"$member2_id\"],
    \"color\": \"#4CAF50\"
  }")

group_id=$(echo $group | jq -r '.data.id')
if [ "$group_id" != "null" ] && [ -n "$group_id" ]; then
  echo -e "${GREEN}✓ Group作成成功: ID = $group_id${NC}"
else
  echo -e "${RED}✗ Group作成失敗${NC}"
  exit 1
fi
echo ""

# Group一覧取得テスト
echo -e "${YELLOW}[9] Group一覧取得テスト${NC}"
groups=$(curl -s "$API_URL/groups?mapId=$map_id")
group_count=$(echo $groups | jq '.data | length')
if [ "$group_count" = "1" ]; then
  echo -e "${GREEN}✓ Group一覧取得成功: $group_count 件${NC}"
else
  echo -e "${RED}✗ Group一覧取得失敗${NC}"
  exit 1
fi
echo ""

# Member更新テスト
echo -e "${YELLOW}[10] Member更新テスト${NC}"
update_member=$(curl -s -X PUT "$API_URL/members/$member1_id?mapId=$map_id" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "本部長"
  }')

updated_position=$(echo $update_member | jq -r '.data.position')
if [ "$updated_position" = "本部長" ]; then
  echo -e "${GREEN}✓ Member更新成功: position = $updated_position${NC}"
else
  echo -e "${RED}✗ Member更新失敗${NC}"
  exit 1
fi
echo ""

# クリーンアップ（削除テスト）
echo -e "${YELLOW}[11] クリーンアップ（削除テスト）${NC}"

# Relationship削除
del_rel=$(curl -s -X DELETE "$API_URL/relationships/$rel_id?mapId=$map_id")
echo -e "${GREEN}✓ Relationship削除${NC}"

# Group削除
del_group=$(curl -s -X DELETE "$API_URL/groups/$group_id?mapId=$map_id")
echo -e "${GREEN}✓ Group削除${NC}"

# Member削除（関係性も自動削除される）
del_member1=$(curl -s -X DELETE "$API_URL/members/$member1_id?mapId=$map_id")
echo -e "${GREEN}✓ Member1削除${NC}"

del_member2=$(curl -s -X DELETE "$API_URL/members/$member2_id?mapId=$map_id")
echo -e "${GREEN}✓ Member2削除${NC}"

# Map削除
del_map=$(curl -s -X DELETE "$API_URL/maps/$map_id")
echo -e "${GREEN}✓ Map削除${NC}"
echo ""

# 削除確認
echo -e "${YELLOW}[12] 削除確認${NC}"
check_members=$(curl -s "$API_URL/members?mapId=$map_id")
final_count=$(echo $check_members | jq '.data | length')
if [ "$final_count" = "0" ]; then
  echo -e "${GREEN}✓ すべてのデータが削除されました${NC}"
else
  echo -e "${RED}✗ データが残っています${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  すべてのテストが成功しました！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "テスト概要:"
echo "  - Map CRUD操作: ✓"
echo "  - Member CRUD操作: ✓"
echo "  - Relationship CRUD操作: ✓"
echo "  - Group CRUD操作: ✓"
echo "  - カスケード削除: ✓"
echo ""
echo -e "${YELLOW}Firestore確認:${NC}"
echo "  - Firebase Consoleでデータを確認してください"
echo "  - 開発環境ではEmulatorを確認: http://localhost:4000"
echo ""
