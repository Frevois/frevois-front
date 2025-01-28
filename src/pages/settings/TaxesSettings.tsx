import { gql } from '@apollo/client'
import { useRef } from 'react'
import { generatePath, useNavigate } from 'react-router'

import {
  ActionItem,
  Alert,
  Avatar,
  Button,
  Icon,
  InfiniteScroll,
  Table,
  Typography,
} from '~/components/designSystem'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import { PageBannerHeaderWithBurgerMenu } from '~/components/layouts/Pages'
import {
  SettingsListItem,
  SettingsListItemHeader,
  SettingsListItemLoadingSkeleton,
  SettingsListWrapper,
  SettingsPaddedContainer,
  SettingsPageHeaderContainer,
} from '~/components/layouts/Settings'
import { DeleteTaxDialog, DeleteTaxDialogRef } from '~/components/taxes/DeleteTaxDialog'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { CREATE_TAX_ROUTE, UPDATE_TAX_ROUTE } from '~/core/router'
import {
  DeleteTaxFragmentDoc,
  TaxItemForTaxSettingsFragment,
  useGetTaxesSettingsInformationsQuery,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useIntegrations } from '~/hooks/useIntegrations'
import { usePermissions } from '~/hooks/usePermissions'
import ErrorImage from '~/public/images/maneki/error.svg'

gql`
  fragment TaxItemForTaxSettings on Tax {
    id
    code
    name
    rate
    autoGenerated

    ...DeleteTax
  }

  query getTaxesSettingsInformations($limit: Int, $page: Int) {
    taxes(limit: $limit, page: $page, order: "name") {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        ...TaxItemForTaxSettings
      }
    }
  }

  ${DeleteTaxFragmentDoc}
`

const TaxesSettings = () => {
  const navigate = useNavigate()
  const { hasPermissions } = usePermissions()
  const { hasTaxProvider } = useIntegrations()
  const { translate } = useInternationalization()
  const deleteDialogRef = useRef<DeleteTaxDialogRef>(null)
  const { data, error, loading, fetchMore } = useGetTaxesSettingsInformationsQuery({
    variables: {
      limit: 20,
    },
    notifyOnNetworkStatusChange: true,
  })
  const { metadata, collection } = data?.taxes || {}

  if (!!error && !loading) {
    return (
      <GenericPlaceholder
        title={translate('text_629728388c4d2300e2d380d5')}
        subtitle={translate('text_629728388c4d2300e2d380eb')}
        buttonTitle={translate('text_629728388c4d2300e2d38110')}
        buttonVariant="primary"
        buttonAction={() => location.reload()}
        image={<ErrorImage width="136" height="104" />}
      />
    )
  }

  return (
    <>
      <PageBannerHeaderWithBurgerMenu>
        <Typography variant="bodyHl" color="grey700">
          {translate('text_645bb193927b375079d28a8f')}
        </Typography>
      </PageBannerHeaderWithBurgerMenu>

      <SettingsPaddedContainer>
        <SettingsPageHeaderContainer>
          <Typography variant="headline">{translate('text_645bb193927b375079d28ab5')}</Typography>
          <Typography>{translate('text_645bb193927b375079d28b7e')}</Typography>
        </SettingsPageHeaderContainer>

        {!!loading ? (
          <SettingsListItemLoadingSkeleton count={2} />
        ) : (
          <>
            {hasTaxProvider && (
              <Alert type="info">
                <Typography variant="body" color="grey700">
                  {translate('text_66ba65e562cbc500f04c7dbb')}
                </Typography>
              </Alert>
            )}

            <SettingsListWrapper>
              <SettingsListItem>
                <SettingsListItemHeader
                  label={translate('text_645bb193927b375079d28ae8')}
                  sublabel={translate('text_645ca29272ea80007df9d7af')}
                  action={
                    <>
                      {hasPermissions(['organizationTaxesUpdate']) && (
                        <Button
                          variant="quaternary"
                          disabled={loading}
                          onClick={() => {
                            navigate(CREATE_TAX_ROUTE)
                          }}
                          data-test="create-tax-button"
                        >
                          {translate('text_645bb193927b375079d28ad2')}
                        </Button>
                      )}
                    </>
                  }
                />

                {!!collection?.length && (
                  <InfiniteScroll
                    onBottom={() => {
                      if (!fetchMore) return
                      const { currentPage = 0, totalPages = 0 } = metadata || {}

                      currentPage < totalPages &&
                        !loading &&
                        fetchMore({
                          variables: { page: currentPage + 1 },
                        })
                    }}
                  >
                    <Table
                      name="tax-settings-taxes"
                      containerSize={{ default: 0 }}
                      rowSize={72}
                      isLoading={loading}
                      data={collection}
                      columns={[
                        {
                          key: 'name',
                          title: translate('text_17280312664187sb64qzmyhy'),
                          maxSpace: true,
                          content: ({ name, code }) => (
                            <div className="flex flex-1 items-center gap-3" data-test={code}>
                              <Avatar size="big" variant="connector">
                                <Icon size="medium" name="percentage" color="dark" />
                              </Avatar>
                              <div>
                                <Typography color="textSecondary" variant="bodyHl" noWrap>
                                  {name}
                                </Typography>
                                <Typography variant="caption" noWrap>
                                  {code}
                                </Typography>
                              </div>
                            </div>
                          ),
                        },
                        {
                          key: 'rate',
                          textAlign: 'right',
                          title: translate('text_64de472463e2da6b31737de0'),
                          content: ({ rate }) => (
                            <Typography variant="body" color="grey700">
                              {intlFormatNumber((rate || 0) / 100, {
                                style: 'percent',
                              })}
                            </Typography>
                          ),
                        },
                      ]}
                      actionColumnTooltip={(tax) =>
                        translate(
                          tax.autoGenerated
                            ? 'text_62b1edddbf5f461ab9712787'
                            : 'text_645bb193927b375079d28b76',
                        )
                      }
                      actionColumn={
                        !hasPermissions(['organizationTaxesUpdate'])
                          ? undefined
                          : (tax) => {
                              const actions: ActionItem<TaxItemForTaxSettingsFragment>[] = [
                                {
                                  title: translate('text_645bb193927b375079d28b7c'),
                                  startIcon: 'pen',
                                  onAction: () => {
                                    navigate(
                                      generatePath(UPDATE_TAX_ROUTE, { taxId: tax?.id || '' }),
                                    )
                                  },
                                },
                              ]

                              if (!tax.autoGenerated) {
                                actions.push({
                                  title: translate('text_645bb193927b375079d28b82'),
                                  startIcon: 'trash',
                                  onAction: () => {
                                    deleteDialogRef.current?.openDialog(tax)
                                  },
                                })
                              }

                              return actions
                            }
                      }
                    />
                  </InfiniteScroll>
                )}
              </SettingsListItem>
            </SettingsListWrapper>
          </>
        )}
      </SettingsPaddedContainer>

      <DeleteTaxDialog ref={deleteDialogRef} />
    </>
  )
}

export default TaxesSettings
