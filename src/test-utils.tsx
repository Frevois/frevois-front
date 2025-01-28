import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { ThemeProvider } from '@mui/material'
import { configure, render, RenderOptions } from '@testing-library/react'
import React, { ReactElement, useEffect } from 'react'
import { BrowserRouter, useParams as useParamsFn } from 'react-router'

import { initializeTranslations } from './core/apolloClient'
import { initializeYup } from './formValidation/initializeYup'
import { theme } from './styles'

configure({ testIdAttribute: 'data-test' })

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() }
})

vitest.mock('react-router', async () => {
  const router = await vitest.importActual('react-router')

  const exports = {
    ...router,
    useNavigate: () => mockNavigate,
    useParams: vitest.fn(),
  }

  return {
    default: exports,
    ...exports,
  }
})

export type TestMocksType = MockedResponse<Record<string, unknown>, Record<string, unknown>>[]

export const AllTheProviders = ({
  children,
  mocks,
  useParams,
  // Needed when using fragments in queries
  // https://github.com/apollographql/apollo-client/issues/8276#issuecomment-847064393
  // NOTE: AllTheProviders type should force forceTypenames true if mocks includes __typename
  forceTypenames = false,
}: {
  children: React.ReactNode
  mocks?: TestMocksType
  useParams?: { [key: string]: string }
  forceTypenames?: boolean
}) => {
  useEffect(() => {
    initializeTranslations()
    initializeYup()
  }, [])
  // Get Apollo error messages explicitely
  loadDevMessages()
  loadErrorMessages()

  !!useParams && vitest.mocked(useParamsFn).mockReturnValue(useParams)

  return (
    <BrowserRouter basename="/">
      <MockedProvider addTypename={forceTypenames} mocks={mocks}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </MockedProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { mocks?: TestMocksType },
) =>
  render(ui, {
    wrapper: (props) => <AllTheProviders {...props} mocks={options?.mocks} />,
    ...options,
  })

export { customRender as render }
export { mockNavigate as testMockNavigateFn }
