import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'
import { convertNavigationIconsToOnline } from '@/lib/icon-utils'

export const runtime = 'edge'

export async function GET() {
  try {
    const navigationData = await getFileContent('navsphere/content/navigation.json')
    // 转换本地icon路径为在线路径
    const convertedData = convertNavigationIconsToOnline(navigationData)
    
    return NextResponse.json(convertedData, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error in navigation API:', error)
    return NextResponse.json(
      { error: '获取导航数据失败' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}