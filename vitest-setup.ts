import '@testing-library/jest-dom/vitest'

import { Locale, TranslateData, Translations } from '~/core/translations'
import type { translateKey } from '~/core/translations/utils'

import fallbackTranslations from './translations/base.json' with { type: 'json' }

// For some reason, vitest fails with translations sometimes, this is a workaround for that
vitest.mock('src/core/translations/utils', async () => {
  const realModule = await vitest.importActual('src/core/translations/utils')

  const mocked = {
    ...realModule,
    translateKey: (
      context: {
        translations: Translations
        locale: Locale
        appEnv: AppEnvEnum
      },
      key: string,
      data?: TranslateData,
      plural?: number,
    ) => {
      if (!context.translations || Object.keys(context.translations).length === 0) {
        context.translations = fallbackTranslations
      }
      return (realModule.translateKey as typeof translateKey)(context, key, data, plural)
    },
  }

  return mocked
})
