import { markdownToHtml } from '@/lib/editor'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createProtectedRouter } from '../create-protected-router'

export const commentRouter = createProtectedRouter()
  .mutation('add', {
    input: z.object({
      projectId: z.number(),
      content: z.string().min(1),
      private: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      const comment = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          contentHtml: markdownToHtml(input.content),
          private: input.private,
          owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          project: {
            connect: {
              id: input.projectId,
            },
          },
        },
      })

      return comment
    },
  })
  .mutation('edit', {
    input: z.object({
      id: z.number(),
      data: z.object({
        content: z.string().min(1),
      }),
    }),
    async resolve({ ctx, input }) {
      const { id, data } = input

      const comment = await ctx.prisma.comment.findUnique({
        where: { id },
        select: {
          owner: {
            select: {
              id: true,
            },
          },
        },
      })

      const commentBelongsToUser = comment?.owner.id === ctx.session.user.id

      if (!commentBelongsToUser) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const updatedComment = await ctx.prisma.comment.update({
        where: { id },
        data: {
          content: data.content,
          contentHtml: markdownToHtml(data.content),
        },
      })

      return updatedComment
    },
  })
  .mutation('delete', {
    input: z.number(),
    async resolve({ input: id, ctx }) {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id },
        select: {
          owner: {
            select: {
              id: true,
            },
          },
        },
      })

      const commentBelongsToUser = comment?.owner.id === ctx.session.user.id

      if (!commentBelongsToUser) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await ctx.prisma.comment.delete({ where: { id } })
      return id
    },
  })
