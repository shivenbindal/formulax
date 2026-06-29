const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export async function generateFormulaSheet(subject, chapter, className) {
  const prompt = `You are an expert teacher. Generate a comprehensive formula sheet for ${className} ${subject} - Chapter: ${chapter}.

Format the response as JSON with this exact structure:
{
  "title": "chapter name",
  "subject": "subject name",
  "class": "class name",
  "formulas": [
    {
      "name": "Formula Name",
      "formula": "the actual formula",
      "description": "what it means",
      "variables": "what each variable represents"
    }
  ],
  "keyPoints": ["point 1", "point 2", "point 3"]
}

Return ONLY the JSON, no extra text.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}