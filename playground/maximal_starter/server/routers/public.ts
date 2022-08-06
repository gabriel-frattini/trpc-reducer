import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../create-router'

export const publicRouter = createRouter()
  .query('projects-feed', {
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
      const where = {
        ownerId: input?.ownerId,
      }

      const allProjects = await ctx.prisma.project.findMany({
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        where,
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
              projectId: true,
              userId: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      })

      return {
        allProjects,
      }
    },
  })
  .query('project-detail', {
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
          requests: {
            select: {
              id: true,
              project: {
                select: {
                  ownerId: true,
                },
              },
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
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

      if (!projectBelongsToUser) {
        const requestedByUser = project.requests.filter(
          (req) => req.user.id === ctx.session?.user.id,
        )

        type T = typeof requestedByUser

        let invitedByUser = <T> []

        return { project, requestedByUser, invitedByUser }
      }

      const invitedByUser = project.requests.filter(
        (req) => req.project.ownerId === ctx.session?.user.id,
      )

      type T = typeof invitedByUser
      let requestedByUser = <T> []

      return { project, invitedByUser, requestedByUser }
    },
  })
  .query('search', {
    input: z.object({
      query: z.string().min(1),
    }),
    async resolve({ input, ctx }) {
      const projects = await ctx.prisma.project.findMany({
        take: 10,
        where: {
          hidden: false,
          title: { search: input.query },
          content: { search: input.query },
        },
        select: {
          id: true,
          title: true,
        },
      })

      return projects
    },
  })
