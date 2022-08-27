import { markdownToHtml } from '@/lib/editor'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createProtectedRouter } from '../create-protected-router'

export const projectRouter = createProtectedRouter()
  .query('active-feed', {
    input: z
      .object({
        take: z.number().min(1).max(50).optional(),
        skip: z.number().min(1).optional(),
        ownerId: z.string().optional(),
      })
      .optional(),
    async resolve({ input, ctx }) {
      const take = input?.take ?? 50
      const skip = input?.skip

      const activeProjects = await ctx.prisma.projectMember.findMany({
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          userId: input?.ownerId,
        },
        select: {
          Project: {
            select: {
              id: true,
              title: true,
              contentHtml: true,
              createdAt: true,
              hidden: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              votedBy: {
                orderBy: {
                  createdAt: 'asc',
                },
                select: {
                  userId: true,
                  projectId: true,
                },
              },
              comments: true,
            },
          },
        },
      })

      return {
        activeProjects,
      }
    },
  })
  .mutation('add', {
    input: z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const project = await ctx.prisma.project.create({
        data: {
          title: input.title,
          content: input.content,
          contentHtml: markdownToHtml(input.content),
          owner: {
            connect: {
              id: ctx.session?.user.id,
            },
          },
        },
      })

      return project
    },
  })
  .mutation('edit', {
    input: z.object({
      id: z.number(),
      data: z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    }),
    async resolve({ ctx, input }) {
      const { id, data } = input

      const project = await ctx.prisma.project.findUnique({
        where: { id },
        select: {
          owner: {
            select: {
              id: true,
            },
          },
        },
      })

      const projectBelongsToUser = project?.owner.id === ctx.session.user.id

      if (!projectBelongsToUser) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const updatedProject = await ctx.prisma.project.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          contentHtml: markdownToHtml(data.content),
        },
      })

      return updatedProject
    },
  })
  .mutation('delete', {
    input: z.number(),
    async resolve({ input: id, ctx }) {
      const project = await ctx.prisma.project.findUnique({
        where: { id },
        select: {
          owner: {
            select: {
              id: true,
            },
          },
        },
      })

      const projectBelongsToUser = project?.owner.id === ctx.session.user.id

      if (!projectBelongsToUser) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await ctx.prisma.project.delete({ where: { id } })
      return id
    },
  })
  .mutation('request-to-join', {
    input: z.object({
      projectId: z.number(),
      message: z.string().max(255).optional(),
    }),
    async resolve({ ctx, input }) {
      const request = await ctx.prisma.request.create({
        data: {
          projectId: input.projectId,
          status: 'PENDING',
          type: 'JOIN',
          userId: ctx.session.user.id,
          message: input?.message,
        },
      })

      return request
    },
  })
  .mutation('cancel-request', {
    input: z.object({
      requestId: z.number(),
    }),
    async resolve({ ctx, input }) {
      const deletedRequest = await ctx.prisma.request.delete({
        where: {
          id: input.requestId,
        },
      })
      return deletedRequest
    },
  })
  .mutation('invite-to-project', {
    input: z.object({
      userId: z.string(),
      projectId: z.number(),
      message: z.string().min(3).max(255).optional(),
    }),
    async resolve({ ctx, input }) {
      const data = await ctx.prisma.request.create({
        data: {
          type: 'INVITE',
          status: 'PENDING',
          userId: input.userId,
          projectId: input.projectId,
          message: input?.message,
        },
      })

      return { userId: data.userId, id: data.id }
    },
  })
  .mutation('accept-invite', {
    input: z.object({
      projectId: z.number(),
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const member = await ctx.prisma.projectMember.create({
        data: {
          ...input,
        },
      })
      return { member }
    },
  })
  .mutation('update-invite-status', {
    input: z.object({
      inviteId: z.number(),
      status: z.enum(['REJECT', 'ACCEPT']),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.request.update({
        where: {
          id: input.inviteId,
        },
        data: {
          status: input.status,
        },
        select: {
          id: true,
          message: true,
          type: true,
        },
      })
    },
  })
  .mutation('update-request-status', {
    input: z.object({
      requestId: z.number(),
      status: z.enum(['ACCEPT', 'REJECT', 'PENDING']),
    }),
    async resolve({ ctx, input }) {
      const status = await ctx.prisma.request.update({
        where: {
          id: input.requestId,
        },
        data: {
          status: input.status,
        },
      })
      return { status }
    },
  })
  .query('request-feed', {
    async resolve({ ctx }) {
      const requests = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          requests: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              status: true,
              message: true,
              createdAt: true,
              type: true,
              project: {
                select: {
                  id: true,
                  title: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      const requestCount = await ctx.prisma.request.count({
        where: {
          userId: ctx.session.user.id,
        },
      })

      return { requests, requestCount }
    },
  })
  .mutation('vote', {
    input: z.object({
      projectId: z.number(),
      type: z.enum(['UP', 'DOWN']),
    }),
    async resolve({ ctx, input }) {
      const vote = await ctx.prisma.vote.create({
        data: {
          type: input.type,
          project: {
            connect: {
              id: input.projectId,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      })

      return { vote }
    },
  })
  .mutation('hide', {
    input: z.number(),
    async resolve({ input: id, ctx }) {
      if (!ctx.isUserAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const project = await ctx.prisma.project.update({
        where: { id },
        data: {
          hidden: true,
        },
        select: {
          id: true,
        },
      })
      return project
    },
  })
  .mutation('unhide', {
    input: z.number(),
    async resolve({ input: id, ctx }) {
      if (!ctx.isUserAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const project = await ctx.prisma.project.update({
        where: { id },
        data: {
          hidden: false,
        },
        select: {
          id: true,
        },
      })
      return project
    },
  })
  .mutation('undo-vote', {
    input: z.object({
      projectId: z.number(),
    }),
    async resolve({ ctx, input }) {
      const vote = await ctx.prisma.vote.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.session.user.id,
          },
        },
      })
      if (!vote) return {}
      return vote
    },
  })
  .query('my-vote', {
    input: z.object({
      projectId: z.number(),
    }),
    async resolve({ ctx, input }) {
      const myVote = await ctx.prisma.vote.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.session.user.id,
          },
        },
      })
      return { data: myVote }
    },
  })
  .query('active-project-detail', {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ ctx, input }) {
      const project = await ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,

          title: true,
          content: true,
          contentHtml: true,
          createdAt: true,
          hidden: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          votedBy: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              type: true,
              user: {
                select: {
                  id: true,
                },
              },
              project: {
                select: {
                  id: true,
                },
              },
            },
          },
          comments: {
            orderBy: {
              createdAt: 'asc',
            },
            select: {
              id: true,
              private: true,
              content: true,
              contentHtml: true,
              createdAt: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      const projectBelongsToUser = project?.owner.id === ctx.session?.user.id

      if (!project || (project.hidden && !projectBelongsToUser)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${input.id}'`,
        })
      }

      return { project }
    },
  })
