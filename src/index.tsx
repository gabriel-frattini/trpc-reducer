import { AnyRouter, inferHandlerInput, inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server'

type TQuery<TRouter extends AnyRouter> = keyof TRouter['_def']['queries']

type InferQueryOutput<
  TRouter extends AnyRouter,
> = inferProcedureOutput<TRouter['_def']['queries'][TQuery<TRouter>]>

type inferProcedures<TObj extends ProcedureRecord<any>> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>
    output: inferProcedureOutput<TObj[TPath]>
  }
}

type TPath<TRouter extends AnyRouter> =
  & string
  & keyof TRouter['_def']['queries']

export type ReducerOutput<TRouter extends AnyRouter> = inferProcedureOutput<
  TRouter['_def']['queries'][TPath<TRouter>]
>

type TPathAndInput<TRouter extends AnyRouter> = [
  keyof TRouter['_def']['queries'] & string,
  (
    | inferProcedureInput<
      TRouter['_def']['queries'][keyof TRouter['_def']['queries'] & string]
    >
    | undefined
  )?,
]

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? {
    type: Key
  }
    : {
      type: Key
      payload: M[Key]
    }
}

type InferMutationPathAndInput<TRouter extends AnyRouter> = inferProcedures<TRouter['_def']['mutations']>

export type ReducerActions<
  TRouter extends AnyRouter,
> = {
  type: keyof ActionMap<InferMutationPathAndInput<TRouter>>
  payload: inferProcedures<
    TRouter['_def']['mutations']
  >[keyof TRouter['_def']['mutations'] & string]['input']
}

export function createTRPCReducer<TRouter extends AnyRouter>(
  reducer: (
    state: InferQueryOutput<TRouter>,
    action: {
      type: [keyof TRouter['_def']['mutations'] & string]
      payload: any
    },
  ) => ReducerOutput<TRouter>,
  trpcApi: any,
) {
  function useTrpcReducer<TRouter extends AnyRouter>(
    prevState: [
      path: keyof TRouter['_def']['queries'] & string,
      ...args: inferHandlerInput<
        TRouter['_def']['queries'][keyof TRouter['_def']['queries'] & string]
      >,
    ],
    actions: {
      arg_0: [keyof TRouter['_def']['mutations'] & string]
      arg_1?: [keyof TRouter['_def']['mutations'] & string]
    },
  ) {
    const cacheKey = prevState as unknown as TPathAndInput<TRouter>

    const { useQuery, useMutation, useContext } = trpcApi
    const ctx = useContext()

    const procedureQuery = useQuery(prevState)
    const firstProcedureMutation = useMutation(actions.arg_0)
    const secondProcedureMutation = useMutation(actions.arg_1)

    function dispatch({
      type,
      payload,
    }: {
      type: [keyof ActionMap<InferMutationPathAndInput<TRouter>> & string]
      payload: inferProcedures<
        TRouter['_def']['mutations']
      >[keyof TRouter['_def']['mutations'] & string]['input']
    }) {
      if (type[0] === actions.arg_0[0]) {
        firstProcedureMutation.mutate(payload, {
          onSuccess: async () => {
            await ctx.cancelQuery(cacheKey)
            const cachedState = ctx.getQueryData(cacheKey)
            if (cachedState) {
              const newState = reducer(cachedState, {
                payload,
                type,
              })
              ctx.setQueryData(cacheKey, { ...newState })
            }
            return { cachedState }
          },
          onError: (context: any) => {
            if (context?.cachedData) {
              ctx.setQueryData(cacheKey, context.cachedData)
            }
          },
        })
        return { state: procedureQuery, dispatch }
      }
      if (actions.arg_1 && type[0] === actions.arg_1[0]) {
        secondProcedureMutation.mutate(payload, {
          onSuccess: async () => {
            await ctx.cancelQuery(cacheKey)
            const cachedState = ctx.getQueryData(cacheKey)
            if (cachedState) {
              const newState = reducer(cachedState, {
                payload,
                type,
              })
              ctx.setQueryData(cacheKey, { ...newState })
            }
            return { cachedState }
          },
          onError: (context: any) => {
            if (context?.cachedData) {
              ctx.setQueryData(cacheKey, context.cachedData)
            }
          },
        })
        return { state: procedureQuery, dispatch }
      }
    }
    return { state: procedureQuery, dispatch }
  }

  return {
    useTrpcReducer,
  }
}
