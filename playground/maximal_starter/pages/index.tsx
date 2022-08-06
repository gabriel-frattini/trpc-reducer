import * as React from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Layout } from '@/components/layout'
import { getQueryPaginationInput, Pagination } from '@/components/pagination'
import type { ProjectSummaryProps } from '@/components/project-summary'
import { ProjectSummarySkeleton } from '@/components/project-summary-skeleton'

import type { NextPageWithAuthAndLayout } from '@/lib/types'
import { InferQueryPathAndInput, trpc } from '@/lib/trpc'

const ProjectSummary = dynamic<ProjectSummaryProps>(
  () =>
    import('@/components/project-summary').then((mod) => mod.ProjectSummary),
  { ssr: false }
)

const projectS_PER_PAGE = 20

const Home: NextPageWithAuthAndLayout = () => {
  const router = useRouter()
  const currentPageNumber = router.query.page ? Number(router.query.page) : 1
  const feedQueryPathAndInput: InferQueryPathAndInput<'public.projects-feed'> =
    [
      'public.projects-feed',
      getQueryPaginationInput(projectS_PER_PAGE, currentPageNumber),
    ]

  const feedQuery = trpc.useQuery(feedQueryPathAndInput)

  if (feedQuery.data) {
    const projectCount = feedQuery.data.allProjects.length

    return (
      <>
        <Head>
          <title>Sideclub</title>
        </Head>

        {projectCount === 0 ? (
          <div className="text-center text-secondary border rounded py-20 px-10">
            There are no published projects to show yet.
          </div>
        ) : (
          <div className="flow-root">
            <ul className="divide-y space-y-6 divide-primary">
              {feedQuery.data.allProjects.map((project) => (
                <li
                  key={project.id}
                  className="py-6 px-8 bg-white border-secondary rounded-md"
                >
                  <ProjectSummary project={project} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <Pagination
          itemCount={projectCount}
          itemsPerPage={projectS_PER_PAGE}
          currentPageNumber={currentPageNumber}
        />
      </>
    )
  }

  if (feedQuery.isError) {
    return <div>Error: {feedQuery.error.message}</div>
  }

  return (
    <div className="flow-root">
      <ul className=" divide-y divide-primary">
        {[...Array(3)].map((_, idx) => (
          <li key={idx} className="py-10 bg-white">
            <ProjectSummarySkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}

Home.auth = true

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default Home
