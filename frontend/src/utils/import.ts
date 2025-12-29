import { Member, CreateMemberInput, CreateRelationshipInput, RelationshipType, RelationshipStrength } from '@shared/types'

export interface ValidationError {
  row: number
  field: string
  message: string
}

export interface ImportResult<T> {
  success: boolean
  data: T[]
  errors: ValidationError[]
  summary: {
    total: number
    valid: number
    invalid: number
  }
}

/**
 * CSVテキストをパース
 */
const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.trim().split('\n')
  const result: string[][] = []

  for (const line of lines) {
    const row: string[] = []
    let inQuotes = false
    let currentValue = ''

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // エスケープされたダブルクォート
          currentValue += '"'
          i++
        } else {
          // クォートの開始/終了
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // フィールド区切り
        row.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }

    // 最後のフィールド
    row.push(currentValue.trim())
    result.push(row)
  }

  return result
}

/**
 * メンバーCSVをパース・バリデーション
 */
export const parseMembersCSV = (csvText: string): ImportResult<CreateMemberInput> => {
  const errors: ValidationError[] = []
  const data: CreateMemberInput[] = []

  try {
    const rows = parseCSV(csvText)

    if (rows.length === 0) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, field: 'file', message: 'CSVファイルが空です' }],
        summary: { total: 0, valid: 0, invalid: 0 },
      }
    }

    // ヘッダー行をチェック
    const headers = rows[0].map((h) => h.toLowerCase())
    const requiredHeaders = ['name', 'email']
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: 'headers',
            message: `必須カラムが不足しています: ${missingHeaders.join(', ')}`,
          },
        ],
        summary: { total: 0, valid: 0, invalid: 0 },
      }
    }

    // データ行をパース
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 1

      // 空行をスキップ
      if (row.every((cell) => !cell)) continue

      const member: Partial<CreateMemberInput> = {}
      const rowErrors: ValidationError[] = []

      headers.forEach((header, index) => {
        const value = row[index]?.trim() || ''

        switch (header) {
          case 'name':
            if (!value) {
              rowErrors.push({ row: rowNum, field: 'name', message: '名前は必須です' })
            } else {
              member.name = value
            }
            break
          case 'email':
            if (!value) {
              rowErrors.push({ row: rowNum, field: 'email', message: 'メールアドレスは必須です' })
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              rowErrors.push({ row: rowNum, field: 'email', message: '無効なメールアドレス形式です' })
            } else {
              member.email = value
            }
            break
          case 'department':
            if (value) member.department = value
            break
          case 'position':
            if (value) member.position = value
            break
        }
      })

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else if (member.name && member.email) {
        data.push(member as CreateMemberInput)
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      summary: {
        total: rows.length - 1,
        valid: data.length,
        invalid: errors.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, field: 'file', message: `CSVパースエラー: ${error}` }],
      summary: { total: 0, valid: 0, invalid: 0 },
    }
  }
}

/**
 * 関係性CSVをパース・バリデーション
 */
export const parseRelationshipsCSV = (
  csvText: string,
  members: Member[]
): ImportResult<CreateRelationshipInput> => {
  const errors: ValidationError[] = []
  const data: CreateRelationshipInput[] = []
  const memberMap = new Map(members.map((m) => [m.email.toLowerCase(), m.id]))
  const memberNameMap = new Map(members.map((m) => [m.name.toLowerCase(), m.id]))

  try {
    const rows = parseCSV(csvText)

    if (rows.length === 0) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, field: 'file', message: 'CSVファイルが空です' }],
        summary: { total: 0, valid: 0, invalid: 0 },
      }
    }

    // ヘッダー行をチェック
    const headers = rows[0].map((h) => h.toLowerCase())
    const requiredHeaders = ['source', 'target', 'type', 'strength']
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: 'headers',
            message: `必須カラムが不足しています: ${missingHeaders.join(', ')}`,
          },
        ],
        summary: { total: 0, valid: 0, invalid: 0 },
      }
    }

    // データ行をパース
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 1

      // 空行をスキップ
      if (row.every((cell) => !cell)) continue

      const relationship: Partial<CreateRelationshipInput> = {}
      const rowErrors: ValidationError[] = []

      headers.forEach((header, index) => {
        const value = row[index]?.trim() || ''

        switch (header) {
          case 'source': {
            if (!value) {
              rowErrors.push({ row: rowNum, field: 'source', message: 'ソースは必須です' })
            } else {
              // メールアドレスまたは名前で検索
              const sourceId =
                memberMap.get(value.toLowerCase()) || memberNameMap.get(value.toLowerCase())
              if (!sourceId) {
                rowErrors.push({
                  row: rowNum,
                  field: 'source',
                  message: `メンバーが見つかりません: ${value}`,
                })
              } else {
                relationship.sourceId = sourceId
              }
            }
            break
          }
          case 'target': {
            if (!value) {
              rowErrors.push({ row: rowNum, field: 'target', message: 'ターゲットは必須です' })
            } else {
              const targetId =
                memberMap.get(value.toLowerCase()) || memberNameMap.get(value.toLowerCase())
              if (!targetId) {
                rowErrors.push({
                  row: rowNum,
                  field: 'target',
                  message: `メンバーが見つかりません: ${value}`,
                })
              } else {
                relationship.targetId = targetId
              }
            }
            break
          }
          case 'type':
            if (!value) {
              rowErrors.push({ row: rowNum, field: 'type', message: 'タイプは必須です' })
            } else {
              relationship.type = value as RelationshipType
            }
            break
          case 'strength': {
            if (!value) {
              rowErrors.push({ row: rowNum, field: 'strength', message: '強度は必須です' })
            } else {
              const strength = parseInt(value, 10)
              if (isNaN(strength) || strength < 1 || strength > 10) {
                rowErrors.push({
                  row: rowNum,
                  field: 'strength',
                  message: '強度は1-10の数値である必要があります',
                })
              } else {
                relationship.strength = strength as RelationshipStrength
              }
            }
            break
          }
          case 'bidirectional':
            relationship.bidirectional = value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true'
            break
        }
      })

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else if (
        relationship.sourceId &&
        relationship.targetId &&
        relationship.type &&
        relationship.strength !== undefined
      ) {
        data.push(relationship as CreateRelationshipInput)
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      summary: {
        total: rows.length - 1,
        valid: data.length,
        invalid: errors.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, field: 'file', message: `CSVパースエラー: ${error}` }],
      summary: { total: 0, valid: 0, invalid: 0 },
    }
  }
}

/**
 * JSONファイルをパース・バリデーション
 */
export const parseMapJSON = (jsonText: string): any => {
  try {
    const data = JSON.parse(jsonText)

    // バージョンチェック
    if (!data.version) {
      throw new Error('無効なフォーマット: バージョン情報がありません')
    }

    // データ構造チェック
    if (!data.data || typeof data.data !== 'object') {
      throw new Error('無効なフォーマット: データセクションがありません')
    }

    const { members, relationships, groups } = data.data

    if (!Array.isArray(members)) {
      throw new Error('無効なフォーマット: メンバーデータが配列ではありません')
    }

    if (!Array.isArray(relationships)) {
      throw new Error('無効なフォーマット: 関係性データが配列ではありません')
    }

    if (groups && !Array.isArray(groups)) {
      throw new Error('無効なフォーマット: グループデータが配列ではありません')
    }

    return data
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('無効なJSON形式です')
    }
    throw error
  }
}

/**
 * ファイルを読み込む
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('ファイルの読み込みに失敗しました'))
      }
    }
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsText(file)
  })
}
