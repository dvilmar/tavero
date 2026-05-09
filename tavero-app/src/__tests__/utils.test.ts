import { slugify, sanitizeText } from '@/lib/utils'

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes accents', () => {
    expect(slugify('Café & Bar')).toBe('cafe-bar')
  })

  it('removes special characters', () => {
    expect(slugify('My Restaurant #1!')).toBe('my-restaurant-1')
  })

  it('replaces spaces with dashes', () => {
    expect(slugify('La Casa de Papel')).toBe('la-casa-de-papel')
  })

  it('trims whitespace', () => {
    expect(slugify('  test  ')).toBe('test')
  })

  it('handles multiple spaces', () => {
    expect(slugify('a    b')).toBe('a-b')
  })
})

describe('sanitizeText', () => {
  it('escapes HTML tags', () => {
    expect(sanitizeText('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
  })

  it('escapes quotes', () => {
    expect(sanitizeText('"quoted" & \'single\'')).toBe('&quot;quoted&quot; & &#x27;single&#x27;')
  })

  it('respects max length', () => {
    expect(sanitizeText('a'.repeat(600), 500).length).toBeLessThanOrEqual(500)
  })

  it('preserves whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('  hello  ')
  })
})
