import type { ReactNode } from 'react'

interface SolutionProps {
    children: ReactNode
}

/**
 * Solution wrapper for use inside <ExerciseBlock>.
 * Simply wraps its children — ExerciseBlock identifies it by displayName.
 * The solution is hidden by default and toggled by the ExerciseBlock.
 * 
 * Usage in MDX:
 * ```mdx
 * <Solution>
 *   Giờ bắt đầu biến đổi...
 * </Solution>
 * ```
 */
function Solution({ children }: SolutionProps) {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {children}
        </div>
    )
}

Solution.displayName = 'Solution'

export default Solution
