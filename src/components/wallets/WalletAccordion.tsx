import { gql } from '@apollo/client'
import { DateTime } from 'luxon'
import { forwardRef } from 'react'
import styled, { css } from 'styled-components'

import {
  Accordion,
  Avatar,
  Icon,
  Skeleton,
  Status,
  StatusProps,
  StatusType,
  Tooltip,
  Typography,
} from '~/components/designSystem'
import { TimezoneDate } from '~/components/TimezoneDate'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { deserializeAmount } from '~/core/serializers/serializeAmount'
import {
  TimezoneEnum,
  WalletAccordionFragment,
  WalletInfosForTransactionsFragmentDoc,
  WalletStatusEnum,
  WalletTransactionStatusEnum,
  WalletTransactionTransactionTypeEnum,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useOrganizationInfos } from '~/hooks/useOrganizationInfos'
import { theme } from '~/styles'

import { TopupWalletDialogRef } from './TopupWalletDialog'
import { WalletTransactionList } from './WalletTransactionList'
import { WalletTransactionListItem } from './WalletTransactionListItem'

gql`
  fragment WalletAccordion on Wallet {
    id
    balanceCents
    consumedAmountCents
    consumedCredits
    createdAt
    creditsBalance
    currency
    expirationAt
    lastBalanceSyncAt
    lastConsumedCreditAt
    name
    rateAmount
    status
    terminatedAt
    ongoingBalanceCents
    creditsOngoingBalance

    ...WalletInfosForTransactions
  }

  ${WalletInfosForTransactionsFragmentDoc}
`

interface WalletAccordionProps {
  wallet: WalletAccordionFragment
  customerTimezone?: TimezoneEnum
}

const mapStatus = (type?: WalletStatusEnum | undefined): StatusProps => {
  switch (type) {
    case WalletStatusEnum.Active:
      return {
        type: StatusType.success,
        label: 'active',
      }
    default:
      return {
        type: StatusType.danger,
        label: 'terminated',
      }
  }
}

