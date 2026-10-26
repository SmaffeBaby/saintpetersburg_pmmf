export type LegalBlock =
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

// A deliberately small text format: no HTML, scripts or executable Markdown.
export const parseLegalContent = (source: string): LegalBlock[] => {
  const blocks: LegalBlock[] = []
  let paragraph: string[] = []
  let headingCount = 0
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
    paragraph = []
  }
  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    const heading = /^(#{2,3})\s+(.+)$/.exec(line)
    if (heading) {
      flush()
      blocks.push({ type: 'heading', level: heading[1]!.length as 2 | 3, text: heading[2]!, id: `section-${++headingCount}` })
    } else if (/^-\s+/.test(line)) {
      flush()
      const last = blocks.at(-1)
      const text = line.replace(/^-\s+/, '')
      if (last?.type === 'list') last.items.push(text)
      else blocks.push({ type: 'list', items: [text] })
    } else paragraph.push(line)
  }
  flush()
  return blocks
}
