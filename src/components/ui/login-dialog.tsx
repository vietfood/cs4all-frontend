import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogIn, Mail, Loader2 } from 'lucide-react'

export default function LoginDialog() {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('email', email)

            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                body: formData,
                redirect: 'manual',
            })

            // A redirect (303) means success — the server sends us to /?alert=check_email
            if (res.type === 'opaqueredirect' || res.status === 303 || res.ok) {
                toast.success('Magic Link đã được gửi!', {
                    description: 'Kiểm tra email của bạn để đăng nhập.',
                })
                setOpen(false)
                setEmail('')
            } else {
                const text = await res.text()
                toast.error('Lỗi đăng nhập', {
                    description: text || 'Đã xảy ra lỗi. Vui lòng thử lại.',
                })
            }
        } catch {
            toast.error('Lỗi kết nối', {
                description: 'Không thể kết nối đến server. Vui lòng thử lại.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
                    <LogIn className="size-4" />
                    <span className="hidden sm:inline-block">Log In</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Đăng nhập</DialogTitle>
                    <DialogDescription>
                        Nhập email để nhận Magic Link đăng nhập.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="login-email" className="text-sm font-medium">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                className="w-full rounded-md border bg-background py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={loading || !email.trim()} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi Magic Link'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
