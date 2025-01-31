import { CustomRouteObject } from './types'
import { lazyLoad } from './utils'

// ----------- Layouts -----------
const Developers = lazyLoad(() => import('~/layouts/Developers'))
// ----------- Pages -----------

const ApiKeys = lazyLoad(() => import('~/pages/developers/ApiKeys'))
const Webhooks = lazyLoad(() => import('~/pages/developers/Webhooks'))
const WebhookLogs = lazyLoad(() => import('~/pages/developers/WebhookLogs'))
const Debugger = lazyLoad(() => import('~/pages/developers/Debugger'))

// ----------- Routes -----------
// Developers routes
export const DEVELOPERS_ROUTE = '/developers'
export const API_KEYS_ROUTE = `${DEVELOPERS_ROUTE}/api-keys`
export const WEBHOOK_ROUTE = `${DEVELOPERS_ROUTE}/webhooks`
export const WEBHOOK_LOGS_ROUTE = `${DEVELOPERS_ROUTE}/webhooks/:webhookId/logs`
export const WEBHOOK_LOGS_TAB_ROUTE = `${DEVELOPERS_ROUTE}/webhooks/:webhookId/logs/:tab`
export const DEBUGGER_ROUTE = `${DEVELOPERS_ROUTE}/debugger`

export const developperRoutes: CustomRouteObject[] = [
  {
    private: true,
    element: <Developers />,
    permissions: ['developersManage'],
    children: [
      {
        path: [API_KEYS_ROUTE, DEVELOPERS_ROUTE],
        private: true,
        element: <ApiKeys />,
        permissions: ['developersKeysManage'],
      },
      {
        path: WEBHOOK_ROUTE,
        private: true,
        element: <Webhooks />,
        permissions: ['developersManage'],
      },
      {
        path: DEBUGGER_ROUTE,
        private: true,
        element: <Debugger />,
        permissions: ['developersManage'],
      },
    ],
  },
  {
    private: true,
    path: [WEBHOOK_LOGS_ROUTE, WEBHOOK_LOGS_TAB_ROUTE],
    element: <WebhookLogs />,
    permissions: ['developersManage'],
  },
]
