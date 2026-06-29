const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function findFormula(question, imageBase64 = null) {
  const messages = [
    {
      role: 'system',
      content: `You are a formula identification expert for students. When given a question, identify ONLY which formula(s) to use to solve it. 
Do NOT solve the question. 
Return response in this exact JSON format:
{
  "formulas": [
    {
      "name": "Formula name",
      "formula": "the formula expression",
      "why": "one line why this formula applies here"
    }
  ],
  "hint": "one line hint on how to approach"
}
Return ONLY JSON, no extra text.`
    },
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: question || 'Identify the formula needed to solve this question.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        : question
    }
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1000,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'Groq API error')
  }

  const data = await response.json()
  const text = data.choices[0].message.content
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}