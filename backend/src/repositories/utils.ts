/**
 * Repository Utility Functions
 */

/**
 * オブジェクトからundefined値を削除
 * Firestoreに書き込む前にundefined値をフィルタリング
 */
export function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {} as any)
}
