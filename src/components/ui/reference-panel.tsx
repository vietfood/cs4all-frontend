import React, { useEffect, useState, useRef } from 'react'
import { BookOpen, X } from 'lucide-react'
import type { Anchor } from './lesson-chat'

interface ReferencePanelProps {
    anchorMap?: Anchor[]
    children: React.ReactNode
}

export default function ReferencePanel({ anchorMap = [], children }: ReferencePanelProps) {
    const [activeRefId, setActiveRefId] = useState<string | null>(null)
    const [isOpenMobile, setIsOpenMobile] = useState(false)
    const contentRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleRefClick = (e: Event) => {
            const customEvent = e as CustomEvent<{ id: string }>
            const { id } = customEvent.detail
            if (!id) return

            setActiveRefId(id)
            if (window.innerWidth < 768) {
                setIsOpenMobile(true)
            }
        }

        window.addEventListener('lesson-reference-click', handleRefClick)
        return () => window.removeEventListener('lesson-reference-click', handleRefClick)
    }, [])

    useEffect(() => {
        if (!activeRefId || !contentRef.current) return

        // Clear previous highlights
        const previousHighlights = contentRef.current.querySelectorAll('.reference-highlight')
        previousHighlights.forEach(el => {
            el.classList.remove('reference-highlight', 'bg-primary/20', 'ring-2', 'ring-primary', 'transition-all', 'duration-500', 'rounded', 'p-1', '-m-1')
        })

        const targetEl = contentRef.current.querySelector(`#${activeRefId}`)
        if (targetEl) {
            targetEl.classList.add('reference-highlight', 'bg-primary/20', 'ring-2', 'ring-primary', 'transition-all', 'duration-500', 'rounded', 'p-1', '-m-1')

            // Wait slightly for layout
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
        }
    }, [activeRefId])

    const activeAnchor = anchorMap.find(a => a.id === activeRefId)
    const label = activeAnchor ? activeAnchor.label : 'Tham chiếu nội dung'

    return (
        <div
            className={`flex-1 flex flex-col min-h-0 bg-background absolute md:relative inset-0 z-50 md:z-0 transition-transform duration-300 ease-in-out ${isOpenMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0 hidden md:flex'
                }`}
        >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-6 py-4 flex items-center justify-between shrink-0">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                    <BookOpen className="size-4" />
                    {label}
                </h3>
                <button
                    onClick={() => setIsOpenMobile(false)}
                    className="md:hidden p-2 rounded-full hover:bg-secondary text-muted-foreground"
                    aria-label="Đóng bảng tham chiếu"
                >
                    <X className="size-5" />
                </button>
            </div>
            {/* The scrollable container is the div itself or the article. Let's make the wrapper overflow-y-auto */}
            <div className="flex-1 overflow-y-auto w-full">
                <article ref={contentRef} className="prose dark:prose-invert max-w-none p-6 md:p-8">
                    {children}
                </article>
            </div>
        </div>
    )
}
