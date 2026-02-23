import type { ReactNode } from 'react'

interface QuestionProps {
    children: ReactNode
}

/**
 * Question wrapper for use inside <ExerciseBlock>.
 * Simply wraps its children — ExerciseBlock identifies it by displayName.
 * 
 * Usage in MDX:
 * ```mdx
 * <Question>
 *   Phương trình (1.1) ...
 * </Question>
 * ```
 */
function Question({ children }: QuestionProps) {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {children}
        </div>
    )
}

Question.displayName = 'Question'

export default Question
