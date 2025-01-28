import { DateTime } from 'luxon'

import { LocaleEnum } from '~/core/translations'
import { TimezoneEnum } from '~/generated/graphql'

import { TimeZonesConfig } from './config'

export const getTimezoneConfig = (timezone: TimezoneEnum | null | undefined) => {
  if (!timezone) return TimeZonesConfig[TimezoneEnum.TzUtc]

  const doesTimezoneConfigExist = Object.keys(TimeZonesConfig).includes(timezone)

  if (!doesTimezoneConfigExist) {
    return TimeZonesConfig[TimezoneEnum.TzUtc]
  }

  return TimeZonesConfig[timezone as TimezoneEnum]
}

export const formatDateToTZ = (
  date: string,
  timezone: TimezoneEnum | null | undefined,
  format?: string,
) => {
  return DateTime.fromISO(date, {
    zone: getTimezoneConfig(timezone).name,
  }).toFormat(format || 'LLL. dd, yyyy')
}

export const isSameDay = (a: DateTime, b: DateTime): boolean => {
  return a.hasSame(b, 'day') && a.hasSame(b, 'month') && a.hasSame(b, 'year')
}

export const intlFormatDateToDateMed = (
  date: string,
  timezone: TimezoneEnum | null | undefined,
  locale: LocaleEnum,
) => {
  return DateTime.fromISO(date, {
    zone: getTimezoneConfig(timezone).name,
    locale: locale,
  }).toLocaleString(DateTime.DATE_MED)
}
