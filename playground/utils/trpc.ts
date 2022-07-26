import { createReactQueryHooks } from '@trpc/react'
import { createTRPCReducer } from '../../dist'
import type { AppRouter } from '../src/server/router'
import { myReducer } from './reducer'

export const trpc = createReactQueryHooks<AppRouter>()
export const trpcReducer = createTRPCReducer(myReducer, trpc)
