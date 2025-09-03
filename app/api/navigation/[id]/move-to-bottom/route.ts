import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { id } = await params

    // 获取当前导航数据
    const data: NavigationData = await getFileContent('navsphere/content/navigation.json')
    
    if (!data.navigationItems || !Array.isArray(data.navigationItems)) {
      return NextResponse.json(
        { error: 'Invalid navigation data structure' },
        { status: 500 }
      )
    }

    // 找到要移动的项目
    const itemIndex = data.navigationItems.findIndex(item => item.id === id)
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Navigation item not found' },
        { status: 404 }
      )
    }

    // 如果已经在底部，不需要移动
    if (itemIndex === data.navigationItems.length - 1) {
      return NextResponse.json({ success: true, message: 'Item is already at the bottom' })
    }

    // 移动到底部
    const [item] = data.navigationItems.splice(itemIndex, 1)
    data.navigationItems.push(item)

    // 保存更新后的数据
    await commitFile(
      'navsphere/content/navigation.json',
      JSON.stringify(data, null, 2),
      `Move navigation item "${item.title}" to bottom`,
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to move navigation item to bottom:', error)
    return NextResponse.json(
      { 
        error: 'Failed to move navigation item to bottom', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
