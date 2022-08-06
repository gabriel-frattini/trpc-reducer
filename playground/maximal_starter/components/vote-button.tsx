import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import * as React from 'react'

export const MAX_VOTES_BY_SHOWN = 50

type VoteButtonProps = {
  votedBy: {
    user: {
      id: string
    }
    type: 'UP' | 'DOWN'
  }[]
  onUpvote: () => void
  onDownvote: any
  onUnVote: () => void
  myVote?: {
    user: {
      id: string
    }
    project: {
      id: number
    }
    type: 'UP' | 'DOWN'
  }[]
}

export function VoteButton({
  votedBy,
  onDownvote,
  onUnVote,
  onUpvote,
  myVote,
}: VoteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  function handleUpvote() {
    if (!session) {
      router.push('/sign-in')
      return
    }

    if (myVote!.length && myVote![0].type === 'UP') {
      onUnVote()
    } else {
      onUpvote()
    }
  }

  function handleDownvote() {
    if (!session) {
      router.push('/sign-in')
      return
    }

    if (myVote!.length && myVote![0].type === 'DOWN') {
      onUnVote()
    } else {
      onDownvote()
    }
  }

  const voteCount =
    votedBy.filter((vote) => vote.type == 'UP').length -
    votedBy.filter((vote) => vote.type === 'DOWN').length

  return (
    <div>
      <div className="flex flex-col align-middle justify-center gap-2">
        <button
          className={
            myVote!.length && myVote![0].type === 'UP'
              ? 'border-solid border-b-gray-600  border-b-[20px] border-x-transparent border-x-[18px] border-t-0'
              : 'border-solid border-b-gray-400  border-b-[20px] border-x-transparent border-x-[18px] border-t-0'
          }
          onClick={handleUpvote}
        />
        <span className="text-center text-lg text-gray-400">{voteCount}</span>
        <button
          className={
            myVote!.length && myVote![0].type === 'DOWN'
              ? 'border-solid border-t-gray-600 border-t-[20px] border-x-transparent border-x-[18px] border-b-0'
              : 'border-solid border-t-gray-400 border-t-[20px] border-x-transparent border-x-[18px] border-b-0'
          }
          onClick={handleDownvote}
        />
      </div>
    </div>
  )
}
