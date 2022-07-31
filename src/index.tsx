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

export function createTrpcReducer<
  TRouter extends AnyRouter,
  TMutationPath extends [keyof TRouter['_def']['mutations' & string]],
>(
  reducer: (
    state: InferQueryOutput<TRouter>,
    action: {
      type: TMutationPath
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
      arg_0: TMutationPath
      arg_1?: TMutationPath
      arg_2?: TMutationPath
      arg_3?: TMutationPath
    },
  ) {
    const cacheKey = prevState as unknown as TPathAndInput<TRouter>

    const { useQuery, useMutation, useContext } = trpcApi
    const ctx = useContext()

    const procedureQuery = useQuery(prevState)
    const firstProcedureMutation = useMutation(actions.arg_0)
    const secondProcedureMutation = useMutation(actions.arg_1)
    const thirdProcedureMutation = useMutation(actions.arg_2)
    const fourthProcedureMutation = useMutation(actions.arg_3)

    function updateState({ mutation, payload, type }: { mutation: any; payload: any; type: any }) {
      mutation.mutate(payload, {
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
        updateState({ mutation: firstProcedureMutation, payload, type })
      }
      if (actions.arg_1 && type[0] === actions.arg_1[0]) {
        updateState({ mutation: secondProcedureMutation, payload, type })
      }
      if (actions.arg_2 && type[0] === actions.arg_2[0]) {
        updateState({ mutation: thirdProcedureMutation, payload, type })
      }
      if (actions.arg_3 && type[0] === actions.arg_3[0]) {
        updateState({ mutation: fourthProcedureMutation, payload, type })
      }
    }
    return { state: procedureQuery, dispatch }
  }

  return {
    useTrpcReducer,
  }
}
