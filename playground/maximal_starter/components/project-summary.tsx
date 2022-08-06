import { OwnerWithDate } from '@/components/owner-with-date'
import { Banner } from '@/components/banner'
import { HtmlView } from '@/components/html-view'
import { HeartFilledIcon, HeartIcon, MessageIcon } from '@/components/icons'
import { classNames } from '@/lib/classnames'
import { InferQueryOutput } from '@/lib/trpc'
import * as Tooltip from '@radix-ui/react-tooltip'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useSession } from 'next-auth/react'
import { summarize } from '@/lib/text'
import Link from 'next/link'
import * as React from 'react'

export type ProjectSummaryProps = {
  project: InferQueryOutput<'public.projects-feed'>['allProjects'][0]
  hideOwner?: boolean
  active?: boolean
}

export function ProjectSummary({
  active,
  project,
  hideOwner = false,
}: ProjectSummaryProps) {
  const { summary, hasMore } = React.useMemo(
    () => summarize(project.contentHtml),
    [project.contentHtml]
  )
  const { data: session } = useSession()

  return (
    <div>
      {project.hidden && (
        <Banner className="mb-6">
          This project has been hidden and is only visible to administrators.
        </Banner>
      )}
      <div className={classNames(project.hidden ? 'opacity-50' : '')}>
        <Link
          replace
          href={
            active
              ? `/profile/${session!.user.id}/${project.id}`
              : `/project/${project.id}`
          }
        >
          <a>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {project.title}
            </h2>
          </a>
        </Link>

        <div className={classNames(hideOwner ? 'mt-2' : 'mt-6')}>
          {hideOwner ? (
            <p className="tracking-tight text-secondary">
              <time dateTime={project.createdAt.toISOString()}>
                {formatDistanceToNow(project.createdAt)}
              </time>{' '}
              ago
            </p>
          ) : (
            <OwnerWithDate owner={project.owner} date={project.createdAt} />
          )}
        </div>

        <HtmlView html={summary} className={hideOwner ? 'mt-4' : 'mt-6'} />

        <div className="flex items-center gap-4 mt-4 clear-both">
          <div className="ml-auto flex gap-6">
            <Tooltip.Root delayDuration={300}>
              <Tooltip.Trigger
                asChild
                onClick={(event) => {
                  event.preventDefault()
                }}
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
              ></Tooltip.Trigger>
              <Tooltip.Content
                side="bottom"
                sideOffset={4}
                className={classNames(
                  'max-w-[260px] px-3 py-1.5 rounded shadow-lg bg-secondary-inverse text-secondary-inverse sm:max-w-sm'
                )}
              >
                <Tooltip.Arrow
                  offset={22}
                  className="fill-gray-800 dark:fill-gray-50"
                />
              </Tooltip.Content>
            </Tooltip.Root>

            <div className="inline-flex items-center gap-1.5">
              <MessageIcon className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold tabular-nums">
                {project._count.comments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
