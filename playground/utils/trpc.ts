import { createReactQueryHooks } from '@trpc/react'
import { createTrpcReducer } from '../../dist'
import type { AppRouter } from '../src/server/router'
import { myReducer } from './reducer'

export const trpc = createReactQueryHooks<AppRouter>()
export const trpcReducer = createTrpcReducer<AppRouter>(myReducer, trpc)
