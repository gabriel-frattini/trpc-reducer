import { Layout } from '@/components/layout'
import { ProjectForm } from '@/components/project-form'
import { trpc } from '@/lib/trpc'
import type { NextPageWithAuthAndLayout } from '@/lib/types'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const EditProjectPage: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const projectQuery = trpc.useQuery([
    'public.project-detail',
    { id: Number(router.query.id) },
  ])
  const editProjectMutation = trpc.useMutation('project.edit', {
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  if (projectQuery.data) {
    const projectBelongsToUser =
      projectQuery.data.project.owner.id === session!.user.id

    return (
      <>
        <Head>
          <title>Edit {projectQuery.data.project.id} - sideclub</title>
        </Head>

        {projectBelongsToUser ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Edit &quot;{projectQuery.data.project.title}&quot;
            </h1>

            <div className="mt-6">
              <ProjectForm
                isSubmitting={editProjectMutation.isLoading}
                defaultValues={{
                  title: projectQuery.data.project.title,
                  content: projectQuery.data.project.content,
                }}
                backTo={`/project/${projectQuery.data.project.id}`}
                onSubmit={(values) => {
                  editProjectMutation.mutate(
                    {
                      id: projectQuery.data.project.id,
                      data: { title: values.title, content: values.content },
                    },
                    {
                      onSuccess: () =>
                        router.push(`/project/${projectQuery.data.project.id}`),
                    }
                  )
                }}
              />
            </div>
          </>
        ) : (
          <div>You don&apos;t have permissions to edit this project.</div>
        )}
      </>
    )
  }

  if (projectQuery.isError) {
    return <div>Error: {projectQuery.error.message}</div>
  }

  return (
    <div className="animate-pulse">
      <div className="w-3/4 bg-gray-200 rounded h-9 dark:bg-gray-700" />
      <div className="mt-7">
        <div>
          <div className="w-10 h-5 bg-gray-200 rounded dark:bg-gray-700" />
          <div className="border rounded h-[42px] border-secondary mt-2" />
        </div>
        <div className="mt-6">
          <div className="w-10 h-5 bg-gray-200 rounded dark:bg-gray-700" />
          <div className="mt-2 border rounded h-9 border-secondary" />
          <div className="mt-2 border rounded h-[378px] border-secondary" />
        </div>
      </div>
      <div className="flex gap-4 mt-9">
        <div className="w-[92px] bg-gray-200 rounded-full h-button dark:bg-gray-700" />
        <div className="w-20 border rounded-full h-button border-secondary" />
      </div>
    </div>
  )
}

EditProjectPage.auth = true

EditProjectPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default EditProjectPage
