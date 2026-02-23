import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import type { Plugin } from 'unified'
import type { Root, Element } from 'hast'

export interface Anchor {
    id: string
    label: string
    type: 'heading' | 'paragraph' | 'equation' | 'figure' | 'definition'
    preview: string
}

export const rehypeAnchorMap: Plugin<[], Root> = () => {
    return (tree, file) => {
        const anchorMap: Anchor[] = []
        let pCount = 0
        let eqCount = 0

        // Ensure the frontmatter object exists
        if (!file.data.astro) file.data.astro = { frontmatter: {} }
        if (!(file.data.astro as any).frontmatter) (file.data.astro as any).frontmatter = {}

        visit(tree, 'element', (node: Element) => {
            const isHeading = /^h[1-6]$/.test(node.tagName)
            const isParagraph = node.tagName === 'p'

            let isMathBlock = false
            if (node.properties && Array.isArray(node.properties.className)) {
                isMathBlock = (node.properties.className as string[]).includes('katex-display')
            }

            if (!isHeading && !isParagraph && !isMathBlock) return

            let textContent = toString(node).trim()

            if (!textContent) return

            if (!node.properties) node.properties = {}

            let type: Anchor['type'] = 'paragraph'
            let id = node.properties.id as string
            let label = ''

            if (isHeading) {
                type = 'heading'
                if (!id) {
                    id = `ref-h-${slugify(textContent)}`
                    node.properties.id = id
                }
                label = `Phần: ${textContent.slice(0, 30)}${textContent.length > 30 ? '...' : ''}`
            } else if (isMathBlock) {
                type = 'equation'
                eqCount++
                if (!id) {
                    id = `ref-eq-${eqCount}`
                    node.properties.id = id
                }
                label = `Phương trình ${eqCount}`

                // Katex output is very unreadable plaintext because of MathML + HTML mix
                // Let's try to grab just the annotation if it exists, or just leave it generic
                const texAnnotation = findTexAnnotation(node)
                if (texAnnotation) {
                    textContent = texAnnotation
                } else {
                    textContent = 'Phương trình toán học' // Default if we can't extract cleanly
                }
            } else if (isParagraph) {
                type = 'paragraph'
                pCount++
                if (!id) {
                    id = `ref-p-${pCount}`
                    node.properties.id = id
                }
                label = `Đoạn ${pCount}`
            }

            // Plaintext preview
            const preview = textContent.slice(0, 150).replace(/\n/g, ' ')

            anchorMap.push({
                id,
                label,
                type,
                preview
            })
        })

            ; (file.data.astro as any).frontmatter.anchorMap = anchorMap
    }
}

function slugify(text: string) {
    return text.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
}

// Katex generates an <annotation encoding="application/x-tex"> that contains the raw latex.
function findTexAnnotation(node: Element): string | null {
    let tex = null
    visit(node, 'element', (child: Element) => {
        if (child.tagName === 'annotation' && child.properties?.encoding === 'application/x-tex') {
            tex = toString(child)
        }
    })
    return tex
}
