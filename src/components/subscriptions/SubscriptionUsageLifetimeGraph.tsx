import { ApolloError, gql } from '@apollo/client'
import { Stack } from '@mui/material'
import { useMemo } from 'react'
import { generatePath } from 'react-router'

import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { UPDATE_PLAN_ROUTE, UPDATE_SUBSCRIPTION } from '~/core/router'
import { deserializeAmount } from '~/core/serializers/serializeAmount'
import { formatDateToTZ, intlFormatDateToDateMed } from '~/core/timezone'
import { LocaleEnum } from '~/core/translations'
import {
  CurrencyEnum,
  GetSubscriptionForSubscriptionUsageLifetimeGraphQuery,
  StatusTypeEnum,
  SubscriptionUsageLifetimeGraphForLifetimeGraphFragment,
  useGetSubscriptionForSubscriptionUsageLifetimeGraphQuery,
} from '~/generated/graphql'
import { TranslateFunc, useInternationalization } from '~/hooks/core/useInternationalization'
import { useOrganizationInfos } from '~/hooks/useOrganizationInfos'
import ErrorImage from '~/public/images/maneki/error.svg'
import { theme } from '~/styles'

import { getLifetimeGraphPercentages } from './utils'

import { Icon, Skeleton, Tooltip, Typography } from '../designSystem'
import ChartHeader from '../designSystem/graphs/ChartHeader'
import InlineBarsChart from '../designSystem/graphs/InlineBarsChart'
import { GenericPlaceholder } from '../GenericPlaceholder'

export const LAST_USAGE_GRAPH_LINE_KEY_NAME = 'Others'
export const REDIRECTION_ORIGIN_SUBSCRIPTION_USAGE = 'subscriptionUsage'

gql`
  fragment SubscriptionUsageLifetimeGraphForLifetimeGraph on Subscription {
    id
    status
    lifetimeUsage {
      lastThresholdAmountCents
      nextThresholdAmountCents
      totalUsageAmountCents
      totalUsageFromDatetime
      totalUsageToDatetime
    }
    customer {
      id
      currency
      applicableTimezone
    }
    plan {
      id
    }
  }

  query getSubscriptionForSubscriptionUsageLifetimeGraph($subscriptionId: ID!) {
    subscription(id: $subscriptionId) {
      id
      ...SubscriptionUsageLifetimeGraphForLifetimeGraph
    }
  }
`

const GRAPH_COLORS = [theme.palette.primary[700], theme.palette.grey[300]]

export type TSubscriptionUsageLifetimeGraphDataResult =
  SubscriptionUsageLifetimeGraphForLifetimeGraphFragment['lifetimeUsage']

type SubscriptionUsageLifetimeGraphProps = {
  subscriptionId: string
  customerId: string
}

type SubscriptionUsageLifetimeGraphComponentProps = {
  subscriptionId: string
  customerId: string
  organizationLoading: boolean
  subscription?: null | GetSubscriptionForSubscriptionUsageLifetimeGraphQuery['subscription']
  subscriptionLoading: boolean
  subscriptionError?: ApolloError
  refetchLifetimeData: () => void
  translate: TranslateFunc
  locale?: LocaleEnum
}

