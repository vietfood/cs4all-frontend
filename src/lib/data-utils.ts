import { getCollection, render, type CollectionEntry } from 'astro:content'
import { readingTime, calculateWordCountFromHtml } from '@/lib/utils'

type PostCollection = 'note'
type AnyPost = CollectionEntry<PostCollection>

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  return await getCollection('authors')
}

async function getAllParentEntries(
  collection: PostCollection,
): Promise<AnyPost[]> {
  const posts = await getCollection(collection)
  return posts
    .filter((post: AnyPost) => !post.data.draft && !isSubpost(post.id))
    .sort((a, b) => {
      const orderA = a.data.order ?? 999
      const orderB = b.data.order ?? 999
      if (orderA !== orderB) return orderA - orderB
      return a.data.date.valueOf() - b.data.date.valueOf()
    })
}

export async function getAllNotes(): Promise<CollectionEntry<'note'>[]> {
  return (await getAllParentEntries('note')) as CollectionEntry<'note'>[]
}

async function getAllEntries(collection: PostCollection): Promise<AnyPost[]> {
  const posts = await getCollection(collection)
  return posts
    .filter((post: AnyPost) => !post.data.draft)
    .sort((a, b) => {
      const orderA = a.data.order ?? 999
      const orderB = b.data.order ?? 999
      if (orderA !== orderB) return orderA - orderB
      return a.data.date.valueOf() - b.data.date.valueOf()
    })
}

export async function getAllNotesAndSubposts(): Promise<
  CollectionEntry<'note'>[]
> {
  return (await getAllEntries('note')) as CollectionEntry<'note'>[]
}

export async function getAllTags(): Promise<Map<string, number>> {
  const note = await getAllNotes()
  const all = [...note]
  return all.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

async function getAdjacentEntries(
  currentId: string,
  collection: PostCollection,
): Promise<{
  newer: AnyPost | null
  older: AnyPost | null
  parent: AnyPost | null
}> {
  const allPosts = await getAllParentEntries(collection)

  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId)
    const parent = allPosts.find((post) => post.id === parentId) || null

    const posts = await getCollection(collection)
    const subposts = posts
      .filter(
        (post: AnyPost) =>
          isSubpost(post.id) &&
          getParentId(post.id) === parentId &&
          !post.data.draft,
      )
      .sort((a, b) => {
        const orderA = a.data.order ?? 999
        const orderB = b.data.order ?? 999
        if (orderA !== orderB) return orderA - orderB
        return a.data.date.valueOf() - b.data.date.valueOf()
      })

    const currentIndex = subposts.findIndex((post) => post.id === currentId)
    if (currentIndex === -1) {
      return { newer: null, older: null, parent }
    }

    return {
      newer:
        currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
      older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
      parent,
    }
  }

  const parentPosts = allPosts.filter((post) => !isSubpost(post.id))
  const currentIndex = parentPosts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { newer: null, older: null, parent: null }
  }

  return {
    newer: currentIndex > 0 ? parentPosts[currentIndex - 1] : null,
    older:
      currentIndex < parentPosts.length - 1
        ? parentPosts[currentIndex + 1]
        : null,
    parent: null,
  }
}

export async function getAdjacentNotes(currentId: string): Promise<{
  newer: CollectionEntry<'note'> | null
  older: CollectionEntry<'note'> | null
  parent: CollectionEntry<'note'> | null
}> {
  return (await getAdjacentEntries(currentId, 'note')) as {
    newer: CollectionEntry<'note'> | null
    older: CollectionEntry<'note'> | null
    parent: CollectionEntry<'note'> | null
  }
}

