import superjson from 'superjson'
import { createRouter } from '../create-router'
import { commentRouter } from './comment'
import { projectRouter } from './project'
import { publicRouter } from './public'
import { userRouter } from './user'

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('project.', projectRouter)
  .merge('comment.', commentRouter)
  .merge('user.', userRouter)
  .merge('public.', publicRouter)

export type AppRouter = typeof appRouter
