import { ReactElement, useEffect, useRef } from 'react'
import { VariableSizeList } from 'react-window'

import { ITEM_HEIGHT } from '~/styles'
import { tw } from '~/styles/utils'

import { ComboBoxProps } from './types'

export const GROUP_ITEM_KEY = 'combobox-group-by'
export const GROUP_HEADER_HEIGHT = 44

function useResetCache(itemCount: number) {
  const ref = useRef<VariableSizeList>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.resetAfterIndex(0, true)
    }
  }, [itemCount])
  return ref
}

type ComboBoxVirtualizedListProps = {
  elements: ReactElement[]
} & Pick<ComboBoxProps, 'value'>

export const ComboBoxVirtualizedList = (props: ComboBoxVirtualizedListProps) => {
  const { elements, value } = props

  const itemCount = elements?.length

  const getHeight = () => {
    const hasAnyGroupHeader = elements.some((el) => (el.key as string).includes(GROUP_ITEM_KEY))
    const hasDescription = elements.some(
      // @ts-expect-error React 19 changed the types here
      (el) => (el.props?.children?.props?.option?.description as string)?.length > 0,
    )

    const itemheightDelta = hasDescription ? 8 : 4

    // recommended perf best practice
    if (itemCount > 5) {
      return 5 * (ITEM_HEIGHT + itemheightDelta) + 4 // Add 4px for margins
    } else if (itemCount <= 2 && hasAnyGroupHeader) {
      return itemCount * (ITEM_HEIGHT + 2) // Add 2px for margins
    } else if (itemCount <= 2 && hasDescription) {
      return itemCount * (ITEM_HEIGHT + itemheightDelta) + 4 // Add 4px for margins
    }
    return itemCount * (ITEM_HEIGHT + itemheightDelta) + 4 // Add 4px for margins
  }

  // reset the `VariableSizeList` cache if data gets updated
  const gridRef = useResetCache(itemCount)

  // when value gets updated, ensure we tell <VariableSizeList>
  // to scroll to the selected option
  useEffect(() => {
    if (gridRef && value && gridRef.current) {
      const valueIndex = elements.findIndex(
        // @ts-expect-error React 19 changed the types here
        (el) => el.props?.children?.props?.option?.value === value,
      )

      if (valueIndex) {
        gridRef.current?.scrollToItem(valueIndex, 'smart')
      }
    }
  }, [value])

  return (
    <VariableSizeList
      className={tw({
        'mb-1': itemCount > 1,
      })}
      itemData={elements}
      height={getHeight()}
      width="100%"
      ref={gridRef}
      innerElementType="div"
      itemSize={(index) => {
        return index === itemCount - 1
          ? ITEM_HEIGHT
          : ((elements[index].key as string) || '').includes(GROUP_ITEM_KEY)
            ? GROUP_HEADER_HEIGHT + (index === 0 ? 2 : 6)
            : ITEM_HEIGHT + 8
      }}
      overscanCount={5}
      itemCount={itemCount}
    >
      {({ style, index }) => <div style={style}>{elements[index]}</div>}
    </VariableSizeList>
  )
}
