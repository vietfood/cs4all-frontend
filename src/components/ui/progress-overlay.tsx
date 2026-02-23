import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'

/**
 * Client-side React island that fetches user_progress and decorates
 * the server-rendered syllabus with completion checkmarks.
 * 
 * This works by finding DOM elements with `data-lesson-id` attribute
 * and toggling a class to show/hide the correct icon.
 */
export default function ProgressOverlay({ subject }: { subject: string }) {
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function fetchProgress() {
            const supabase = getSupabaseBrowserClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return

            const { data } = await supabase
                .from('user_progress')
                .select('lesson_id')
                .eq('user_id', session.user.id)
                .eq('status', 'completed')

            if (data) {
                const completed = new Set(data.map(p => p.lesson_id))
                setCompletedLessons(completed)

                // Decorate the server-rendered DOM
                document.querySelectorAll<HTMLElement>('[data-lesson-id]').forEach(el => {
                    const lessonId = el.getAttribute('data-lesson-id')
                    if (lessonId && completed.has(lessonId)) {
                        el.setAttribute('data-completed', 'true')
                    }
                })
            }
        }

        fetchProgress()
    }, [subject])

    return null // This is a headless component — it only manipulates the DOM
}
