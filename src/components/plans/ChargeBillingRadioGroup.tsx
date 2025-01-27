import { FC, useState } from 'react'
import styled from 'styled-components'

import { Typography } from '~/components/designSystem'
import { Radio } from '~/components/form'
import { LocalChargeInput } from '~/components/plans/types'
import { RegroupPaidFeesEnum } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { theme } from '~/styles'

interface ChargeBillingRadioGroupProps {
  localCharge: LocalChargeInput
  disabled?: boolean
  handleUpdate: ({
    invoiceable,
    regroupPaidFees,
  }: {
    invoiceable: boolean
    regroupPaidFees: RegroupPaidFeesEnum | null
  }) => void
}

type ChargeBillingRadioValue = 'invoiceable' | 'regroupPaidFees' | 'none'

export const ChargeBillingRadioGroup: FC<ChargeBillingRadioGroupProps> = ({
  localCharge,
  disabled,
  handleUpdate,
}) => {
  const { translate } = useInternationalization()

  const getInitialValue = (): ChargeBillingRadioValue | undefined => {
    if (localCharge.payInAdvance) {
      if (localCharge.regroupPaidFees === RegroupPaidFeesEnum.Invoice) {
        return 'regroupPaidFees'
      }

      if (localCharge.invoiceable) {
        return 'invoiceable'
      }

      return 'none'
    }
  }

  const [radioValue, setRadioValue] = useState<ChargeBillingRadioValue | undefined>(
    getInitialValue(),
  )

  if (!radioValue) {
    return null
  }

  return (
    <RadioGroup>
      <RadioLabel>
        <Typography variant="captionHl" color="textSecondary" component="legend">
          {translate('text_6682c52081acea90520744ca')}
        </Typography>
        <Typography variant="caption">{translate('text_6682c52081acea90520745c4')}</Typography>
      </RadioLabel>

      <Radio
        label={translate('text_6687b0081931407697975943')}
        value={'invoiceable'}
        checked={radioValue === 'invoiceable'}
        onChange={(value) => {
          setRadioValue(value as ChargeBillingRadioValue)
          handleUpdate({ invoiceable: true, regroupPaidFees: null })
        }}
        labelVariant="body"
        disabled={disabled}
      />
      <Radio
        label={translate('text_6687b0081931407697975945')}
        value={'regroupPaidFees'}
        checked={radioValue === 'regroupPaidFees'}
        onChange={(value) => {
          setRadioValue(value as ChargeBillingRadioValue)
          handleUpdate({ invoiceable: false, regroupPaidFees: RegroupPaidFeesEnum.Invoice })
        }}
        labelVariant="body"
        disabled={disabled}
      />
      <Radio
        label={translate('text_6687b0081931407697975947')}
        value={'none'}
        checked={radioValue === 'none'}
        onChange={(value) => {
          setRadioValue(value as ChargeBillingRadioValue)
          handleUpdate({ invoiceable: false, regroupPaidFees: null })
        }}
        labelVariant="body"
        disabled={disabled}
      />
    </RadioGroup>
  )
}

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`

const RadioLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  margin-bottom: ${theme.spacing(2)};
`
