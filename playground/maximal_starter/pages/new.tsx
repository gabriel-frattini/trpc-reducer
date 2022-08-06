import { Layout } from '@/components/layout'
import { ProjectForm } from '@/components/project-form'
import { trpc } from '@/lib/trpc'
import type { NextPageWithAuthAndLayout } from '@/lib/types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const NewprojectPage: NextPageWithAuthAndLayout = () => {
  const router = useRouter()
  const addprojectMutation = trpc.useMutation('project.add', {
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <>
      <Head>
        <title>New Project - Sideclub</title>
      </Head>

      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        New project
      </h1>

      <div className="mt-6">
        <ProjectForm
          isSubmitting={addprojectMutation.isLoading}
          defaultValues={{
            title: '',
            content: '',
          }}
          backTo="/"
          onSubmit={(values) => {
            addprojectMutation.mutate(
              { title: values.title, content: values.content },
              {
                onSuccess: (data) => router.push(`/project/${data.id}`),
              }
            )
          }}
        />
      </div>
    </>
  )
}

NewprojectPage.auth = true

NewprojectPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default NewprojectPage
