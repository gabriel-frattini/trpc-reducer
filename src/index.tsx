import { TRPCClientErrorLike } from '@trpc/client'
import { TRPCContextState } from '@trpc/react/src/internals/context'
import { AnyRouter, inferHandlerInput, inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server'
import { UseMutationResult, UseQueryResult } from 'react-query'
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

type TPathAndArgs<TRouter extends AnyRouter> = [
  path: keyof TRouter['_def']['queries'] & string,
  ...args: inferHandlerInput<
    TRouter['_def']['queries'][keyof TRouter['_def']['queries'] & string]
  >,
]

export type ReducerOutput<TRouter extends AnyRouter> = inferProcedureOutput<
  TRouter['_def']['queries'][TPath<TRouter>]
>

export type ReducerActions<
  TRouter extends AnyRouter,
> = {
  type: [keyof ActionMap<InferMutationPathAndInput<TRouter>>]
  payload: inferProcedures<
    TRouter['_def']['mutations']
  >[keyof TRouter['_def']['mutations'] & string]['input']
}

export type TDispatch<TRouter extends AnyRouter> = {
  type: [keyof ActionMap<InferMutationPathAndInput<TRouter>> & string]
  payload: inferProcedures<
    TRouter['_def']['mutations']
  >[keyof TRouter['_def']['mutations'] & string]['input']
}

export function createTrpcReducer<
  TRouter extends AnyRouter,
>(
  trpcApi: {
    Provider: any
    createClient: any
    useContext: any
    useQuery: any
    useMutation: any
    useSubscription: any
    useDehydratedState: any
    useInfiniteQuery: any
  },
) {
  type TMutationPath = [keyof TRouter['_def']['mutations'] & string]
  type TQueryValues = inferProcedures<TRouter['_def']['queries']>
  type TError = TRPCClientErrorLike<TRouter>
  type TQueries = TRouter['_def']['queries']
  type TOpts = { onlyUpdateCache?: boolean; args?: any }

  function useTrpcReducer<
    TPath extends keyof TQueryValues & string,
    TData = inferProcedures<TRouter['_def']['queries']>[TPath]['output'],
  >(
    reducer: (
      state: InferQueryOutput<TRouter>,
      action: ReducerActions<TRouter>,
      args: any,
    ) => ReducerOutput<TRouter>,
    prevState: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    actions: {
      arg_0: TMutationPath
      arg_1?: TMutationPath
      arg_2?: TMutationPath
      arg_3?: TMutationPath
      arg_4?: TMutationPath
    },
  ) {
    const { useQuery, useMutation, useContext } = trpcApi as unknown as {
      useMutation: (q: [keyof TRouter['_def']['mutations'] & string]) => UseMutationResult
      useQuery: (q: TPathAndArgs<TRouter>) => UseQueryResult<TData, TError>
      useContext: () => TRPCContextState<TRouter>
    }
    const ctx = useContext()

    const procedureQuery = useQuery(prevState)

    const firstProcedureMutation = useMutation(actions.arg_0)
    const secondProcedureMutation = useMutation(actions.arg_1 ? actions.arg_1 : [''])
    const thirdProcedureMutation = useMutation(actions.arg_2 ? actions.arg_2 : [''])
    const fourthProcedureMutation = useMutation(actions.arg_3 ? actions.arg_3 : [''])
    const fifthProcedureMutation = useMutation(actions.arg_4 ? actions.arg_4 : [''])

    const cacheKey = prevState as unknown as [
      keyof TRouter['_def']['queries'] & string,
      (inferProcedureInput<TRouter['_def']['queries'][keyof TRouter['_def']['queries'] & string]>),
    ]
    function updateState(
      { mutation, action: { payload, type }, opts }: {
        mutation: UseMutationResult
        action: TDispatch<TRouter>
        opts?: TOpts
      },
    ) {
      if (opts && opts.onlyUpdateCache) {
        const cachedState = ctx.getQueryData(cacheKey)
        if (cachedState) {
          const newState = reducer(cachedState, {
            payload,
            type,
          }, opts)
          ctx.setQueryData(cacheKey, { ...newState })
          return { cachedState }
        }
      }

      mutation.mutate(payload, {
        onSettled: async () => {
          await ctx.cancelQuery(cacheKey)
          const cachedState = ctx.getQueryData(cacheKey)
          if (cachedState) {
            const newState = reducer(cachedState, {
              payload,
              type,
            }, opts)
            ctx.setQueryData(cacheKey, { ...newState })
          }
          return { cachedState }
        },
        onError: (error) => {
          console.error(error)
        },
      })
      return { state: procedureQuery, dispatch }
    }

    function dispatch(action: TDispatch<TRouter>, opts?: TOpts) {
      const { type } = action
      if (type[0] === actions.arg_0[0]) {
        updateState({ mutation: firstProcedureMutation, action, opts })
      }
      if (actions.arg_1 && type[0] === actions.arg_1[0]) {
        updateState({ mutation: secondProcedureMutation, action, opts })
      }
      if (actions.arg_2 && type[0] === actions.arg_2[0]) {
        updateState({ mutation: thirdProcedureMutation, action, opts })
      }
      if (actions.arg_3 && type[0] === actions.arg_3[0]) {
        updateState({ mutation: fourthProcedureMutation, action, opts })
      }
      if (actions.arg_4 && type[0] === actions.arg_4[0]) {
        updateState({ mutation: fifthProcedureMutation, action, opts })
      }
    }
    return { state: procedureQuery, dispatch }
  }

  return {
    useTrpcReducer,
  }
}
