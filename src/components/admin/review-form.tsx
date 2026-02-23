import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ReviewForm({ submission, token, backendUrl }: any) {
    const [score, setScore] = useState<number | ''>('')
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (score === '') return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/submissions/${submission.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    reviewer_score: Number(score),
                    reviewer_comment: comment || undefined
                })
            })

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${await res.text()}`)
            }

            setDone(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="border p-6 rounded-xl bg-green-50/50 dark:bg-green-900/20">
                <h3 className="font-bold text-green-800 dark:text-green-300">Review Submitted Successfully ✅</h3>
            </div>
        )
    }

    return (
        <div className="border p-6 rounded-xl bg-card">
            <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                <div>
                    <h3 className="font-bold">Submission ID: {submission.id}</h3>
                    <p className="text-sm text-muted-foreground">User ID: {submission.user_id}</p>
                    <p className="text-sm text-muted-foreground">Lesson ID: {submission.lesson_id}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {new Date(submission.submitted_at).toLocaleString()}
                </div>
            </div>

            <div className="mb-6 border bg-secondary/50 p-4 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-auto">
                {submission.content}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded">{error}</div>}

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Reviewer Score (0-100)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        className="border p-2 rounded-md w-32 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        value={score}
                        onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Feedback Comment (Optional)</label>
                    <textarea
                        className="border p-2 rounded-md bg-background min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="flex justify-end mt-2">
                    <Button type="submit" disabled={loading || score === ''}>
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
