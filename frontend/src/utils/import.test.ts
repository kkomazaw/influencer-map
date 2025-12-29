import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  parseMembersCSV,
  parseRelationshipsCSV,
  readFileAsText,
} from './import'
import type { Member } from '@shared/types'

describe('import utilities', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV', () => {
      const csv = 'name,email\nJohn,john@example.com\nJane,jane@example.com'
      const result = parseCSV(csv)

      expect(result).toEqual([
        ['name', 'email'],
        ['John', 'john@example.com'],
        ['Jane', 'jane@example.com'],
      ])
    })

    it('should handle quoted fields with commas', () => {
      const csv = 'name,description\nJohn,"Works in Engineering, Marketing"\nJane,"Senior Manager, Team Lead"'
      const result = parseCSV(csv)

      expect(result).toEqual([
        ['name', 'description'],
        ['John', 'Works in Engineering, Marketing'],
        ['Jane', 'Senior Manager, Team Lead'],
      ])
    })

    it('should handle escaped quotes', () => {
      const csv = 'name,position\nJohn,"Senior ""Engineer"""\nJane,"Team ""Leader"""'
      const result = parseCSV(csv)

      expect(result).toEqual([
        ['name', 'position'],
        ['John', 'Senior "Engineer"'],
        ['Jane', 'Team "Leader"'],
      ])
    })

    it('should handle empty fields', () => {
      const csv = 'name,department,position\nJohn,,Engineer\nJane,Marketing,'
      const result = parseCSV(csv)

      expect(result).toEqual([
        ['name', 'department', 'position'],
        ['John', '', 'Engineer'],
        ['Jane', 'Marketing', ''],
      ])
    })
  })

  describe('parseMembersCSV', () => {
    it('should parse valid members CSV', () => {
      const csv = `name,email,department,position
John Doe,john@example.com,Engineering,Engineer
Jane Smith,jane@example.com,Marketing,Manager`

      const result = parseMembersCSV(csv)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        position: 'Engineer',
      })
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing required headers', () => {
      const csv = 'name,department\nJohn,Engineering'

      const result = parseMembersCSV(csv)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必須カラムが不足')
      expect(result.errors[0].message).toContain('email')
    })

    it('should validate email format', () => {
      const csv = `name,email,department,position
John Doe,invalid-email,Engineering,Engineer
Jane Smith,jane@example.com,Marketing,Manager`

      const result = parseMembersCSV(csv)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('email')
      expect(result.errors[0].row).toBe(2)
      expect(result.data).toHaveLength(1) // Only valid row
    })

    it('should handle missing optional fields', () => {
      const csv = `name,email
John Doe,john@example.com
Jane Smith,jane@example.com`

      const result = parseMembersCSV(csv)

      expect(result.success).toBe(true)
      expect(result.data[0].department).toBeUndefined()
      expect(result.data[0].position).toBeUndefined()
    })

    it('should generate summary statistics', () => {
      const csv = `name,email,department,position
John Doe,john@example.com,Engineering,Engineer
Jane Smith,jane@example.com,Marketing,Manager
Invalid,bad-email,Sales,Rep`

      const result = parseMembersCSV(csv)

      expect(result.summary.total).toBe(3)
      expect(result.summary.valid).toBe(2)
      expect(result.summary.invalid).toBe(1)
    })

    it('should skip empty rows', () => {
      const csv = `name,email
John Doe,john@example.com

Jane Smith,jane@example.com`

      const result = parseMembersCSV(csv)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('parseRelationshipsCSV', () => {
    const members: Member[] = [
      {
        id: 'm1',
        mapId: 'map-123',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        position: 'Engineer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'm2',
        mapId: 'map-123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        department: 'Marketing',
        position: 'Manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    it('should parse valid relationships CSV with email lookup', () => {
      const csv = `source,target,type,strength
john@example.com,jane@example.com,collaboration,3
jane@example.com,john@example.com,mentorship,4`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].sourceId).toBe('m1')
      expect(result.data[0].targetId).toBe('m2')
      expect(result.data[0].type).toBe('collaboration')
      expect(result.data[0].strength).toBe(3)
    })

    it('should parse relationships CSV with name lookup', () => {
      const csv = `source,target,type,strength
John Doe,Jane Smith,collaboration,3
Jane Smith,John Doe,mentorship,4`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].sourceId).toBe('m1')
      expect(result.data[0].targetId).toBe('m2')
    })

    it('should detect member not found', () => {
      const csv = `source,target,type,strength
unknown@example.com,jane@example.com,collaboration,3`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('source')
      expect(result.errors[0].message).toContain('メンバーが見つかりません')
    })

    it('should validate strength range (1-10)', () => {
      const csv = `source,target,type,strength
john@example.com,jane@example.com,collaboration,15`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('strength')
      expect(result.errors[0].message).toContain('1-10')
    })

    it('should handle invalid strength values', () => {
      const csv = `source,target,type,strength
john@example.com,jane@example.com,collaboration,abc`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('strength')
    })

    it('should handle bidirectional field', () => {
      const csv = `source,target,type,strength,bidirectional
john@example.com,jane@example.com,collaboration,3,yes`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(true)
      expect(result.data[0].bidirectional).toBe(true)
    })

    it('should detect missing required headers', () => {
      const csv = 'source,target\njohn@example.com,jane@example.com'

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(false)
      expect(result.errors[0].message).toContain('必須カラムが不足')
      expect(result.errors[0].message).toContain('type')
      expect(result.errors[0].message).toContain('strength')
    })

    it('should generate summary statistics', () => {
      const csv = `source,target,type,strength
john@example.com,jane@example.com,collaboration,3
jane@example.com,john@example.com,mentorship,4
unknown@example.com,jane@example.com,collaboration,3`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.summary.total).toBe(3)
      expect(result.summary.valid).toBe(2)
      expect(result.summary.invalid).toBe(1)
    })

    it('should skip empty rows', () => {
      const csv = `source,target,type,strength
john@example.com,jane@example.com,collaboration,3

jane@example.com,john@example.com,mentorship,4`

      const result = parseRelationshipsCSV(csv, members)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('readFileAsText', () => {
    it('should read file content as text', async () => {
      const content = 'test file content'
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      const result = await readFileAsText(file)

      expect(result).toBe(content)
    })

    it('should handle CSV files', async () => {
      const csv = 'name,email\nJohn,john@example.com'
      const file = new File([csv], 'test.csv', { type: 'text/csv' })

      const result = await readFileAsText(file)

      expect(result).toBe(csv)
    })
  })
})
