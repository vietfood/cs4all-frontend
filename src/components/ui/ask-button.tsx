import React from 'react'
import { MessageCircleQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AskButtonProps {
    lessonId: string
    title: string
}

/**
 * Floating "Ask AI" button on lesson pages.
 * Navigates to /ask?lesson={lessonId}&title={title} when clicked.
 */
export default function AskButton({ lessonId, title }: AskButtonProps) {
    const handleClick = () => {
        const params = new URLSearchParams({
            lesson: lessonId,
            title: title,
        })
        window.location.href = `/ask?${params.toString()}`
    }

    return (
        <Button
            onClick={handleClick}
            size="lg"
            className="group gap-2 rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            title="Hỏi AI về bài học này"
        >
            <MessageCircleQuestion className="size-5 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">Hỏi AI</span>
        </Button>
    )
}
