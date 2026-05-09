import { z } from 'zod'

type TFn = (key: string, params?: Record<string, unknown>) => string

export function createAuthSchema(t: TFn) {
  return z.object({
    email: z
      .string()
      .email(t('validation.emailInvalid'))
      .max(255, t('validation.emailMax')),
    password: z
      .string()
      .min(8, t('validation.passwordMin'))
      .max(128, t('validation.passwordMax')),
  })
}

export function createRestaurantSchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .min(2, t('validation.nameMin'))
      .max(80, t('validation.nameMax', { max: 80 }))
      .regex(/^[a-zA-Z0-9\s\-_.]+$/, t('validation.nameChars')),
    description: z
      .string()
      .max(300, t('validation.descriptionMax', { max: 300 }))
      .optional()
      .nullable(),
    slug: z
      .string()
      .min(2, t('validation.slugMin'))
      .max(80, t('validation.slugMax'))
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t('validation.slugFormat'))
      .optional(),
  })
}

export function createCategorySchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .min(1, t('validation.nameRequired'))
      .max(60, t('validation.nameMax', { max: 60 })),
    description: z
      .string()
      .max(200, t('validation.descriptionMax', { max: 200 }))
      .optional()
      .nullable(),
  })
}

export function createProductSchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .min(1, t('validation.nameRequired'))
      .max(100, t('validation.nameMax', { max: 100 })),
    description: z
      .string()
      .max(300, t('validation.descriptionMax', { max: 300 }))
      .optional()
      .nullable(),
    price: z
      .string()
      .min(1, t('validation.priceRequired'))
      .regex(/^\d+([.,]\d{1,2})?$/, t('validation.priceFormat')),
    categoryId: z
      .string()
      .uuid(t('validation.categoryRequired')),
  })
}

export type AuthFormData = z.infer<ReturnType<typeof createAuthSchema>>
export type RestaurantFormData = z.infer<ReturnType<typeof createRestaurantSchema>>
export type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>
export type ProductFormData = z.infer<ReturnType<typeof createProductSchema>>
