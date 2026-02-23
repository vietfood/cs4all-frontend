import React, { useState, useRef, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import {
    Send,
    Loader2,
    ArrowLeft,
    Sparkles,
    User,
    AlertCircle,
    LogIn,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export interface Anchor {
    id: string;
    label: string;
    type: string;
    preview: string;
}

interface LessonChatProps {
    lessonId: string
    lessonTitle: string
    initialQuestion?: string
    anchorMap?: Anchor[]
}

const BACKEND_URL =
    (typeof window !== 'undefined'
        ? (window as any).__PUBLIC_BACKEND_URL__
        : undefined) || import.meta.env?.PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * DeepWiki-style lesson chat component.
 *
 * Features:
 * - SSE streaming (token-by-token)
 * - Content references: [ref:ID] → styled citation blocks
 * - Auth-aware: shows login prompt if not authenticated
 * - Chat history within the session
 */
export default function LessonChat({ lessonId, lessonTitle, initialQuestion, anchorMap = [] }: LessonChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState(initialQuestion || '')
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [activeRef, setActiveRef] = useState<string | null>(null)
    const [isAutoScrolling, setIsAutoScrolling] = useState(true)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const supabase = getSupabaseBrowserClient()

    // Check auth on mount
    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession()
            setIsAuthenticated(!!session)
        }
        checkAuth()
    }, [])

    // Auto-submit if there's an initial question
    useEffect(() => {
        if (initialQuestion && isAuthenticated) {
            handleSubmit()
        }
    }, [isAuthenticated])

    // Only smooth scroll when user explicitly submits a new prompt
    // Not on every token update
    const executeSmoothScroll = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleScroll = () => {
        const container = chatContainerRef.current
        if (!container) return

        // 50px threshold from the bottom to consider "at bottom"
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
        setIsAutoScrolling(isAtBottom)
    }

    // Removed custom renderContent function in favor of ReactMarkdown

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault()
        const question = input.trim()
        if (!question || isStreaming) return

        setError(null)
        setInput('')

        // Add user message
        const userMsg: Message = { role: 'user', content: question }
        setMessages(prev => [...prev, userMsg])
        setIsStreaming(true)
        setIsAutoScrolling(true)

        // Give React a tick to render the empty user/assistant bubbles, then smooth scroll down
        setTimeout(() => executeSmoothScroll(), 50)

        // Add placeholder for assistant
        setMessages(prev => [...prev, { role: 'assistant', content: '' }])

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
                setIsStreaming(false)
                return
            }

            const response = await fetch(`${BACKEND_URL}/api/v1/hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    lesson_id: lessonId,
                    question: question,
                    anchor_map: anchorMap,
                }),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => null)
                const errMsg = errData?.detail || `Lỗi ${response.status}`
                setError(errMsg)
                // Remove the empty assistant message
                setMessages(prev => prev.slice(0, -1))
                setIsStreaming(false)
                return
            }

            // Stream SSE response
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                setError('Không thể đọc phản hồi từ server.')
                setIsStreaming(false)
                return
            }

            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') continue
                        if (data.startsWith('[ERROR]')) {
                            setError(data.slice(8))
                            continue
                        }
                        accumulated += data

                        // Update the last assistant message
                        setMessages(prev => {
                            const updated = [...prev]
                            updated[updated.length - 1] = {
                                role: 'assistant',
                                content: accumulated,
                            }
                            return updated
                        })

                        // Smart scroll: instantly pin to bottom if auto-scrolling is enabled
                        if (isAutoScrolling && chatContainerRef.current) {
                            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi khi kết nối đến server.')
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setIsStreaming(false)
            inputRef.current?.focus()
        }
    }

    // Loading auth state
    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-6 py-4 shrink-0">
                <a
                    href={`/${lessonId}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Quay lại
                </a>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="size-4 text-primary" />
                    <span className="font-medium">Hỏi AI</span>
                    <span className="text-muted-foreground">về</span>
                    <span className="font-medium truncate max-w-[300px]">{lessonTitle}</span>
                </div>
            </div>

            {/* Chat area */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-6 pt-4 pb-6 space-y-6 scroll-smooth"
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <Sparkles className="size-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Hỏi AI về bài học</h2>
                        <p className="text-muted-foreground max-w-md text-sm">
                            Đặt câu hỏi về bất kỳ khái niệm, phương trình, hoặc bài tập nào trong bài học.
                            AI sẽ hướng dẫn bạn hiểu sâu hơn, không đưa ra đáp án trực tiếp.
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                            <div className="shrink-0 mt-1">
                                <div className="rounded-full bg-primary/10 p-1.5">
                                    <Sparkles className="size-4 text-primary" />
                                </div>
                            </div>
                        )}

                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap'
                                : 'bg-secondary/50 border rounded-bl-md'
                                }`}
                        >
                            {msg.role === 'assistant' ? (
                                !msg.content && isStreaming && i === messages.length - 1 ? (
                                    <div className="text-muted-foreground italic py-1 animate-bounce">
                                        bún chả đang suy nghĩ, bạn đợi chút nhé
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert prose-sm max-w-none text-current [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                a: ({ href, children }) => {
                                                    if (href?.startsWith('#ref-')) {
                                                        const refId = href.slice(5)
                                                        const anchor = anchorMap.find(a => a.id === refId)
                                                        if (!anchor) return null
                                                        const isActive = activeRef === refId
                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    setActiveRef(refId)
                                                                    window.dispatchEvent(
                                                                        new CustomEvent('lesson-reference-click', { detail: { id: refId } })
                                                                    )
                                                                }}
                                                                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0 text-xs font-medium transition-colors align-middle mx-1 ${isActive
                                                                    ? 'bg-background text-foreground border-primary/50 shadow-sm ring-1 ring-primary'
                                                                    : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                                                                    }`}
                                                                title={`Nhấp để xem tham chiếu: ${anchor.label}`}
                                                            >
                                                                <Sparkles className="size-3 text-current" />
                                                                {anchor.label}
                                                            </button>
                                                        )
                                                    }
                                                    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>
                                                },
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="pl-1">{children}</li>,
                                                code: ({ className, children }) => {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return match ? (
                                                        <div className="bg-background rounded-md p-2 mb-2 overflow-x-auto text-xs font-mono border">
                                                            <code>{children}</code>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-background rounded px-1 py-0.5 text-[0.85em] font-mono border">{children}</code>
                                                    )
                                                }
                                            }}
                                        >
                                            {msg.content.replace(
                                                /\[ref:([a-zA-Z0-9_-]+)\]/gi,
                                                (match, id) => {
                                                    const anchor = anchorMap.find(a => a.id === id)
                                                    return anchor ? `[${anchor.label}](#ref-${id})` : match
                                                }
                                            )}
                                        </ReactMarkdown>
                                    </div>
                                )
                            ) : (
                                msg.content
                            )}
                            {isStreaming && msg.role === 'assistant' && i === messages.length - 1 && (
                                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1 rounded-sm align-middle" />
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="shrink-0 mt-1">
                                <div className="rounded-full bg-muted p-1.5">
                                    <User className="size-4 text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
                        <AlertCircle className="size-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div ref={chatEndRef} className="h-4" />

                {!isAutoScrolling && isStreaming && (
                    <button
                        onClick={() => {
                            setIsAutoScrolling(true)
                            executeSmoothScroll()
                        }}
                        className="fixed bottom-24 left-1/2 md:left-1/4 -translate-x-1/2 bg-background/90 backdrop-blur border text-sm px-4 py-1.5 rounded-full shadow-md flex items-center gap-2 hover:bg-secondary z-20"
                    >
                        ↓ Cuộn xuống dưới cùng
                    </button>
                )}
            </div>

            {/* Input area */}
            <div className="border-t bg-background/80 backdrop-blur-sm px-6 py-4 shrink-0">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit()
                                }
                            }}
                            placeholder="Hỏi về bài học này..."
                            className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-[120px]"
                            rows={1}
                            disabled={isStreaming}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="shrink-0 rounded-xl h-[44px] w-[44px]"
                            disabled={isStreaming || !input.trim()}
                        >
                            {isStreaming ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="flex items-center justify-center gap-3 py-2 text-sm text-muted-foreground">
                        <LogIn className="size-4" />
                        <span>Vui lòng đăng nhập để hỏi AI về bài học.</span>
                    </div>
                )}
            </div>
        </div>
    )
}
