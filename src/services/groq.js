const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY

async function callSarvam(messages, { maxTokens = 2000, temperature = 0.2 } = {}) {
  if (!SARVAM_API_KEY) {
    throw new Error('Sarvam API key not configured. Set VITE_SARVAM_API_KEY.')
  }

  const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': SARVAM_API_KEY
    },
    body: JSON.stringify({
      model: 'sarvam-105b',
      messages,
      max_tokens: maxTokens,
      temperature,
      reasoning_effort: null
    })
  })

  if (res.status === 429) {
    throw new Error('Sarvam API rate limited. Try again in a moment.')
  }
  if (!res.ok) {
    let errMsg = 'Sarvam API error'
    try {
      const err = await res.json()
      errMsg = err?.error?.message || err?.message || errMsg
    } catch {
      // response wasn't JSON, keep default message
    }
    throw new Error(errMsg)
  }

  const data = await res.json()
  const text = data.choices[0].message.content
  if (!text || !text.trim()) throw new Error('Empty response from model')
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export async function findFormula(question) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert formula identification assistant for Indian students (CBSE Class 9-12, NEET, JEE).

Given a physics, chemistry, maths or biology question, identify ALL formulas needed to solve it. Do NOT solve the question or give numerical answers.

For each formula:
- name: Full specific name (e.g. "Coulomb's Law", not just "force formula")
- formula: Equation with ALL variables defined (e.g. "F = kq₁q₂/r² | F=force(N), k=9×10⁹ Nm²/C², q=charge(C), r=distance(m)")
- why: Specific reason this formula applies to THIS question (reference the question's values/scenario)
approach: An array of 3-6 short, concrete, imperative steps for HOW to solve this — not an explanation paragraph. Each step is one clear action, under 15 words, referencing this specific question's values where useful. Never compute or reveal the final numerical answer. Example array: ["Identify the two charges and the distance between them from the question", "Note that this is a straight application of Coulomb's Law", "Substitute the given charge and distance values into the formula", "Keep units consistent — convert distance to metres before substituting"]

Return ONLY valid JSON, no markdown, no extra text:
{"formulas":[{"name":"...","formula":"...","why":"..."}],"approach":["...","...","..."]}`
    },
    {
      role: 'user',
      content: question
    }
  ]

  return callSarvam(messages, { maxTokens: 2000, temperature: 0.2 })
}

export async function generateQuizQuestions({ classLevel, subject, topic, difficulty, count = 5 }) {
  const messages = [
    {
      role: 'system',
      content: `You are a CBSE ${classLevel} ${subject} MCQ generator for Indian students preparing for board exams, NEET, and JEE.

Generate exactly ${count} multiple-choice questions on the topic "${topic}" at ${difficulty} difficulty.

Rules:
- Strictly ${classLevel} NCERT/CBSE syllabus-aligned
- Each question has exactly 4 options, only one correct
- Include a short explanation (1-3 sentences) for why the correct answer is right
- "easy" = direct recall/definition, "medium" = single-step application/calculation, "hard" = multi-step or conceptual application
- Vary question structure — don't repeat the same phrasing pattern across questions
- Never leave the correct index ambiguous or guess randomly

Return ONLY valid JSON, no markdown, no extra text:
{"questions":[{"text":"...","options":["...","...","...","..."],"correct":0,"explanation":"..."}]}`
    },
    {
      role: 'user',
      content: `Generate ${count} ${difficulty} MCQs on ${topic}.`
    }
  ]

  return callSarvam(messages, { maxTokens: 3000, temperature: 0.7 })
}

export async function parseTestQuestions(input) {
  const messages = [
    {
      role: 'system',
      content: `You are a test question parser for Indian CBSE students (Class 9-12, NEET, JEE).

Parse the provided text containing test questions and extract them as structured data.

Return ONLY valid JSON, no markdown, no extra text:
{"questions":[{"text":"...","options":["...","...","...","..."],"correct":0}]}`
    },
    {
      role: 'user',
      content: input
    }
  ]

  return callSarvam(messages, { maxTokens: 3000, temperature: 0.5 })
}
