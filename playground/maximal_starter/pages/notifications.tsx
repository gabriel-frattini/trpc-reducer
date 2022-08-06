import React from 'react'

import { Layout } from '@/components/layout'

import { NextPageWithAuthAndLayout } from '@/lib/types'

import { trpcReducer } from '@/lib/trpc'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { InferQueryOutput } from '@/lib/trpc'

import { TDispatch } from 'trpc-reducer'
import { AppRouter } from '@/server/routers/_app'
import { ActionButton } from '@/components/action-button'
import { activityReducer } from 'utils/reducer'

const Notifications: NextPageWithAuthAndLayout = () => {
  const { state, dispatch } = trpcReducer.useTrpcReducer(
    activityReducer,
    ['user.activity'],
    {
      arg_0: ['project.cancel-request'],
      arg_1: ['project.accept-invite'],
      arg_2: ['project.update-invite-status'],
    }
  )

  if (!state.data || !state.data?.activity.length) {
    return (
      <div className="flex flex-col justify-center items-center mt-4">
        <p>No new notifications</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className=" divide-y divide-primary">
        {state.data &&
          state.data.activity.map((activity, idx) => (
            <li key={idx} className="py-10 bg-white px-6 mb-4">
              <Activity
                dispatch={dispatch}
                activity={activity}
                isLoading={state.isDispatching}
              />
            </li>
          ))}
      </ul>
    </div>
  )
}

Notifications.auth = true

Notifications.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export type ActivityProps = {
  activity: InferQueryOutput<'user.activity'>['activity'][0]
  dispatch: (action: TDispatch<AppRouter>, ...args: any) => void
  isLoading: boolean
}

export function Activity({ activity, dispatch, isLoading }: ActivityProps) {
  const { data: session } = useSession()
  if (!session) {
    return <></>
  }

  const handleAcceptInvite = async ({
    projectId,
    userId,
    inviteId,
  }: {
    projectId: number
    userId: string
    inviteId: number
  }) => {
    await Promise.all([
      dispatch({
        payload: {
          projectId,
          userId,
        },
        type: ['project.accept-invite'],
      }),

      dispatch({
        payload: {
          inviteId,
          status: 'ACCEPT',
        },
        type: ['project.update-invite-status'],
      }),
    ])
  }
  return (
    <div className="flex flex-col justify-center items-center ">
      {activity.project.owner.id === session.user.id ? (
        <>
          {activity.type === 'JOIN' ? (
            <div>
              <p>
                {activity.user.name} wants to join {activity.project.title}
              </p>{' '}
              <div>
                <ActionButton
                  onAction={() =>
                    handleAcceptInvite({
                      inviteId: activity.id,
                      projectId: activity.project.id,
                      userId: session.user.id,
                    })
                  }
                  onActionChildren={'Accept'}
                  isLoading={isLoading}
                />

                <ActionButton
                  onActionChildren={'Reject'}
                  onCancel={() =>
                    dispatch({
                      type: ['project.update-invite-status'],
                      payload: {
                        status: 'REJECT',
                        inviteId: activity.id,
                      },
                    })
                  }
                />
              </div>
            </div>
          ) : (
            <div className=" justify-self-center w-full">
              <p>
                {activity.status === 'PENDING' ? (
                  <div className="flex justify-between items-center">
                    <p>
                      Invite was sent to <strong>{activity.user.name}</strong>{' '}
                      <time dateTime={activity.createdAt.toISOString()}>
                        {formatDistanceToNow(activity.createdAt)} ago
                      </time>{' '}
                    </p>

                    <ActionButton
                      className="mr-6"
                      onActionChildren={'Remove'}
                      isLoading={isLoading}
                      onCancel={() => {
                        dispatch({
                          payload: {
                            requestId: activity.id,
                          },
                          type: ['project.cancel-request'],
                        })
                      }}
                    />
                  </div>
                ) : (
                  <p>
                    {activity.user.name} has{' '}
                    {activity.status === 'ACCEPT' ? 'acceted' : 'rejected'} your
                    invite to {activity.project.title}
                  </p>
                )}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-full">
            {activity.status === 'PENDING' ? (
              <div className="flex justify-between items-center">
                {activity.type === 'INVITE' ? (
                  <>
                    <div>
                      Invited you to join{' '}
                      <strong className="mr-2">{activity.project.title}</strong>{' '}
                      <time dateTime={activity.createdAt.toISOString()}>
                        {formatDistanceToNow(activity.createdAt)} ago
                      </time>{' '}
                      <p>
                        {`"`}
                        {activity.message}
                        {`"`}
                      </p>
                    </div>
                    <div className="flex">
                      <ActionButton
                        className="mr-6"
                        onActionChildren={'Remove'}
                        isLoading={isLoading}
                        onCancel={() => {
                          dispatch({
                            payload: {
                              requestId: activity.id,
                            },
                            type: ['project.cancel-request'],
                          })
                        }}
                      />
                      <ActionButton
                        onActionChildren={'Accept'}
                        isLoading={isLoading}
                        onAction={() => {
                          handleAcceptInvite({
                            inviteId: activity.id,
                            projectId: activity.project.id,
                            userId: activity.user.id,
                          })
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      Requested to join{' '}
                      <strong className="mr-2">{activity.project.title}</strong>{' '}
                      <time dateTime={activity.createdAt.toISOString()}>
                        {formatDistanceToNow(activity.createdAt)} ago
                      </time>{' '}
                    </p>

                    <ActionButton
                      className="mr-6"
                      onActionChildren={'Remove'}
                      isLoading={isLoading}
                      onCancel={() => {
                        dispatch({
                          payload: {
                            requestId: activity.id,
                          },
                          type: ['project.cancel-request'],
                        })
                      }}
                    />
                  </>
                )}
              </div>
            ) : (
              <p>
                {activity.user.name}{' '}
                {activity.status === 'ACCEPT' ? 'accepted' : 'rejected'} your
                request to join {activity.project.title}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Notifications
