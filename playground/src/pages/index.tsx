import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { myReducer } from '../../utils/reducer'
import { trpcReducer } from '../../utils/trpc'

const Home: NextPage = () => {
  const [input, setInput] = useState('')
  const { state, dispatch } = trpcReducer.useTrpcReducer(
    myReducer,
    ['example.users.get'],
    {
      arg_0: ['example.user.create'],
      arg_1: ['example.user.delete'],
    },
  )

  return (
    <>
      <Head>
        <title>UseTrpcReducer</title>
        <meta name='description' content='UseTrpcReducer Playground' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1>trpc-reducer</h1>

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
                <button
                  onClick={() =>
                    dispatch({
                      payload: { id: user.id },
                      type: ['example.user.delete'],
                    })}
                >
                  {state.isLoading ? 'loading...' : 'Delete'}
                </button>
              </li>
            ))}
        </ul>
      </main>
    </>
  )
}

export default Home
