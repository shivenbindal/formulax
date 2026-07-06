const GROQ_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_KEY_2,
  import.meta.env.VITE_GROQ_KEY_3,
  import.meta.env.VITE_GROQ_KEY_4,
  import.meta.env.VITE_GROQ_KEY_5,
  import.meta.env.VITE_GROQ_KEY_6,
].filter(Boolean)

let keyIndex = 0
function getKey() {
  const key = GROQ_KEYS[keyIndex % GROQ_KEYS.length]
  keyIndex = (keyIndex + 1) % GROQ_KEYS.length
  return key
}

export async function findFormula(question, imageBase64 = null) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert formula identification assistant for Indian students (CBSE Class 9-12, NEET, JEE).

Given a physics, chemistry, maths or biology question, identify ALL formulas needed to solve it. Do NOT solve the question or give numerical answers.

For each formula:
- name: Full specific name (e.g. "Coulomb's Law", not just "force formula")
- formula: Equation with ALL variables defined (e.g. "F = kq₁q₂/r² | F=force(N), k=9×10⁹ Nm²/C², q=charge(C), r=distance(m)")
- why: Specific reason this formula applies to THIS question (reference the question's values/scenario)

hint: Step-by-step approach without solving (e.g. "1. Identify the charges and distance. 2. Apply Coulomb's law. 3. Check units.")

Return ONLY valid JSON, no markdown, no extra text:
{"formulas":[{"name":"...","formula":"...","why":"..."}],"hint":"..."}`
    },
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: question || 'Identify the formula(s) needed to solve this question.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        : question
    }
  ]

  const tryWithKey = async (key) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1200,
        temperature: 0.2
      })
    })
    if (res.status === 429) throw new Error('RATE_LIMIT')
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err?.error?.message || 'Groq API error')
    }
    const data = await res.json()
    const text = data.choices[0].message.content
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  }

  for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
    try {
      return await tryWithKey(getKey())
    } catch (err) {
      if (err.message === 'RATE_LIMIT' && attempt < GROQ_KEYS.length - 1) continue
      throw err
    }
  }
  throw new Error('All API keys rate limited. Try again in a moment.')
}
