import { ReducerOutput } from '../createTrpcReducer'
import { AppRouter } from '../src/server/router'

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