export const SubscriptionUsageLifetimeGraphComponent = ({
  subscriptionId,
  customerId,
  organizationLoading,
  subscription,
  subscriptionLoading,
  subscriptionError,
  refetchLifetimeData,
  translate,
  locale,
}: SubscriptionUsageLifetimeGraphComponentProps) => {
  const isLoading = subscriptionLoading || organizationLoading
  const currency = subscription?.customer?.currency || CurrencyEnum.Usd
  const customerTimezone = subscription?.customer?.applicableTimezone

  const lifetimeUsage = subscription?.lifetimeUsage

  const { nextThresholdPercentage, lastThresholdPercentage } = useMemo(() => {
    return getLifetimeGraphPercentages(lifetimeUsage)
  }, [lifetimeUsage])

  return (
    <section>
      <Stack
        direction={'row'}
        height={40}
        boxShadow={theme.shadows[7]}
        alignItems={'flex-start'}
        justifyContent={'space-between'}
      >
        <div className="flex flex-row items-center gap-2">
          <Typography variant="subhead" color="grey700" noWrap>
            {translate('text_1726481163322ntor50xdm8k')}
          </Typography>
          <Tooltip placement="top-start" title={translate('text_1726481163322vbcsvivii5k')}>
            <Icon name="info-circle" />
          </Tooltip>
        </div>

        {isLoading ? (
          <Skeleton variant="text" className="mt-2 w-36" />
        ) : !subscriptionError && !!lifetimeUsage ? (
          <Typography variant="caption" color="grey600" noWrap>
            {translate('text_633dae57ca9a923dd53c2097', {
              fromDate: locale
                ? intlFormatDateToDateMed(
                    lifetimeUsage.totalUsageFromDatetime,
                    customerTimezone,
                    locale,
                  )
                : formatDateToTZ(lifetimeUsage.totalUsageFromDatetime, customerTimezone),
              toDate: locale
                ? intlFormatDateToDateMed(
                    lifetimeUsage.totalUsageToDatetime,
                    customerTimezone,
                    locale,
                  )
                : formatDateToTZ(lifetimeUsage.totalUsageToDatetime, customerTimezone),
            })}
          </Typography>
        ) : null}
      </Stack>
      <div className="flex flex-col gap-6 bg-white py-6">
        {!!subscriptionError ? (
          <GenericPlaceholder
            className="m-0 p-0"
            title={translate('text_636d023ce11a9d038819b579')}
            subtitle={translate('text_636d023ce11a9d038819b57b')}
            buttonTitle={translate('text_1725983967306qz0npfuhlo1')}
            buttonVariant="primary"
            buttonAction={() => refetchLifetimeData()}
            image={<ErrorImage width="136" height="104" />}
          />
        ) : (
          <>
            {subscription?.status === StatusTypeEnum.Pending ? (
              <Typography variant="body" color="grey600">
                {translate('text_1731423623190elua4pl3ccr')}
              </Typography>
            ) : !lifetimeUsage && !isLoading ? (
              <Typography
                variant="body"
                color="grey600"
                html={translate('text_17264811633225nhatoh524y', {
                  planLink: `${generatePath(UPDATE_PLAN_ROUTE, {
                    planId: subscription?.plan?.id || '',
                  })}?origin=${REDIRECTION_ORIGIN_SUBSCRIPTION_USAGE}&subscriptionId=${subscriptionId}&customerId=${customerId}`,
                  subscriptionLink: `${generatePath(UPDATE_SUBSCRIPTION, {
                    subscriptionId,
                    customerId: subscription?.customer?.id || '',
                  })}?origin=${REDIRECTION_ORIGIN_SUBSCRIPTION_USAGE}&subscriptionId=${subscriptionId}&customerId=${customerId}`,
                })}
              />
            ) : (
              <>
                <ChartHeader
                  name={translate('text_1726481163322wngkv4nqfh9')}
                  amount={intlFormatNumber(
                    deserializeAmount(lifetimeUsage?.totalUsageAmountCents, currency),
                    {
                      currency,
                      locale,
                      currencyDisplay: locale ? 'narrowSymbol' : 'symbol',
                    },
                  )}
                  loading={isLoading}
                />

                <div>
                  <div className="flex flex-col gap-3">
                    {!!isLoading ? (
                      <div className="flex flex-col gap-3">
                        <Skeleton variant="text" className="mt-2 w-36" />

                        <div className="flex h-6 items-center gap-2">
                          <Skeleton variant="text" className="w-[32%]" />
                          <Skeleton variant="text" className="ml-auto w-[32%]" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <InlineBarsChart
                          data={[
                            {
                              lastThresholdPercentage,
                              nextThresholdPercentage,
                            },
                          ]}
                          tooltipsData={
                            !!nextThresholdPercentage && nextThresholdPercentage !== 0
                              ? [
                                  {
                                    lastThresholdPercentage: translate(
                                      'text_1726576554903s2dddtq5qz4',
                                      {
                                        rate: intlFormatNumber(lastThresholdPercentage / 100 || 0, {
                                          style: 'percent',
                                          // This is a ratio so we will only allow 2 decimal
                                          maximumFractionDigits: 2,
                                          locale,
                                          currencyDisplay: locale ? 'narrowSymbol' : 'symbol',
                                        }),
                                      },
                                    ),
                                    nextThresholdPercentage: translate(
                                      'text_1726576554903930hsa8vg23',
                                      {
                                        rate: intlFormatNumber(nextThresholdPercentage / 100 || 0, {
                                          style: 'percent',
                                          // This is a ratio so we will only allow 2 decimal
                                          maximumFractionDigits: 2,
                                          locale,
                                          currencyDisplay: locale ? 'narrowSymbol' : 'symbol',
                                        }),
                                      },
                                    ),
                                  },
                                ]
                              : undefined
                          }
                          colors={GRAPH_COLORS}
                        />
                        <Stack direction={'row'} justifyContent={'space-between'}>
                          <Typography variant="caption" color="grey600">
                            {translate('text_17265631916994iccuwziryu', {
                              amount: intlFormatNumber(
                                deserializeAmount(
                                  lifetimeUsage?.lastThresholdAmountCents || 0,
                                  currency,
                                ),
                                {
                                  currency,
                                  locale,
                                  currencyDisplay: locale ? 'narrowSymbol' : 'symbol',
                                },
                              ),
                            })}
                          </Typography>
                          <Typography variant="caption" color="grey600">
                            {!lifetimeUsage?.nextThresholdAmountCents
                              ? translate('text_17265631917004vcwz8zc0gy')
                              : translate('text_172656319170006dm5ta4sd8', {
                                  amount: intlFormatNumber(
                                    deserializeAmount(
                                      lifetimeUsage?.nextThresholdAmountCents || 0,
                                      currency,
                                    ),
                                    {
                                      currency,
                                      locale,
                                      currencyDisplay: locale ? 'narrowSymbol' : 'symbol',
                                    },
                                  ),
                                })}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  )
}

const SubscriptionUsageLifetimeGraph = ({
  customerId,
  subscriptionId,
}: SubscriptionUsageLifetimeGraphProps) => {
  const { translate } = useInternationalization()

  const { loading: currentOrganizationDataLoading } = useOrganizationInfos()

  const {
    data: subscriptionData,
    loading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchLifetimeData,
  } = useGetSubscriptionForSubscriptionUsageLifetimeGraphQuery({
    variables: {
      subscriptionId,
    },
    fetchPolicy: 'no-cache',
  })

  const subscription = subscriptionData?.subscription

  return (
    <SubscriptionUsageLifetimeGraphComponent
      customerId={customerId}
      subscriptionId={subscriptionId}
      organizationLoading={currentOrganizationDataLoading}
      subscription={subscription}
      subscriptionLoading={subscriptionLoading}
      subscriptionError={subscriptionError}
      refetchLifetimeData={() => refetchLifetimeData()}
      translate={translate}
    />
  )
}

export default SubscriptionUsageLifetimeGraph
