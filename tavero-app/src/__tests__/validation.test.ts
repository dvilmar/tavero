import { createAuthSchema, createCategorySchema, createProductSchema, createRestaurantSchema } from '@/lib/validation'

const tEs = (key: string, params?: Record<string, unknown>) => {
  const dict: Record<string, string> = {
    'validation.emailInvalid': 'Email inválido',
    'validation.emailMax': 'El email no puede exceder 255 caracteres',
    'validation.passwordMin': 'La contraseña debe tener al menos 8 caracteres',
    'validation.passwordMax': 'La contraseña no puede exceder 128 caracteres',
    'validation.nameRequired': 'El nombre es obligatorio',
    'validation.nameMin': 'El nombre debe tener al menos 2 caracteres',
    'validation.nameMax': params ? `El nombre no puede exceder ${params.max} caracteres` : '',
    'validation.nameChars': 'El nombre solo puede contener letras, números, espacios, guiones y puntos',
    'validation.descriptionMax': params ? `La descripción no puede exceder ${params.max} caracteres` : '',
    'validation.slugMin': 'El slug debe tener al menos 2 caracteres',
    'validation.slugMax': 'El slug no puede exceder 80 caracteres',
    'validation.slugFormat': 'El slug solo puede contener letras minúsculas, números y guiones',
    'validation.priceRequired': 'El precio es obligatorio',
    'validation.priceFormat': 'El precio debe ser un número válido (ej: 12.50)',
    'validation.categoryRequired': 'Debes seleccionar una categoría',
  }
  return dict[key] ?? key
}

describe('createAuthSchema', () => {
  const schema = createAuthSchema(tEs)

  it('validates correct email and password', () => {
    const result = schema.safeParse({ email: 'test@example.com', password: 'secure123' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = schema.safeParse({ email: 'not-an-email', password: 'secure123' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email?.[0]).toBe('Email inválido')
  })

  it('rejects short password', () => {
    const result = schema.safeParse({ email: 'test@example.com', password: 'short' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password?.[0]).toBe('La contraseña debe tener al menos 8 caracteres')
  })

  it('rejects empty fields', () => {
    const result = schema.safeParse({ email: '', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('createRestaurantSchema', () => {
  const schema = createRestaurantSchema(tEs)

  it('validates correct restaurant data', () => {
    const result = schema.safeParse({ name: 'Mi Restaurante', description: 'Comida deliciosa', slug: 'mi-restaurante' })
    expect(result.success).toBe(true)
  })

  it('rejects short name', () => {
    const result = schema.safeParse({ name: 'X', slug: 'x' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.name?.[0]).toBe('El nombre debe tener al menos 2 caracteres')
  })

  it('allows null description', () => {
    const result = schema.safeParse({ name: 'Bar Central', description: null, slug: 'bar-central' })
    expect(result.success).toBe(true)
  })

  it('validates slug format', () => {
    const result = schema.safeParse({ name: 'test', slug: 'UPPER-CASE' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.slug?.[0]).toBe('El slug solo puede contener letras minúsculas, números y guiones')
  })
})

describe('createCategorySchema', () => {
  const schema = createCategorySchema(tEs)

  it('validates correct category data', () => {
    const result = schema.safeParse({ name: 'Entrantes' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = schema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })
})

describe('createProductSchema', () => {
  const schema = createProductSchema(tEs)

  it('validates correct product data', () => {
    const result = schema.safeParse({
      name: 'Patatas Bravas',
      price: '3.50',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('accepts comma decimal price', () => {
    const result = schema.safeParse({
      name: 'Tortilla',
      price: '4,50',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid price', () => {
    const result = schema.safeParse({
      name: 'Tortilla',
      price: 'abc',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.price?.[0]).toBe('El precio debe ser un número válido (ej: 12.50)')
  })

  it('rejects missing category', () => {
    const result = schema.safeParse({ name: 'Tortilla', price: '5.00', categoryId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})
