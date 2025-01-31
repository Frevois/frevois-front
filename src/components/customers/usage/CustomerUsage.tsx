import { gql } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router'

import Gross from '~/components/graphs/Gross'
import MonthSelectorDropdown, {
  AnalyticsPeriodScopeEnum,
  TPeriodScopeTranslationLookupValue,
} from '~/components/graphs/MonthSelectorDropdown'
import { useGetCustomerSubscriptionForUsageQuery } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useOrganizationInfos } from '~/hooks/useOrganizationInfos'
import { SectionHeader } from '~/styles/customer'

gql`
  query getCustomerSubscriptionForUsage($id: ID!) {
    customer(id: $id) {
      id
      externalId
      currency
    }
  }
`

export const CustomerUsage = () => {
  const { customerId = '' } = useParams()
  const { organization } = useOrganizationInfos()
  const { translate } = useInternationalization()
  const [periodScope, setPeriodScope] = useState<TPeriodScopeTranslationLookupValue>(
    AnalyticsPeriodScopeEnum.Year,
  )
  const { data } = useGetCustomerSubscriptionForUsageQuery({
    variables: { id: customerId },
    skip: !customerId,
  })

  return (
    <div>
      <SectionHeader variant="subhead">
        {translate('text_65564e8e4af2340050d431be')}

        <MonthSelectorDropdown periodScope={periodScope} setPeriodScope={setPeriodScope} />
      </SectionHeader>

      <Gross
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="analytics-graph"
        currency={data?.customer?.currency || organization?.defaultCurrency}
        period={periodScope}
        externalCustomerId={data?.customer?.externalId}
      />
    </div>
  )
}
