import React, { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

interface FeedbackItem {
    criterion: string
    points_awarded: number
    points_possible: number
    comment: string
}

export default function ExerciseSubmission({ lessonId }: { lessonId: string }) {
    const [content, setContent] = useState('')
    const [status, setStatus] = useState<'pending' | 'submitted' | 'ai_graded' | 'human_reviewed'>('pending')
    const [feedback, setFeedback] = useState<FeedbackItem[] | null>(null)
    const [finalScore, setFinalScore] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        async function loadSubmission() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('exercise_submissions')
                .select('*')
                .eq('lesson_id', lessonId)
                .eq('user_id', session.user.id)
                .order('submitted_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                setContent(data.content)
                setStatus(data.status)
                setFinalScore(data.final_score)
                if (data.status === 'ai_graded' || data.status === 'human_reviewed') {
                    setFeedback(data.llm_feedback || null)
                }
            }
            setLoading(false)
        }
        loadSubmission()
    }, [lessonId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        setError(null)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            setError('You must be logged in to submit an exercise.')
            setLoading(false)
            return
        }

        const { error: submitError } = await supabase
            .from('exercise_submissions')
            .insert({
                user_id: session.user.id,
                lesson_id: lessonId,
                content: content,
                status: 'submitted',
            })

        if (submitError) {
            setError(submitError.message)
            setLoading(false)
        } else {
            setStatus('submitted')
            setLoading(false)
        }
    }

    if (loading) return <div className="text-sm text-muted-foreground animate-pulse">Loading exercise data...</div>

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 my-8">
            <h3 className="text-lg font-bold mb-4">Exercise Submission</h3>

            {error && <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>}

            {(status === 'pending' || status === 'submitted') && !finalScore ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {status === 'submitted' && <div className="p-3 bg-blue-100 text-blue-800 rounded-md text-sm mb-2"> Your exercise was successfully submitted and is awaiting grading. </div>}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={status !== 'pending'}
                        placeholder="Write your Markdown / LaTeX solution here..."
                        className="min-h-[200px] w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        required
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={status !== 'pending' || loading || !content.trim()}>
                            {status === 'pending' ? 'Submit Solution' : 'Submitted'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="bg-secondary p-4 rounded-md">
                        <div className="font-semibold text-sm mb-2 opacity-70">Your Solution:</div>
                        <div className="text-sm whitespace-pre-wrap">{content}</div>
                    </div>

                    <div className="border border-green-200 bg-green-50/50 dark:bg-green-950/20 rounded-md p-4">
                        <h4 className="font-bold flex items-center justify-between">
                            <span>Grade Result</span>
                            {finalScore !== null && <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full">{finalScore} / 100</span>}
                        </h4>

                        <div className="text-sm text-muted-foreground mb-4">
                            Status: <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                        </div>

                        {feedback && feedback.length > 0 && (
                            <div className="flex flex-col gap-3 mt-4">
                                {feedback.map((item, idx) => (
                                    <div key={idx} className="bg-background rounded p-3 text-sm border">
                                        <div className="font-medium flex justify-between mb-1">
                                            <span>{item.criterion}</span>
                                            <span className="opacity-70">{item.points_awarded} / {item.points_possible} pts</span>
                                        </div>
                                        {item.comment && <div className="text-muted-foreground">{item.comment}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
