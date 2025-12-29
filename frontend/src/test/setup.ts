import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.URL.createObjectURL and revokeObjectURL for export tests
global.URL.createObjectURL = () => 'mock-url'
global.URL.revokeObjectURL = () => {}

// Mock document methods for export tests
const mockLink = {
  click: () => {},
  setAttribute: () => {},
  href: '',
  download: '',
} as unknown as HTMLAnchorElement

global.document.createElement = ((tag: string) => {
  if (tag === 'a') {
    return mockLink
  }
  return {} as HTMLElement
}) as typeof document.createElement

global.document.body.appendChild = (() => {}) as typeof document.body.appendChild
global.document.body.removeChild = (() => {}) as typeof document.body.removeChild
