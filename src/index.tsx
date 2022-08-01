import { TRPCClientErrorLike } from '@trpc/client'
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

type TPathAndArgs<TRouter extends AnyRouter> = [
  path: keyof TRouter['_def']['queries'] & string,
  ...args: inferHandlerInput<
    TRouter['_def']['queries'][keyof TRouter['_def']['queries'] & string]
  >,
]

interface TrpcInterface<TRouter extends AnyRouter, TData, TError> {
  useMutation: (q: [keyof TRouter['_def']['mutations'] & string]) => UseMutationResult
  useQuery: (q: TPathAndArgs<TRouter>) => UseQueryResult<TData, TError>
  useContext: any
}

export function createTrpcReducer<
  TRouter extends AnyRouter,
>(
  reducer: (
    state: InferQueryOutput<TRouter>,
    action: ReducerActions<TRouter>,
  ) => ReducerOutput<TRouter>,
  trpcApi: any,
) {
  type TMutationPath = [keyof TRouter['_def']['mutations'] & string]
  type TQueryValues = inferProcedures<TRouter['_def']['queries']>
  type TError = TRPCClientErrorLike<TRouter>
  type TQueries = TRouter['_def']['queries']
  function useTrpcReducer<
    TPath extends keyof TQueryValues & string,
    TData = inferProcedures<TRouter['_def']['queries']>[TPath]['output'],
  >(
    prevState: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    actions: {
      arg_0: TMutationPath
      arg_1?: TMutationPath
      arg_2?: TMutationPath
      arg_3?: TMutationPath
    },
  ) {
    const { useQuery, useMutation, useContext } = trpcApi as unknown as TrpcInterface<TRouter, TData, TError>
    const ctx = useContext()

    const procedureQuery = useQuery(prevState)

    const firstProcedureMutation = useMutation(actions.arg_0)
    const secondProcedureMutation = useMutation(actions.arg_1 ? actions.arg_1 : [''])
    const thirdProcedureMutation = useMutation(actions.arg_2 ? actions.arg_2 : [''])
    const fourthProcedureMutation = useMutation(actions.arg_3 ? actions.arg_3 : [''])

    function updateState({ mutation, payload, type }: { mutation: UseMutationResult; payload: any; type: any }) {
      mutation.mutate(payload, {
        onSuccess: async () => {
          await ctx.cancelQuery(prevState)
          const cachedState = ctx.getQueryData(prevState)
          if (cachedState) {
            const newState = reducer(cachedState, {
              payload,
              type,
            })
            ctx.setQueryData(prevState, { ...newState })
          }
          return { cachedState }
        },
        onError: (context: any) => {
          if (context?.cachedData) {
            ctx.setQueryData(prevState, context.cachedData)
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
