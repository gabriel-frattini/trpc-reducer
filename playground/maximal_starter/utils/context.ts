import { TRPCClient } from '@trpc/client'
import { AnyRouter, inferHandlerInput, inferProcedureOutput } from '@trpc/server'
import { createContext } from 'react'

export interface TRPCContextState<TRouter extends AnyRouter> {
  client: TRPCClient<TRouter>
  mutate<
    TPath extends keyof TRouter['_def']['queries'] & string,
    TProcedure extends TRouter['_def']['queries'][TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>],
  ): Promise<TOutput | undefined>
}

export const TRPCContext = createContext(null as any)
