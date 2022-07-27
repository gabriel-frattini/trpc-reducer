## trpc-reducer
[tRPC](https://trpc.io/)-ified [SWR](https://swr.vercel.app/) hooks

- A trpc-ified react useReducer hook that lets you perform state logic in reducers.
- This hook solves a specific problem which is updating the cache on mutations, but with actions and dispatches that comes from the useReducer architecture

## Installation

```sh
npm install trpc-reducer trpc
```

## Usage

First, create your reducer and wrap it with the ReducerOutput type:

```ts
// utils/reducer.ts
import type { AppRouter } from './trpc'
import type { ReducerOutput } from 'trpc-reducer'

export function myReducer(state: any, action: any): ReducerOutput<AppRouter> {
  switch (action.type[0]) {
    case 'example.user.create':
      return {
        users: [...state.users, action.payload],
      }

    case 'example.user.delete':
      return {
        users: state.users.filter((user: any) => user.id !== action.payload.id),
      }
    default:
      return state
  }
}
```

Use it:
```ts
// utils/trpc.ts
import { myReducer } from './reducer'
import { createTrpcReducer } from 'trpc-reducer'
// `import type` ensures this import is fully erased at runtime
import type { AppRouter } from './router'

export const trpc = createReactQueryHooks<AppRouter>()
export const trpcReducer = createTrpcReducer(myReducer, trpc)
```

```ts
// pages/_index.tsx
import { trpcReducer } from '../utils/trpc'

const Index = () => {
  const [input, setInput] = useState('')
  const { state, dispatch } = trpcReducer.useTRPCReducer(
  ['example.users.get'],
  {
    arg_0: ['example.user.create'],
    arg_1: ['example.user.delete'],
  },
)

  return (
   <main>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({
              payload: {
                name: input,
                id: new Date().toTimeString().slice(0, 8),
              },
              type: ['example.user.create'],
            })
            setInput('')
          }}
        >
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            name='name'
            id='name'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button disabled={state.isLoading} type='submit'>
            {state.isLoading ? 'loading...' : 'Add Name'}
          </button>
        </form>

        <ul>
          {state.data
            && state.data.users.map((user, idx) => (
              <li key={idx}>
                {user.name}
              </li>
            ))}
        </ul>
      </main>
  )
}
```
