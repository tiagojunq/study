// Renders a question stem that may contain space-padded tables (PDF extraction artifact).
// Table lines (any leading whitespace or 3+ consecutive internal spaces) are rendered
// inside a <pre> with monospace font; prose lines are joined into paragraphs.
export default function StemRenderer({ text }) {
  const isTableLine = (line) =>
    line.trim() !== '' &&
    (/^\s+/.test(line) || / {3,}/.test(line))

  const segments = []
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') {
      i++
    } else if (isTableLine(line)) {
      const tableLines = []
      while (i < lines.length && (isTableLine(lines[i]) || lines[i].trim() === '')) {
        tableLines.push(lines[i])
        i++
      }
      while (tableLines.length > 0 && tableLines[tableLines.length - 1].trim() === '') {
        tableLines.pop()
      }
      segments.push({ type: 'table', lines: tableLines })
    } else {
      const proseLines = []
      while (i < lines.length && !isTableLine(lines[i])) {
        proseLines.push(lines[i])
        i++
      }
      segments.push({ type: 'prose', lines: proseLines })
    }
  }

  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.type === 'table') {
          return <pre key={idx} className="stem-table">{seg.lines.join('\n')}</pre>
        }
        const paras = []
        let para = []
        for (const ln of seg.lines) {
          if (ln.trim() === '') {
            if (para.length > 0) { paras.push(para.join(' ')); para = [] }
          } else {
            para.push(ln)
          }
        }
        if (para.length > 0) paras.push(para.join(' '))
        return (
          <div key={idx} className="stem-prose">
            {paras.map((p, j) => <p key={j}>{p}</p>)}
          </div>
        )
      })}
    </>
  )
}
