import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'cs4all-vn',
  description:
    'A tiny CS wiki for Vietnamese community',
  href: 'https://cs4all-vn.vercel.app',
  author: 'le nguyen',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/#subjects',
    label: 'subjects /',
  },
  {
    href: '/about',
    label: 'about /',
  }
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/vietfood/cs4all-vn',
    label: 'GitHub',
  },
  {
    href: 'mailto:lenguyen18072003@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}

export const MEDIA = [
  '/static/video.mp4',
]