export const WalletAccordion = forwardRef<TopupWalletDialogRef, WalletAccordionProps>(
  ({ customerTimezone, wallet }: WalletAccordionProps, ref) => {
    const {
      balanceCents,
      consumedAmountCents,
      consumedCredits,
      createdAt,
      creditsBalance,
      currency,
      expirationAt,
      lastBalanceSyncAt,
      lastConsumedCreditAt,
      name,
      rateAmount,
      status,
      terminatedAt,
      ongoingBalanceCents,
      creditsOngoingBalance,
    } = wallet
    const { formatTimeOrgaTZ } = useOrganizationInfos()
    const statusMap = mapStatus(status)
    const [creditAmountUnit = '0', creditAmountCents = '00'] = String(creditsBalance).split('.')
    const [consumedCreditUnit = '0', consumedCreditCents = '00'] =
      String(creditsOngoingBalance).split('.')
    const { translate } = useInternationalization()
    const isWalletActive = status === WalletStatusEnum.Active

    return (
      <Accordion
        noContentMargin
        transitionProps={{ unmountOnExit: false }}
        summary={
          <SummaryContainer>
            <SummaryLeft>
              <Avatar size="big" variant="connector">
                <Icon name="wallet" color="dark" />
              </Avatar>
              <SummaryInfos>
                <Typography variant="bodyHl" color="grey700">
                  {name
                    ? name
                    : translate('text_62da6ec24a8e24e44f8128b2', {
                        createdAt: formatTimeOrgaTZ(createdAt),
                      })}
                </Typography>
                <Typography variant="caption">
                  {translate('text_62da6ec24a8e24e44f812872', {
                    rateAmount: intlFormatNumber(Number(rateAmount) || 0, {
                      currencyDisplay: 'symbol',
                      currency,
                    }),
                  })}
                </Typography>
              </SummaryInfos>
            </SummaryLeft>

            <Status {...statusMap} />
          </SummaryContainer>
        }
      >
        {({ isOpen }) => (
          <>
            <DetailSummary>
              <DetailSummaryBlock>
                <DetailSummaryLine>
                  <Typography className="mr-1" variant="captionHl" color="grey600">
                    {translate('text_65ae73ebe3a66bec2b91d747')}
                  </Typography>
                  <Tooltip
                    className="flex h-5 items-end"
                    placement="bottom-start"
                    title={translate('text_65ae73ebe3a66bec2b91d741', {
                      date: formatTimeOrgaTZ(lastBalanceSyncAt || DateTime.now()),
                    })}
                  >
                    <Icon name="info-circle" />
                  </Tooltip>
                </DetailSummaryLine>
                <DetailSummaryLine $alignBaseLine>
                  <Typography
                    color={isWalletActive ? 'grey700' : 'grey600'}
                    variant="subhead"
                    noWrap
                  >
                    {creditAmountUnit}
                  </Typography>
                  <Typography
                    className="mr-1"
                    color={isWalletActive ? 'grey700' : 'grey600'}
                    variant="captionHl"
                  >
                    .{creditAmountCents}
                  </Typography>
                  <Typography color={isWalletActive ? 'grey700' : 'grey600'} variant="captionHl">
                    {translate(
                      'text_62da6ec24a8e24e44f81287a',
                      undefined,
                      Number(creditAmountUnit) || 0,
                    )}
                  </Typography>
                </DetailSummaryLine>
                <DetailSummaryLine>
                  <Typography color="grey600" variant="caption">
                    {intlFormatNumber(deserializeAmount(balanceCents, currency), {
                      currencyDisplay: 'symbol',
                      currency,
                    })}
                  </Typography>
                </DetailSummaryLine>
              </DetailSummaryBlock>

              {isWalletActive && (
                <DetailSummaryBlock>
                  <DetailSummaryLine>
                    <Typography className="mr-1" variant="captionHl" color="grey600">
                      {translate('text_65ae73ebe3a66bec2b91d75f')}
                    </Typography>
                    <Tooltip
                      className="flex h-5 items-end"
                      placement="bottom-start"
                      title={translate('text_65ae73ebe3a66bec2b91d749')}
                    >
                      <Icon name="info-circle" />
                    </Tooltip>
                  </DetailSummaryLine>
                  <DetailSummaryLine $alignBaseLine>
                    <Typography
                      color={isWalletActive ? 'grey700' : 'grey600'}
                      variant="subhead"
                      noWrap
                    >
                      {consumedCreditUnit}
                    </Typography>
                    <Typography
                      className="mr-1"
                      color={isWalletActive ? 'grey700' : 'grey600'}
                      variant="captionHl"
                    >
                      .{consumedCreditCents}
                    </Typography>
                    <Typography color={isWalletActive ? 'grey700' : 'grey600'} variant="captionHl">
                      {translate(
                        'text_62da6ec24a8e24e44f812884',
                        undefined,
                        Number(consumedCreditUnit) || 0,
                      )}
                    </Typography>
                  </DetailSummaryLine>
                  <DetailSummaryLine>
                    <Typography color="grey600" variant="caption">
                      {intlFormatNumber(deserializeAmount(ongoingBalanceCents, currency), {
                        currencyDisplay: 'symbol',
                        currency,
                      })}
                    </Typography>
                  </DetailSummaryLine>
                </DetailSummaryBlock>
              )}

              <DetailSummaryBlock>
                <DetailSummaryLine>
                  <Typography color="grey500" variant="captionHl">
                    {isWalletActive
                      ? translate('text_62da6ec24a8e24e44f81288a')
                      : translate('text_62e2a2f2a79d60429eff3035')}
                  </Typography>
                </DetailSummaryLine>
                <DetailSummaryLine>
                  {!isWalletActive ? (
                    <TimezoneDate
                      mainTypographyProps={{ variant: 'caption', color: 'grey700' }}
                      date={terminatedAt}
                      customerTimezone={customerTimezone}
                    />
                  ) : expirationAt ? (
                    <TimezoneDate
                      mainTypographyProps={{ variant: 'caption', color: 'grey700' }}
                      date={expirationAt}
                      customerTimezone={customerTimezone}
                    />
                  ) : (
                    <Typography color="grey700" variant="caption">
                      {translate('text_62da6ec24a8e24e44f81288c')}
                    </Typography>
                  )}
                </DetailSummaryLine>
              </DetailSummaryBlock>
            </DetailSummary>

            {isWalletActive && (
              <WalletTransactionListItem
                isRealTimeTransaction
                transaction={{
                  id: 'real-time-transaction-id',
                  amount: String(
                    deserializeAmount(wallet.ongoingUsageBalanceCents, wallet.currency),
                  ),
                  creditAmount: String(wallet.creditsOngoingUsageBalance),
                  createdAt: new Date(),
                  settledAt: new Date(),
                  wallet,
                  status: WalletTransactionStatusEnum.Settled,
                  transactionType: WalletTransactionTransactionTypeEnum.Outbound,
                  transactionStatus: undefined,
                }}
                customerTimezone={customerTimezone}
              />
            )}

            <WalletTransactionList
              ref={ref}
              customerTimezone={customerTimezone}
              isOpen={isOpen}
              wallet={wallet}
            />

            <Typography
              className="flex h-10 items-center justify-end px-4"
              color="grey600"
              variant="caption"
            >
              {translate('text_65ae73ece3a66bec2b91d7d7')}&nbsp;
              {consumedCredits}&nbsp;
              {translate('text_62da6ec24a8e24e44f81287a', undefined, Number(consumedCredits) || 0)}
              &nbsp;|&nbsp;
              {intlFormatNumber(deserializeAmount(consumedAmountCents, currency), {
                currencyDisplay: 'symbol',
                currency,
              })}
              &nbsp;
              <Tooltip
                className="flex h-5 items-end"
                placement="top-end"
                title={translate('text_62da6db136909f52c2704c40', {
                  date: formatTimeOrgaTZ(lastConsumedCreditAt || DateTime.now()),
                })}
              >
                <Icon name="info-circle" />
              </Tooltip>
            </Typography>
          </>
        )}
      </Accordion>
    )
  },
)

