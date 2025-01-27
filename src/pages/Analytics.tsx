/* eslint-disable tailwindcss/no-custom-classname */
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Button, Icon, Popper, Typography } from '~/components/designSystem'
import { TextInput } from '~/components/form'
import Gross from '~/components/graphs/Gross'
import Invoices from '~/components/graphs/Invoices'
import MonthSelectorDropdown, {
  AnalyticsPeriodScopeEnum,
  TPeriodScopeTranslationLookupValue,
} from '~/components/graphs/MonthSelectorDropdown'
import Mrr from '~/components/graphs/Mrr'
import Overview from '~/components/graphs/Overview'
import Usage from '~/components/graphs/Usage'
import { CurrencyEnum } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { useOrganizationInfos } from '~/hooks/useOrganizationInfos'
import { MenuPopper, PageHeader, theme } from '~/styles'

const Analytics = () => {
  const { translate } = useInternationalization()
  const { currentUser, loading: currentUserDataLoading } = useCurrentUser()
  const { organization, loading: currentOrganizationDataLoading } = useOrganizationInfos()

  const [periodScope, setPeriodScope] = useState<TPeriodScopeTranslationLookupValue>(
    AnalyticsPeriodScopeEnum.Year,
  )
  const [currencySearch, setCurrencySearch] = useState<string>('')
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEnum | undefined>(
    organization?.defaultCurrency || CurrencyEnum.Usd,
  )

  useEffect(() => {
    if (!currentOrganizationDataLoading && organization?.defaultCurrency) {
      setSelectedCurrency(organization?.defaultCurrency)
    }
  }, [currentOrganizationDataLoading, organization?.defaultCurrency])

  const currenciesToDisplay = useMemo(() => {
    return Object.values(CurrencyEnum).filter((c) =>
      c.toLowerCase().includes(currencySearch.toLowerCase()),
    )
  }, [currencySearch])

  return (
    <>
      <PageHeader.Wrapper withSide>
        <Typography variant="bodyHl" color="grey700" noWrap>
          {translate('text_6553885df387fd0097fd7384')}
        </Typography>

        <PageHeader.Group>
          <Popper
            maxHeight={452}
            PopperProps={{ placement: 'bottom-end' }}
            opener={({ isOpen }) => (
              <Button
                onClick={() => {
                  if (isOpen) {
                    setCurrencySearch('')
                  } else {
                    setTimeout(() => {
                      const currencyButton = document.querySelector(
                        `[data-analytics-currency="${selectedCurrency}"]`,
                      )

                      if (currencyButton) {
                        currencyButton.scrollIntoView({
                          behavior: 'instant',
                          block: 'start',
                          inline: 'start',
                        })
                      }
                    }, 0)
                  }
                }}
                variant="quaternary"
                endIcon={'chevron-down'}
              >
                {selectedCurrency}
              </Button>
            )}
            onClickAway={() => {
              setCurrencySearch('')
            }}
          >
            {({ closePopper }) => (
              <CurrencyMenuPopper>
                <SearchCurrencyTextInputWrapper>
                  <TextInput
                    className="max-w-50 [&_input]:h-12 [&_input]:!pl-3"
                    id="search-currency-input"
                    placeholder="Search a currency"
                    onChange={(value) => {
                      setCurrencySearch(value)
                    }}
                    InputProps={{
                      startAdornment: <Icon className="ml-4" name="magnifying-glass" />,
                    }}
                  />
                </SearchCurrencyTextInputWrapper>
                <CurrencyListWrapper>
                  {!currenciesToDisplay.length ? (
                    <Typography className="p-[6px]" variant="body" color="disabled">
                      {translate('text_65562fd544bc8a0057706172')}
                    </Typography>
                  ) : (
                    <>
                      {currenciesToDisplay.map((localCurrency) => (
                        <Button
                          key={localCurrency}
                          variant={selectedCurrency === localCurrency ? 'secondary' : 'quaternary'}
                          align="left"
                          data-analytics-currency={localCurrency}
                          onClick={() => {
                            setSelectedCurrency(localCurrency)
                            closePopper()
                            setCurrencySearch('')
                          }}
                        >
                          {localCurrency}
                          {localCurrency === organization?.defaultCurrency &&
                            ` ${translate('text_6556304dcd49290089c3cfe1')}`}
                        </Button>
                      ))}
                    </>
                  )}
                </CurrencyListWrapper>
              </CurrencyMenuPopper>
            )}
          </Popper>
          <MonthSelectorDropdown periodScope={periodScope} setPeriodScope={setPeriodScope} />
        </PageHeader.Group>
      </PageHeader.Wrapper>

      <ContentWrapper>
        <Overview currency={selectedCurrency} period={periodScope} />
        <Gross className="analytics-graph" currency={selectedCurrency} period={periodScope} />
        <Mrr
          blur={!currentUser}
          className="analytics-graph"
          currency={selectedCurrency}
          demoMode={!currentUser}
          forceLoading={currentUserDataLoading || currentOrganizationDataLoading}
          period={periodScope}
        />
        <Usage
          demoMode={!currentUser}
          className="analytics-graph"
          blur={!currentUser}
          currency={selectedCurrency}
          forceLoading={currentUserDataLoading || currentOrganizationDataLoading}
          period={periodScope}
        />
        <Invoices
          demoMode={!currentUser}
          className="analytics-graph"
          blur={!currentUser}
          currency={selectedCurrency}
          forceLoading={currentUserDataLoading || currentOrganizationDataLoading}
          period={periodScope}
        />
      </ContentWrapper>
    </>
  )
}

export default Analytics

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  background-color: ${theme.palette.grey[300]};
  gap: 1px;
  margin: ${theme.spacing(12)} ${theme.spacing(4)};

  ${theme.breakpoints.up('md')} {
    margin: ${theme.spacing(12)};
  }

  ${theme.breakpoints.up('lg')} {
    grid-template-columns: 1fr 1fr;

    .analytics-graph {
      &:nth-child(even) {
        padding-right: ${theme.spacing(6)};
      }

      &:nth-child(odd) {
        padding-left: ${theme.spacing(6)};
      }
    }
  }
`

const CurrencyMenuPopper = styled(MenuPopper)`
  padding: ${theme.spacing(4)};

  /* Done this way to override MenuPopper rule */
  > :not(:last-child) {
    margin-bottom: 16px;
  }
`

const SearchCurrencyTextInputWrapper = styled.div`
  position: sticky;
  top: 16px;
  background-color: #fff;
  margin-bottom: 16px;
`

const CurrencyListWrapper = styled.div`
  max-height: 356px;
  padding: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  overflow-y: auto;
  border: 1px solid ${theme.palette.grey[300]};
  border-radius: 12px;

  button {
    scroll-margin: ${theme.spacing(1)};
  }
`
