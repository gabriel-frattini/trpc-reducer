import { z } from 'zod'
import { createRouter } from './context'

export const exampleRouter = createRouter()
  .query('users.get', {
    async resolve({ ctx }) {
      const users = await ctx.prisma.user.findMany()
      if (users) return { users }
      return { users: [] }
    },
  })
  .mutation('user.create', {
    input: z.object({
      name: z.string().min(1).max(20),
      id: z.string(),
    }),
    async resolve({ input: { name, id }, ctx }) {
      const newUser = await ctx.prisma.user.create({
        data: {
          name,
          id,
        },
      })

      return newUser
    },
  })
  .mutation('user.delete', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input: { id }, ctx }) {
      await ctx.prisma.user.delete({
        where: {
          id,
        },
      })
    },
  })
