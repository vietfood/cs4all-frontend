import React, { useState, useEffect, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { BookOpen, Lightbulb, Send, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

interface ExerciseBlockProps {
    id: string
    title: string
    /** The page-level lesson ID (e.g., 'prml/1-exercise') */
    lessonId: string
    /** Pre-rendered HTML content from Astro slot (contains Question/Solution divs) */
    slotContent: string
}

/**
 * ExerciseBlock React component.
 * Receives pre-rendered HTML from Astro wrapper, parses it to extract
 * Question and Solution sections by `data-exercise-role` attributes.
 * 
 * Flow: Question (always visible) → Submission form → Solution (revealed after submit)
 */
export default function ExerciseBlock({ id, title, lessonId, slotContent }: ExerciseBlockProps) {
    const exerciseLessonId = `${lessonId}#${id}`

    const [showSolution, setShowSolution] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [existingSubmission, setExistingSubmission] = useState<any>(null)

    // Parse the slot HTML to extract question, solution, and rubric parts.
    // Rubric is parsed but never rendered — it's machine-readable grading
    // criteria for the backend LLM grader (see Rubric.astro).
    const { questionHtml, solutionHtml } = React.useMemo(() => {
        const parser = typeof window !== 'undefined' ? new DOMParser() : null
        if (!parser) return { questionHtml: '', solutionHtml: '' }

        const doc = parser.parseFromString(`<div>${slotContent}</div>`, 'text/html')
        const questionEl = doc.querySelector('[data-exercise-role="question"]')
        const solutionEl = doc.querySelector('[data-exercise-role="solution"]')
        // Rubric is intentionally NOT rendered — backend parses it from raw MDX.
        // const rubricEl = doc.querySelector('[data-exercise-role="rubric"]')

        return {
            questionHtml: questionEl?.innerHTML || '',
            solutionHtml: solutionEl?.innerHTML || '',
        }
    }, [slotContent])

    const supabase = getSupabaseBrowserClient()

    // Check for existing submission
    useEffect(() => {
        async function checkSubmission() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setLoading(false)
                return
            }

            const { data } = await supabase
                .from('exercise_submissions')
                .select('*')
                .eq('lesson_id', exerciseLessonId)
                .eq('user_id', session.user.id)
                .order('submitted_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                setExistingSubmission(data)
                setContent(data.content)
                setHasSubmitted(true)
            }
            setLoading(false)
        }
        checkSubmission()
    }, [exerciseLessonId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setSubmitting(true)
        setError(null)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            setError('Vui lòng đăng nhập để nộp bài.')
            setSubmitting(false)
            return
        }

        const { error: submitError } = await supabase
            .from('exercise_submissions')
            .insert({
                user_id: session.user.id,
                lesson_id: exerciseLessonId,
                content: content,
                status: 'submitted',
            })

        if (submitError) {
            setError(submitError.message)
        } else {
            setHasSubmitted(true)
        }
        setSubmitting(false)
    }

    return (
        <div
            id={`exercise-${id}`}
            className="my-8 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-secondary/30 px-5 py-3">
                <BookOpen className="size-5 text-primary shrink-0" />
                <h3 className="text-lg font-bold m-0">{title}</h3>
                <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary shrink-0">
                    Bài tập
                </span>
            </div>

            {/* Question — always visible */}
            {questionHtml && (
                <div
                    className="prose dark:prose-invert max-w-none px-5 py-4 border-b"
                    dangerouslySetInnerHTML={{ __html: questionHtml }}
                />
            )}

            {/* Submission form */}
            <div className="px-5 py-4">
                {loading ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div>
                ) : hasSubmitted ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                            <CheckCircle2 className="size-4" />
                            Bạn đã nộp bài tập này
                        </div>
                        <div className="rounded-md bg-secondary/50 p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-auto">
                            {content}
                        </div>
                        {existingSubmission?.final_score !== null && existingSubmission?.final_score !== undefined && (
                            <div className="text-sm">
                                Điểm: <span className="font-bold text-green-600 dark:text-green-400">{existingSubmission.final_score}/100</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            Lời giải của bạn
                        </label>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                                {error}
                            </div>
                        )}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Viết lời giải Markdown / LaTeX của bạn ở đây..."
                            className="min-h-[120px] w-full border rounded-md p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                            required
                        />
                        <div className="flex justify-end">
                            <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Đang nộp...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 size-4" />
                                        Nộp bài
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Solution — only available after submission */}
            {solutionHtml && (
                <div className="border-t">
                    {hasSubmitted ? (
                        <>
                            <div className="px-5 py-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSolution(!showSolution)}
                                    className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    <Lightbulb className="size-4" />
                                    {showSolution ? 'Ẩn lời giải tham khảo' : 'Xem lời giải tham khảo'}
                                    {showSolution ? (
                                        <ChevronUp className="size-4" />
                                    ) : (
                                        <ChevronDown className="size-4" />
                                    )}
                                </Button>
                            </div>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${showSolution ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="border-t bg-green-50/30 px-5 py-4 dark:bg-green-950/10">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                                        <Lightbulb className="size-4" />
                                        Lời giải tham khảo
                                    </div>
                                    <div
                                        className="prose dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: solutionHtml }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="px-5 py-3 text-sm text-muted-foreground/60 italic">
                            💡 Lời giải tham khảo sẽ hiện sau khi bạn nộp bài.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
