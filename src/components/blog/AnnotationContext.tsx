'use client'

import * as React from 'react'

interface AnnotationContextType {
  showAnnotations: boolean
  setShowAnnotations: (show: boolean) => void
}

const AnnotationContext = React.createContext<
  AnnotationContextType | undefined
>(undefined)

export { AnnotationContext }

export function AnnotationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [showAnnotations, setShowAnnotations] = React.useState(true)

  return (
    <AnnotationContext.Provider value={{ showAnnotations, setShowAnnotations }}>
      {children}
    </AnnotationContext.Provider>
  )
}

export function useAnnotation() {
  const context = React.useContext(AnnotationContext)
  if (context === undefined) {
    throw new Error('useAnnotation must be used within an AnnotationProvider')
  }
  return context
}