export async function getNotesByTag(
  tag: string,
): Promise<CollectionEntry<'note'>[]> {
  const posts = await getAllNotes()
  return posts.filter((post) => post.data.tags?.includes(tag))
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()
  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export function getParentId(subpostId: string): string {
  const parts = subpostId.split('/')
  return parts.slice(0, -1).join('/')
}

async function getSubpostsForParentGeneric(
  parentId: string,
  collection: PostCollection,
): Promise<AnyPost[]> {
  const posts = await getCollection(collection)
  return posts
    .filter(
      (post: AnyPost) =>
        !post.data.draft &&
        isSubpost(post.id) &&
        getParentId(post.id) === parentId,
    )
    .sort((a, b) => {
      const orderA = a.data.order ?? 999
      const orderB = b.data.order ?? 999
      if (orderA !== orderB) return orderA - orderB
      return a.data.date.valueOf() - b.data.date.valueOf()
    })
}

export async function getSubnotesForParent(
  parentId: string,
): Promise<CollectionEntry<'note'>[]> {
  return (await getSubpostsForParentGeneric(
    parentId,
    'note',
  )) as CollectionEntry<'note'>[]
}

export function groupPostsByYear<T extends AnyPost>(
  posts: T[],
): Record<string, T[]> {
  return posts.reduce<Record<string, T[]>>((acc, post) => {
    const year = post.data.date.getFullYear().toString()
      ; (acc[year] ??= []).push(post)
    return acc
  }, {})
}

async function hasSubpostsGeneric(
  postId: string,
  collection: PostCollection,
): Promise<boolean> {
  const subposts = await getSubpostsForParentGeneric(postId, collection)
  return subposts.length > 0
}

export async function hasSubnotes(postId: string): Promise<boolean> {
  return await hasSubpostsGeneric(postId, 'note')
}

export function isSubpost(postId: string): boolean {
  return postId.split('/').length > 2
}

async function getParentPostGeneric(
  subpostId: string,
  collection: PostCollection,
): Promise<AnyPost | null> {
  if (!isSubpost(subpostId)) {
    return null
  }

  const parentId = getParentId(subpostId)
  const allPosts = await getAllParentEntries(collection)
  return allPosts.find((post) => post.id === parentId) || null
}

export async function getParentNote(
  subpostId: string,
): Promise<CollectionEntry<'note'> | null> {
  return (await getParentPostGeneric(
    subpostId,
    'note',
  )) as CollectionEntry<'note'> | null
}

export async function parseAuthors(authorIds: string[] = []) {
  if (!authorIds.length) return []

  const allAuthors = await getAllAuthors()
  const authorMap = new Map(allAuthors.map((author) => [author.id, author]))

  return authorIds.map((id) => {
    const author = authorMap.get(id)
    return {
      id,
      name: author?.data?.name || id,
      avatar: author?.data?.avatar || '/static/logo.png',
      isRegistered: !!author,
    }
  })
}

async function getEntryById(
  postId: string,
  collection: PostCollection,
): Promise<AnyPost | null> {
  const allPosts = await getAllEntries(collection)
  return allPosts.find((post) => post.id === postId) || null
}

export async function getNoteById(
  postId: string,
): Promise<CollectionEntry<'note'> | null> {
  return (await getEntryById(postId, 'note')) as CollectionEntry<'note'> | null
}

async function getSubpostCountGeneric(
  parentId: string,
  collection: PostCollection,
): Promise<number> {
  const subposts = await getSubpostsForParentGeneric(parentId, collection)
  return subposts.length
}

export async function getSubnoteCount(parentId: string): Promise<number> {
  return await getSubpostCountGeneric(parentId, 'note')
}

async function getCombinedReadingTimeGeneric(
  postId: string,
  collection: PostCollection,
): Promise<string> {
  const post = await getEntryById(postId, collection)
  if (!post) return readingTime(0)

  let totalWords = calculateWordCountFromHtml(post.body)

  if (!isSubpost(postId)) {
    const subposts = await getSubpostsForParentGeneric(postId, collection)
    for (const subpost of subposts) {
      totalWords += calculateWordCountFromHtml(subpost.body)
    }
  }

  return readingTime(totalWords)
}

export async function getCombinedReadingTimeForNote(
  postId: string,
): Promise<string> {
  return await getCombinedReadingTimeGeneric(postId, 'note')
}

async function getPostReadingTimeGeneric(
  postId: string,
  collection: PostCollection,
): Promise<string> {
  const post = await getEntryById(postId, collection)
  if (!post) return readingTime(0)

  const wordCount = calculateWordCountFromHtml(post.body)
  return readingTime(wordCount)
}

export async function getNoteReadingTime(postId: string): Promise<string> {
  return await getPostReadingTimeGeneric(postId, 'note')
}

export type TOCHeading = {
  slug: string
  text: string
  depth: number
  isSubpostTitle?: boolean
}

export type TOCSection = {
  type: 'parent' | 'subpost'
  title: string
  headings: TOCHeading[]
  subpostId?: string
}

async function getTOCSectionsGeneric(
  postId: string,
  collection: PostCollection,
): Promise<TOCSection[]> {
  const post = await getEntryById(postId, collection)
  if (!post) return []

  const parentId = isSubpost(postId) ? getParentId(postId) : postId
  const parentPost = isSubpost(postId)
    ? await getEntryById(parentId, collection)
    : post

  if (!parentPost) return []

  const sections: TOCSection[] = []

  const { headings: parentHeadings } = await render(parentPost)
  if (parentHeadings.length > 0) {
    sections.push({
      type: 'parent',
      title: 'Overview',
      headings: parentHeadings.map((heading) => ({
        slug: heading.slug,
        text: heading.text,
        depth: heading.depth,
      })),
    })
  }

  const subposts = await getSubpostsForParentGeneric(parentId, collection)
  for (const subpost of subposts) {
    const { headings: subpostHeadings } = await render(subpost)
    if (subpostHeadings.length > 0) {
      sections.push({
        type: 'subpost',
        title: subpost.data.title,
        headings: subpostHeadings.map((heading, index) => ({
          slug: heading.slug,
          text: heading.text,
          depth: heading.depth,
          isSubpostTitle: index === 0,
        })),
        subpostId: subpost.id,
      })
    }
  }

  return sections
}

export async function getTOCSectionsForNote(
  postId: string,
): Promise<TOCSection[]> {
  return await getTOCSectionsGeneric(postId, 'note')
}
