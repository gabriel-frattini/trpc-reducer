import type { AppRouter } from '@/server/routers/_app'
import { createReactQueryHooks } from '@trpc/react'
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import superjson from 'superjson'
import { createTrpcReducer } from 'trpc-reducer'

export const trpc = createReactQueryHooks<AppRouter>()

export const trpcReducer = createTrpcReducer<AppRouter>(trpc)
export const transformer = superjson

export type TQuery = keyof AppRouter['_def']['queries']

export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter['_def']['queries'][TRouteKey]
>

export type InferQueryInput<TRouteKey extends TQuery> = inferProcedureInput<
  AppRouter['_def']['queries'][TRouteKey]
>

export type InferQueryPathAndInput<TRouteKey extends TQuery> = [
  TRouteKey,
  Exclude<InferQueryInput<TRouteKey>, void>,
]

export type TMutation = keyof AppRouter['_def']['mutations']

export type InferMutationOutput<TRouteKey extends TMutation> = inferProcedureOutput<
  AppRouter['_def']['mutations'][TRouteKey]
>

export type InferMutationInput<TRouteKey extends TMutation> = inferProcedureOutput<
  AppRouter['_def']['mutations'][TRouteKey]
>

export type InferMutationPathAndInput<TRouteKey extends TMutation> = [
  TRouteKey,
  Exclude<InferMutationInput<TRouteKey>, void>,
]
