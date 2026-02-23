import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface MarkAsReadProps {
    lessonId: string
}

/**
 * Client-side button that lets authenticated users mark a lesson as completed.
 * Toggles the `user_progress` row status between 'completed' and removal.
 */
export default function MarkAsRead({ lessonId }: MarkAsReadProps) {
    const [completed, setCompleted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        async function check() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setLoading(false)
                return
            }
            setIsLoggedIn(true)

            const { data } = await supabase
                .from('user_progress')
                .select('status')
                .eq('user_id', session.user.id)
                .eq('lesson_id', lessonId)
                .maybeSingle()

            if (data?.status === 'completed') {
                setCompleted(true)
            }
            setLoading(false)
        }
        check()
    }, [lessonId])

    const toggle = async () => {
        setToggling(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            setToggling(false)
            return
        }

        if (completed) {
            // Unmark: delete the progress row
            await supabase
                .from('user_progress')
                .delete()
                .eq('user_id', session.user.id)
                .eq('lesson_id', lessonId)
            setCompleted(false)
        } else {
            // Mark as completed: upsert
            await supabase
                .from('user_progress')
                .upsert({
                    user_id: session.user.id,
                    lesson_id: lessonId,
                    status: 'completed',
                }, { onConflict: 'user_id,lesson_id' })
            setCompleted(true)
        }
        setToggling(false)
    }

    if (loading) return null
    if (!isLoggedIn) return null

    return (
        <Button
            variant={completed ? 'default' : 'outline'}
            size="sm"
            onClick={toggle}
            disabled={toggling}
            className={`gap-2 transition-all duration-200 ${completed
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                    : 'hover:border-green-500 hover:text-green-600'
                }`}
        >
            {toggling ? (
                <Loader2 className="size-4 animate-spin" />
            ) : completed ? (
                <CheckCircle2 className="size-4" />
            ) : (
                <Circle className="size-4" />
            )}
            {completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
        </Button>
    )
}
