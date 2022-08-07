import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import * as React from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { ActionButton } from '@/components/action-button'
import { Avatar } from '@/components/avatar'
import { Banner } from '@/components/banner'
import { Button } from '@/components/button'
import { ButtonLink } from '@/components/button-link'
import {
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/dialog'
import { HtmlView } from '@/components/html-view'
import { IconButton } from '@/components/icon-button'
import { DotsIcon, EditIcon, EyeClosedIcon, EyeIcon, MessageIcon, TrashIcon } from '@/components/icons'
import { Layout } from '@/components/layout'
import { MarkdownEditor } from '@/components/markdown-editor'
import { Menu, MenuButton, MenuItemButton, MenuItems, MenuItemsContent } from '@/components/menu'
import { OwnerWithDate } from '@/components/owner-with-date'
import { VoteButton } from '@/components/vote-button'

import { InferQueryOutput, InferQueryPathAndInput, trpc, trpcReducer } from '@/lib/trpc'
import type { NextPageWithAuthAndLayout } from '@/lib/types'
import Link from 'next/link'
import { projectReducer } from 'utils/reducer'

function getProjectQueryPathAndInput(
  id: number,
): InferQueryPathAndInput<'public.project-detail'> {
  return [
    'public.project-detail',
    {
      id,
    },
  ]
}

const ProjectPage: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const projectQueryPathAndInput = getProjectQueryPathAndInput(
    Number(router.query.id),
  )

  const { state, dispatch } = trpcReducer.useTrpcReducer(
    projectReducer,
    projectQueryPathAndInput,
    {
      arg_0: ['project.request-to-join'],
      arg_1: ['project.cancel-request'],
      arg_2: ['project.vote'],
      arg_3: ['project.undo-vote'],
      arg_4: ['project.invite-to-project'],
    },
  )

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false)
  const [isConfirmHideDialogOpen, setIsConfirmHideDialogOpen] = React.useState(false)
  const [isConfirmUnhideDialogOpen, setIsConfirmUnhideDialogOpen] = React.useState(false)

  function handleHide() {
    setIsConfirmHideDialogOpen(true)
  }

  function handleUnhide() {
    setIsConfirmUnhideDialogOpen(true)
  }

  function handleEdit() {
    router.push(`/project/${state.data?.project.id}/edit`)
  }

  function handleDelete() {
    setIsConfirmDeleteDialogOpen(true)
  }

  if (state.data && state.data.project) {
    const isUserAdmin = session!?.user.role === 'ADMIN'
    const projectBelongsToUser = state.data.project.owner.id === session!?.user.id

    const handleJoinRequest = () => {
      if (!session) return
      dispatch({
        payload: {
          projectId: state.data.project.id,
          message: 'hey man',
          userId: session.user.id,
        },
        type: ['project.request-to-join'],
      })
    }

    const handleCancelRequest = ({ isInvite }: { isInvite: boolean }) => {
      if (isInvite) {
        dispatch(
          {
            payload: { requestId: state.data.invitedByUser![0].id },
            type: ['project.cancel-request'],
          },
          { onlyUpdateCache: false, args: { isInvite } },
        )
      } else {
        dispatch(
          {
            payload: { requestId: state.data.requestedByUser![0].id },
            type: ['project.cancel-request'],
          },
          { onlyUpdateCache: false, args: { isInvite } },
        )
      }
    }

    const handleInviteRequest = () => {
      dispatch({
        payload: {
          userId: session?.user.id,
          projectId: state.data.project.id,
          message: 'this is a invite',
        },
        type: ['project.invite-to-project'],
      })
    }

    type voteProps = { type: 'UP' | 'DOWN' }

    const handleVote = ({ type }: voteProps) => {
      if (session) {
        dispatch({
          payload: {
            projectId: state.data.project.id,
            userId: session.user.id,
            type,
          },
          type: ['project.vote'],
        })
      }
    }

    const myVote = state.data.project.votedBy.filter(
      (vote) => vote.user.id === session?.user.id,
    )

    return (
      <div>
        <Head>
          <title>{state.data.project.title} - sideclub</title>
        </Head>

        <div className='divide-y relative divide-primary'>
          <div className='absolute w-12 h-full mt-12 ml-4 flex justify-center'>
            <VoteButton
              votedBy={state.data.project.votedBy}
              onUnVote={() => {
                if (session) {
                  dispatch({
                    payload: {
                      projectId: state.data.project.id,
                      userId: session.user.id,
                    },
                    type: ['project.undo-vote'],
                  })
                }
              }}
              onDownvote={() =>
                handleVote({
                  type: 'DOWN',
                })}
              onUpvote={() =>
                handleVote({
                  type: 'UP',
                })}
              myVote={myVote ?? []}
            />
          </div>
          <div className='px-20 py-8 rounded-lg bg-white'>
            {state.data.project.hidden && (
              <Banner className='mb-6'>
                This project has been hidden and is only visible to administrators.
              </Banner>
            )}

            <div className='flex items-center justify-between gap-4'>
              <h1 className='text-3xl font-semibold tracking-tighter md:text-4xl'>
                {state.data.project.title}
              </h1>
              {(projectBelongsToUser || isUserAdmin) && (
                <>
                  <div className='flex md:hidden'>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        variant='secondary'
                        title='More'
                      >
                        <DotsIcon className='w-4 h-4' />
                      </MenuButton>

                      <MenuItems className='w-28'>
                        <MenuItemsContent>
                          {isUserAdmin
                            && (state.data.project.hidden
                              ? (
                                <MenuItemButton onClick={handleUnhide}>
                                  Unhide
                                </MenuItemButton>
                              )
                              : (
                                <MenuItemButton onClick={handleHide}>
                                  Hide
                                </MenuItemButton>
                              ))}
                          {projectBelongsToUser && (
                            <>
                              <MenuItemButton onClick={handleEdit}>
                                Edit
                              </MenuItemButton>
                              <MenuItemButton
                                className='!text-red'
                                onClick={handleDelete}
                              >
                                Delete
                              </MenuItemButton>
                            </>
                          )}
                        </MenuItemsContent>
                      </MenuItems>
                    </Menu>
                  </div>
                  <div className='hidden md:flex md:gap-4'>
                    {isUserAdmin
                      && (state.data.project.hidden
                        ? (
                          <IconButton
                            variant='secondary'
                            title='Unhide'
                            onClick={handleUnhide}
                          >
                            <EyeIcon className='w-4 h-4' />
                          </IconButton>
                        )
                        : (
                          <IconButton
                            variant='secondary'
                            title='Hide'
                            onClick={handleHide}
                          >
                            <EyeClosedIcon className='w-4 h-4' />
                          </IconButton>
                        ))}
                    {projectBelongsToUser && (
                      <>
                        <IconButton
                          variant='secondary'
                          title='Edit'
                          onClick={handleEdit}
                        >
                          <EditIcon className='w-4 h-4' />
                        </IconButton>
                        <IconButton
                          variant='secondary'
                          title='Delete'
                          onClick={handleDelete}
                        >
                          <TrashIcon className='w-4 h-4 text-red' />
                        </IconButton>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className='mt-6'>
              <OwnerWithDate
                owner={state.data.project.owner}
                date={state.data.project.createdAt}
              />
            </div>
            <HtmlView html={state.data.project.contentHtml} className='mt-8' />
            <div className=' border-b-2 py-8 '>
              <span className='border border-secondary rounded-full px-4 py-1 z-10 bg-white inline-flex items-center justify-center font-medium'>
                python
              </span>
            </div>
            <div className='flex gap-4 mt-6 clear-both'>
              <ButtonLink
                href={`/project/${state.data.project.id}#comments`}
                variant='secondary'
              >
                <MessageIcon className='w-4 h-4 text-secondary' />
                <span className='ml-1.5'>
                  {state.data.project.comments.length}
                </span>
              </ButtonLink>
              {!projectBelongsToUser && (
                <ActionButton
                  disabled={!session?.user.id}
                  onAction={handleJoinRequest}
                  didPerformAction={state.data.requestedByUser.some(
                    (details) => details.user.id === session!.user.id,
                  )}
                  isLoading={state.isDispatching}
                  onCancel={() => handleCancelRequest({ isInvite: false })}
                  onActionChildren={<p>Join</p>}
                  didPerformActionChildren={<p>Cancel</p>}
                />
              )}
            </div>

            {state.data.requestedByUser.length
              ? (
                <div className='bg-gray-50 px-4 py-2 mt-4 rounded-lg w-fit '>
                  <p className='font-semibold text-lg'>
                    Your membership is waiting on approval
                  </p>
                  <p className=''>
                    You will receive a notification when your request to join is approved.
                  </p>
                </div>
              )
              : null}
          </div>

          <div id='comments' className='pt-6 space-y-10'>
            {state.data.project.comments.length > 0 && (
              <ul className='space-y-4'>
                {state.data.project.comments.map((comment) => (
                  <li key={comment.id}>
                    <Comment
                      isLoading={state.isDispatching}
                      onCancel={() => handleCancelRequest({ isInvite: true })}
                      onInvite={handleInviteRequest}
                      projectId={state.data.project.id}
                      comment={comment}
                      invitedByOwner={state.data.invitedByUser}
                    />
                  </li>
                ))}
              </ul>
            )}
            {session?.user
              ? (
                <div className='flex items-start gap-2 sm:gap-4'>
                  <span className='hidden sm:inline-block'>
                    <Avatar name={session!.user.name} src={session!.user.image} />
                  </span>
                  <span className='inline-block sm:hidden'>
                    <Avatar
                      name={session!?.user.name}
                      src={session!?.user.image}
                      size='sm'
                    />
                  </span>
                  <AddCommentForm projectId={state.data.project.id} />
                </div>
              )
              : (
                <div className='cursor-pointer max-w-fit'>
                  <Link href='/sign-in' replace>
                    Log in to post a comment
                  </Link>
                </div>
              )}
          </div>
        </div>

        <ConfirmDeleteDialog
          projectId={state.data.project.id}
          isOpen={isConfirmDeleteDialogOpen}
          onClose={() => {
            setIsConfirmDeleteDialogOpen(false)
          }}
        />

        <ConfirmHideDialog
          projectId={state.data.project.id}
          isOpen={isConfirmHideDialogOpen}
          onClose={() => {
            setIsConfirmHideDialogOpen(false)
          }}
        />

        <ConfirmUnhideDialog
          projectId={state.data.project.id}
          isOpen={isConfirmUnhideDialogOpen}
          onClose={() => {
            setIsConfirmUnhideDialogOpen(false)
          }}
        />
      </div>
    )
  }

  if (state.isError) {
    return <div>Error: {state.error.message}</div>
  }

  return (
    <div className='animate-pulse'>
      <div className='w-3/4 bg-gray-200 rounded h-9 dark:bg-gray-700' />
      <div className='flex items-center gap-4 mt-6'>
        <div className='w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700' />
        <div className='flex-1'>
          <div className='w-24 h-4 bg-gray-200 rounded dark:bg-gray-700' />
          <div className='w-32 h-3 mt-2 bg-gray-200 rounded dark:bg-gray-700' />
        </div>
      </div>
      <div className='space-y-3 mt-7'>
        {[...Array(3)].map((_, idx) => (
          <React.Fragment key={idx}>
            <div className='grid grid-cols-3 gap-4'>
              <div className='h-5 col-span-2 bg-gray-200 rounded dark:bg-gray-700' />
              <div className='h-5 col-span-1 bg-gray-200 rounded dark:bg-gray-700' />
            </div>
            <div className='w-1/2 h-5 bg-gray-200 rounded dark:bg-gray-700' />
            <div className='grid grid-cols-3 gap-4'>
              <div className='h-5 col-span-1 bg-gray-200 rounded dark:bg-gray-700' />
              <div className='h-5 col-span-2 bg-gray-200 rounded dark:bg-gray-700' />
            </div>
            <div className='w-3/5 h-5 bg-gray-200 rounded dark:bg-gray-700' />
          </React.Fragment>
        ))}
      </div>
      <div className='flex gap-4 mt-6'>
        <div className='w-16 border rounded-full h-button border-secondary' />
        <div className='w-16 border rounded-full h-button border-secondary' />
      </div>
    </div>
  )
}

ProjectPage.auth = true

ProjectPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

function Comment({
  isLoading,
  onCancel,
  onInvite,
  projectId,
  comment,
  invitedByOwner,
}: {
  onCancel: () => void
  onInvite: () => void
  projectId: number
  comment: InferQueryOutput<'public.project-detail'>['project']['comments'][number]
  invitedByOwner: InferQueryOutput<'public.project-detail'>['invitedByUser']
  isLoading: boolean
}) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false)

  const commentBelongsToUser = comment.owner.id === session!?.user.id

  if (isEditing) {
    return (
      <div className='flex items-start gap-4'>
        <Avatar name={comment.owner.name!} src={comment.owner.image} />
        <EditCommentForm
          projectId={projectId}
          comment={comment}
          onDone={() => {
            setIsEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className='bg-white border-2 border-secondary px-6 py-4 rounded-md'>
      <div className='flex items-center justify-between gap-4'>
        <OwnerWithDate owner={comment.owner} date={comment.createdAt} />
        {commentBelongsToUser
          ? (
            <Menu>
              <MenuButton as={IconButton} variant='secondary' title='More'>
                <DotsIcon className='w-4 h-4' />
              </MenuButton>

              <MenuItems className='w-28'>
                <MenuItemsContent>
                  <MenuItemButton
                    onClick={() => {
                      setIsEditing(true)
                    }}
                  >
                    Edit
                  </MenuItemButton>
                  <MenuItemButton
                    className='!text-red'
                    onClick={() => {
                      setIsConfirmDeleteDialogOpen(true)
                    }}
                  >
                    Delete
                  </MenuItemButton>
                </MenuItemsContent>
              </MenuItems>
            </Menu>
          )
          : (
            <div>
              <ActionButton
                onAction={onInvite}
                didPerformAction={invitedByOwner.some(
                  (details) => details.project.ownerId === session?.user.id
                )}
                isLoading={isLoading}
                onCancel={onCancel}
                onActionChildren={<p>Invite</p>}
                didPerformActionChildren={<p>Cancel</p>}
              />
            </div>
          )}
      </div>

      <div className='mt-4 pl-11 sm:pl-16'>
        <HtmlView html={comment.contentHtml} />
      </div>

      <ConfirmDeleteCommentDialog
        projectId={projectId}
        commentId={comment.id}
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => {
          setIsConfirmDeleteDialogOpen(false)
        }}
      />
    </div>
  )
}

type CommentFormData = {
  content: string
}

function AddCommentForm({ projectId }: { projectId: number }) {
  const [markdownEditorKey, setMarkdownEditorKey] = React.useState(0)
  const utils = trpc.useContext()
  const addCommentMutation = trpc.useMutation('comment.add', {
    onSuccess: () => {
      return utils.invalidateQueries(getProjectQueryPathAndInput(projectId))
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })
  const { control, handleSubmit, reset } = useForm<CommentFormData>()

  const onSubmit: SubmitHandler<CommentFormData> = (data) => {
    addCommentMutation.mutate(
      {
        projectId,
        content: data.content,
        private: false,
      },
      {
        onSuccess: () => {
          reset({ content: '' })
          setMarkdownEditorKey((markdownEditorKey) => markdownEditorKey + 1)
        },
      },
    )
  }

  return (
    <form className='flex-1' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='content'
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <MarkdownEditor
            key={markdownEditorKey}
            value={field.value}
            onChange={field.onChange}
            onTriggerSubmit={handleSubmit(onSubmit)}
            required
            placeholder='Comment'
            minRows={4}
          />
        )}
      />
      <div className='mt-4'>
        <Button
          type='submit'
          isLoading={addCommentMutation.isLoading}
          loadingChildren='Adding comment'
        >
          Add comment
        </Button>
      </div>
    </form>
  )
}

function EditCommentForm({
  projectId,
  comment,
  onDone,
}: {
  projectId: number
  comment: InferQueryOutput<'public.project-detail'>['project']['comments'][number]
  onDone: () => void
}) {
  const utils = trpc.useContext()
  const editCommentMutation = trpc.useMutation('comment.edit', {
    onSuccess: () => {
      return utils.invalidateQueries(getProjectQueryPathAndInput(projectId))
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })
  const { control, handleSubmit } = useForm<CommentFormData>({
    defaultValues: {
      content: comment.content,
    },
  })

  const onSubmit: SubmitHandler<CommentFormData> = (data) => {
    editCommentMutation.mutate(
      {
        id: comment.id,
        data: {
          content: data.content,
        },
      },
      {
        onSuccess: () => onDone(),
      },
    )
  }

  return (
    <form className='flex-1' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='content'
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <MarkdownEditor
            value={field.value}
            onChange={field.onChange}
            onTriggerSubmit={handleSubmit(onSubmit)}
            required
            placeholder='Comment'
            minRows={4}
            autoFocus
          />
        )}
      />
      <div className='flex gap-4 mt-4'>
        <Button
          type='submit'
          isLoading={editCommentMutation.isLoading}
          loadingChildren='Updating comment'
        >
          Update comment
        </Button>
        <Button variant='secondary' onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ConfirmDeleteCommentDialog({
  projectId,
  commentId,
  isOpen,
  onClose,
}: {
  projectId: number
  commentId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const utils = trpc.useContext()
  const deleteCommentMutation = trpc.useMutation('comment.delete', {
    onSuccess: () => {
      return utils.invalidateQueries(getProjectQueryPathAndInput(projectId))
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Delete comment</DialogTitle>
        <DialogDescription className='mt-6'>
          Are you sure you want to delete this comment?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant='secondary'
          className='!text-red'
          isLoading={deleteCommentMutation.isLoading}
          loadingChildren='Deleting comment'
          onClick={() => {
            deleteCommentMutation.mutate(commentId, {
              onSuccess: () => onClose(),
            })
          }}
        >
          Delete comment
        </Button>
        <Button variant='secondary' onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ConfirmDeleteDialog({
  projectId,
  isOpen,
  onClose,
}: {
  projectId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const deleteprojectMutation = trpc.useMutation('project.delete', {
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Delete project</DialogTitle>
        <DialogDescription className='mt-6'>
          Are you sure you want to delete this project?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant='secondary'
          className='!text-red'
          isLoading={deleteprojectMutation.isLoading}
          loadingChildren='Deleting project'
          onClick={() => {
            deleteprojectMutation.mutate(projectId, {
              onSuccess: () => router.push('/'),
            })
          }}
        >
          Delete project
        </Button>
        <Button variant='secondary' onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ConfirmHideDialog({
  projectId,
  isOpen,
  onClose,
}: {
  projectId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const utils = trpc.useContext()
  const hideprojectMutation = trpc.useMutation('project.hide', {
    onSuccess: () => {
      return utils.invalidateQueries(getProjectQueryPathAndInput(projectId))
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Hide project</DialogTitle>
        <DialogDescription className='mt-6'>
          Are you sure you want to hide this project?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant='secondary'
          isLoading={hideprojectMutation.isLoading}
          loadingChildren='Hiding project'
          onClick={() => {
            hideprojectMutation.mutate(projectId, {
              onSuccess: () => {
                toast.success('project hidden')
                onClose()
              },
            })
          }}
        >
          Hide project
        </Button>
        <Button variant='secondary' onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ConfirmUnhideDialog({
  projectId,
  isOpen,
  onClose,
}: {
  projectId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const utils = trpc.useContext()
  const unhideprojectMutation = trpc.useMutation('project.unhide', {
    onSuccess: () => {
      return utils.invalidateQueries(getProjectQueryPathAndInput(projectId))
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Unhide project</DialogTitle>
        <DialogDescription className='mt-6'>
          Are you sure you want to unhide this project?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant='secondary'
          isLoading={unhideprojectMutation.isLoading}
          loadingChildren='Unhiding project'
          onClick={() => {
            unhideprojectMutation.mutate(projectId, {
              onSuccess: () => {
                toast.success('project unhidden')
                onClose()
              },
            })
          }}
        >
          Unhide project
        </Button>
        <Button variant='secondary' onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProjectPage
