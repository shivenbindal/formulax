export function getInlineUrl(url) {
  if (!url) return url
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
}

export function savedDocId(cls, subject, chapter) {
  return encodeURIComponent(`${cls}|${subject}|${chapter}`)
}
