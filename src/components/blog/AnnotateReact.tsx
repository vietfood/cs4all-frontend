'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

import { cn } from '@/lib/utils'
import {
  SpellCheck,
  Palette,
  MessageCircle,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { AnnotationContext } from './AnnotationContext'

const annotationVariants = cva(
  'annotation-marker cursor-help border-b-2 transition-colors duration-200',
  {
    variants: {
      type: {
        grammar:
          'border-red-400 decoration-wavy hover:bg-red-50 dark:hover:bg-red-950/30',
        style:
          'border-yellow-400 border-dashed hover:bg-yellow-50 dark:hover:bg-yellow-950/30',
        comment:
          'border-blue-400 border-dotted hover:bg-blue-50 dark:hover:bg-blue-950/30',
        educational:
          'border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30',
      },
    },
    defaultVariants: {
      type: 'comment',
    },
  },
)

const typeConfig = {
  grammar: {
    icon: SpellCheck,
    label: 'Grammar',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
  },
  style: {
    icon: Palette,
    label: 'Style',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
  },
  comment: {
    icon: MessageCircle,
    label: 'Comment',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
  },
  educational: {
    icon: GraduationCap,
    label: 'Note',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/50',
  },
}

interface AnnotateProps extends VariantProps<typeof annotationVariants> {
  children?: React.ReactNode
  slotContent?: string
  note: string
  detail?: string
  correction?: string
  type?: keyof typeof typeConfig
}

const LONG_NOTE_THRESHOLD = 100

export function Annotate({
  children,
  slotContent,
  note,
  detail,
  correction,
  type = 'comment',
}: AnnotateProps) {
  // Try to get context, but don't fail if not available
  const context = React.useContext(AnnotationContext)
  const showAnnotations = context?.showAnnotations ?? true

  const config = typeConfig[type]
  const Icon = config.icon
  const isLongNote = note.length > LONG_NOTE_THRESHOLD || !!detail

  // Use slotContent (from Astro) or children (from React)
  const content = slotContent ? (
    <span dangerouslySetInnerHTML={{ __html: slotContent }} />
  ) : (
    children
  )

  // If annotations are hidden, just render children without styling
  if (!showAnnotations) {
    return <>{content}</>
  }

  // For short notes, use Tooltip; for long notes or with detail, use HoverCard
  if (!isLongNote) {
    return (
      <span title={note} className={cn(annotationVariants({ type }), config.color)}>
        {content}
      </span>
    )
  }

  // HoverCard for longer content
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className={cn(annotationVariants({ type }))}>{content}</span>
      </HoverCardTrigger>
      <HoverCardContent
        className={cn('w-80', config.bgColor, 'border border-current/10')}
        align="start"
      >
        <div className="space-y-2">
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              config.color,
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
          </div>

          {type === 'grammar' && correction && (
            <div className="bg-background/50 flex items-center gap-2 rounded-md px-2 py-1 text-sm">
              <span className="line-through opacity-60">{content}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium text-green-600 dark:text-green-400">
                {correction}
              </span>
            </div>
          )}

          <p className="text-foreground text-sm">{note}</p>

          {detail && (
            <div className="border-t border-current/10 pt-2">
              <p className="text-muted-foreground text-xs">{detail}</p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
