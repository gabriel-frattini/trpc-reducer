## trpc-reducer

- A trpc-ified react useReducer hook that lets you perform state logic in reducers just like React's [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer) hook
- When you dispatch an action, the new state updates the cache on the mutation's `onSettled()` function

## Installation

```sh
npm install trpc-reducer trpc
```

## Usage

first create your reducer hook:

```ts
// utils/trpc.ts
import { createTrpcReducer } from 'trpc-reducer'
import type { AppRouter } from './router'

export const trpc = createReactQueryHooks<AppRouter>()
export const trpcReducer = createTrpcReducer<AppRouter>(trpc)
```

then, create your reducer:

```ts
// utils/reducer.ts
import type { ReducerActions, ReducerOutput } from 'trpc-reducer'
import type { AppRouter } from './trpc'

export function myReducer(
  state: any,
  action: ReducerActions<AppRouter>,
): ReducerOutput<AppRouter> {
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
// pages/_index.tsx
import { trpcReducer } from '../utils/trpc'
import { myReducer } from './reducer'

const Index = () => {
  const [input, setInput] = useState('')
  const { state, dispatch } = trpcReducer.useTrpcReducer(
    // your reducer
    myReducer,
    // fetch state
    ['example.users.get'],
    // your actions
    {
      arg_0: ['example.user.create'],
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
        <button disabled={state.isDispatching} type='submit'>
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
