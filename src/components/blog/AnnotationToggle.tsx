'use client'

import * as React from 'react'
import { AnnotationContext } from './AnnotationContext'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export function AnnotationToggle({ className }: { className?: string }) {
  const context = React.useContext(AnnotationContext)

  // Don't render if no context available
  if (!context) {
    return null
  }

  const { showAnnotations, setShowAnnotations } = context

  return (
    <button
      onClick={() => setShowAnnotations(!showAnnotations)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
        showAnnotations
          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
        className,
      )}
      title={showAnnotations ? 'Hide annotations' : 'Show annotations'}
    >
      {showAnnotations ? (
        <>
          <Eye className="h-3.5 w-3.5" />
          <span>Annotations</span>
        </>
      ) : (
        <>
          <EyeOff className="h-3.5 w-3.5" />
          <span>Annotations</span>
        </>
      )}
    </button>
  )
}
