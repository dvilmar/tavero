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
      .max(80, t('validation.nameMax', { max: 80 })),
    description: z
      .string()
      .max(300, t('validation.descriptionMax', { max: 300 }))
      .optional()
      .nullable(),
  })
}

export type AuthFormData = z.infer<ReturnType<typeof createAuthSchema>>
export type RestaurantFormData = z.infer<ReturnType<typeof createRestaurantSchema>>
