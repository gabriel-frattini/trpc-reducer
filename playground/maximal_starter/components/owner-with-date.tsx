import { Avatar } from '@/components/avatar'
import type { Owner } from '@/lib/types'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Link from 'next/link'

type OwnerWithDateProps = {
  owner: Owner
  date: Date
}

export function OwnerWithDate({ owner, date }: OwnerWithDateProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href={`/profile/${owner.id}`}>
        <a className="relative inline-flex">
          <span className="hidden sm:flex">
            <Avatar name={owner.name!} src={owner.image} />
          </span>
          <span className="flex sm:hidden">
            <Avatar name={owner.name!} src={owner.image} size="sm" />
          </span>
        </a>
      </Link>
      <div className="flex-1 text-sm sm:text-base">
        <div>
          <Link href={`/profile/${owner.id}`}>
            <a className="font-medium tracking-tight transition-colors hover:text-blue">
              {owner.name}
            </a>
          </Link>
        </div>

        <p className="tracking-tight text-secondary">
          <time dateTime={date.toISOString()}>{formatDistanceToNow(date)}</time>{' '}
          ago
        </p>
      </div>
    </div>
  )
}