export const WalletAccordionSkeleton = () => {
  return (
    <SkeletonContainer>
      <SummaryLeft>
        <Icon name="chevron-right" color="disabled" />
        <Skeleton variant="connectorAvatar" size="big" />
        <SummaryInfos $isLoading>
          <Skeleton variant="text" className="mb-3 w-60" />
          <Skeleton variant="text" className="w-30" />
        </SummaryInfos>
      </SummaryLeft>
    </SkeletonContainer>
  )
}

const SkeletonContainer = styled.div`
  border-radius: 12px;
  border: 1px solid ${theme.palette.grey[400]};
  padding: ${theme.spacing(4)};
`

const SummaryContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  align-items: center;
`

const SummaryLeft = styled.div`
  display: flex;
  align-items: center;

  > *:not(:last-child) {
    margin-right: ${theme.spacing(3)};
  }
`

const SummaryInfos = styled.div<{ $isLoading?: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 20px;

  > div:first-child {
    margin-bottom: ${({ $isLoading }) => ($isLoading ? theme.spacing(3) : 0)};
  }

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      height: 40px;
      justify-content: flex-end;
    `}
`

const DetailSummary = styled.div`
  display: flex;
  padding: ${theme.spacing(6)} ${theme.spacing(4)};
  align-items: flex-end;
  box-shadow: ${theme.shadows[7]};

  > *:not(:last-child) {
    margin-right: ${theme.spacing(8)};
  }
`

const DetailSummaryBlock = styled.div`
  > *:not(:last-child) {
    margin-bottom: ${theme.spacing(1)};
  }
`

const DetailSummaryLine = styled.div<{ $alignBaseLine?: boolean }>`
  display: flex;
  align-items: center;
  align-items: ${({ $alignBaseLine }) => ($alignBaseLine ? 'baseline' : undefined)};

  > * {
    display: flex;
  }
`

WalletAccordion.displayName = 'WalletAccordion'
