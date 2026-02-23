import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import {
    BookOpen,
    Trophy,
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp,
    User as UserIcon,
} from 'lucide-react'

interface ProgressItem {
    lesson_id: string
    status: string
}

interface SubmissionItem {
    id: string
    lesson_id: string
    status: string
    final_score: number | null
    submitted_at: string
}

interface SubjectProgress {
    subject: string
    total: number
    completed: number
    lessons: { id: string; completed: boolean }[]
}

export default function ProfileStats({
    allLessons,
}: {
    allLessons: { id: string; title: string; subject: string; exercise: boolean }[]
}) {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [progress, setProgress] = useState<ProgressItem[]>([])
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        async function fetchData() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setLoading(false)
                return
            }

            setUser(session.user)

            const [progressRes, submissionsRes] = await Promise.all([
                supabase
                    .from('user_progress')
                    .select('lesson_id, status')
                    .eq('user_id', session.user.id),
                supabase
                    .from('exercise_submissions')
                    .select('id, lesson_id, status, final_score, submitted_at')
                    .eq('user_id', session.user.id)
                    .order('submitted_at', { ascending: false }),
            ])

            if (progressRes.data) setProgress(progressRes.data)
            if (submissionsRes.data) setSubmissions(submissionsRes.data)
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse text-muted-foreground">Đang tải dữ liệu...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="rounded-xl border bg-card p-12 text-center">
                <UserIcon className="mx-auto mb-4 size-12 text-muted-foreground/30" />
                <h2 className="text-xl font-bold mb-2">Chưa đăng nhập</h2>
                <p className="text-muted-foreground">
                    Vui lòng đăng nhập để xem tiến độ học tập của bạn.
                </p>
            </div>
        )
    }

    const completedLessons = new Set(
        progress.filter(p => p.status === 'completed').map(p => p.lesson_id)
    )

    // Group lessons by subject 
    const subjectMap = new Map<string, SubjectProgress>()
    for (const lesson of allLessons) {
        if (!subjectMap.has(lesson.subject)) {
            subjectMap.set(lesson.subject, {
                subject: lesson.subject,
                total: 0,
                completed: 0,
                lessons: [],
            })
        }
        const sp = subjectMap.get(lesson.subject)!
        sp.total++
        const isCompleted = completedLessons.has(lesson.id)
        if (isCompleted) sp.completed++
        sp.lessons.push({ id: lesson.id, completed: isCompleted })
    }
    const subjectProgress = Array.from(subjectMap.values())

    // Exercise submissions stats
    const reviewedSubmissions = submissions.filter(s => s.status === 'human_reviewed')
    const avgScore = reviewedSubmissions.length > 0
        ? Math.round(reviewedSubmissions.reduce((sum, s) => sum + (s.final_score ?? 0), 0) / reviewedSubmissions.length)
        : null

    return (
        <div className="flex flex-col gap-8">
            {/* User Info Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">
                            {user.user_metadata?.display_name || user.email}
                        </h2>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="size-5 text-green-500" />
                        <span className="text-sm font-medium text-muted-foreground">Bài học hoàn thành</span>
                    </div>
                    <p className="text-3xl font-bold">{completedLessons.size}</p>
                </div>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="size-5 text-blue-500" />
                        <span className="text-sm font-medium text-muted-foreground">Bài tập đã nộp</span>
                    </div>
                    <p className="text-3xl font-bold">{submissions.length}</p>
                </div>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="size-5 text-amber-500" />
                        <span className="text-sm font-medium text-muted-foreground">Điểm trung bình</span>
                    </div>
                    <p className="text-3xl font-bold">
                        {avgScore !== null ? `${avgScore}/100` : '—'}
                    </p>
                </div>
            </div>

            {/* Subject Progress */}
            <div>
                <h3 className="mb-4 text-lg font-bold">Tiến độ theo chủ đề</h3>
                <div className="flex flex-col gap-3">
                    {subjectProgress.map(sp => (
                        <div key={sp.subject} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedSubject(expandedSubject === sp.subject ? null : sp.subject)}
                                className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold uppercase">{sp.subject}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {sp.completed}/{sp.total} bài
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${sp.total > 0 ? (sp.completed / sp.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    {expandedSubject === sp.subject ? (
                                        <ChevronUp className="size-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="size-4 text-muted-foreground" />
                                    )}
                                </div>
                            </button>
                            {expandedSubject === sp.subject && (
                                <div className="border-t px-4 py-2">
                                    {sp.lessons.map(lesson => (
                                        <div key={lesson.id} className="flex items-center gap-3 py-1.5 text-sm">
                                            {lesson.completed ? (
                                                <CheckCircle2 className="size-4 text-green-500" />
                                            ) : (
                                                <div className="size-4 rounded-full border-2 border-muted-foreground/20" />
                                            )}
                                            <a
                                                href={`/${lesson.id}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {allLessons.find(l => l.id === lesson.id)?.title || lesson.id}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Submissions */}
            {submissions.length > 0 && (
                <div>
                    <h3 className="mb-4 text-lg font-bold">Bài tập đã nộp gần đây</h3>
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-secondary/30">
                                    <th className="px-4 py-3 text-left font-medium">Bài tập</th>
                                    <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 text-left font-medium">Điểm</th>
                                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Ngày nộp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 10).map(sub => (
                                    <tr key={sub.id} className="border-b last:border-0">
                                        <td className="px-4 py-3">
                                            <a href={`/${sub.lesson_id}`} className="hover:text-primary transition-colors font-medium">
                                                {allLessons.find(l => l.id === sub.lesson_id)?.title || sub.lesson_id}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'human_reviewed'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : sub.status === 'ai_graded'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {sub.status === 'human_reviewed' ? (
                                                    <><CheckCircle2 className="size-3" /> Đã chấm</>
                                                ) : sub.status === 'ai_graded' ? (
                                                    <><Clock className="size-3" /> AI đã chấm</>
                                                ) : (
                                                    <><Clock className="size-3" /> Đang chờ</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {sub.final_score !== null ? `${sub.final_score}/100` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                            {new Date(sub.submitted_at).toLocaleDateString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
