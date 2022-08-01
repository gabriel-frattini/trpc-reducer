import { createReactQueryHooks } from '@trpc/react'
import { createTrpcReducer } from '../../dist'
import type { AppRouter } from '../src/server/router'

export const trpc = createReactQueryHooks<AppRouter>()
export const trpcReducer = createTrpcReducer<AppRouter>(trpc)
