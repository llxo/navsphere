import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import { getFileContent } from '@/lib/github'

export const runtime = 'edge'

async function getData() {
  try {
    // 从GitHub仓库动态获取最新数据
    const [navigationData, siteDataRaw] = await Promise.all([
      getFileContent('navsphere/content/navigation.json'),
      getFileContent('navsphere/content/site.json')
    ])

    // 确保 theme 类型正确
    const siteData: SiteConfig = {
      basic: {
        title: siteDataRaw?.basic?.title || 'NavSphere',
        description: siteDataRaw?.basic?.description || '',
        keywords: siteDataRaw?.basic?.keywords || ''
      },
      appearance: {
        logo: siteDataRaw?.appearance?.logo || '',
        favicon: siteDataRaw?.appearance?.favicon || '',
        theme: (siteDataRaw?.appearance?.theme === 'light' ||
          siteDataRaw?.appearance?.theme === 'dark' ||
          siteDataRaw?.appearance?.theme === 'system')
          ? siteDataRaw.appearance.theme
          : 'system'
      }
    }

    return {
      navigationData: navigationData || { navigationItems: [] },
      siteData: siteData || {
        basic: {
          title: 'NavSphere',
          description: '',
          keywords: ''
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system' as const
        }
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    // 返回默认数据
    return {
      navigationData: { navigationItems: [] },
      siteData: {
        basic: {
          title: 'NavSphere',
          description: '',
          keywords: ''
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system' as const
        }
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
