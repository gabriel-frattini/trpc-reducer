import { User } from '@prisma/client'
import type { NextPage } from 'next'
import * as React from 'react'

export type NextPageWithAuthAndLayout = NextPage & {
  auth?: boolean
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

export type Owner = Pick<User, 'id' | 'name' | 'image'>
