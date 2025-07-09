import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `
You are Lincoln E-Library's AI Tutor.
- For general academic or study questions, answer conversationally and helpfully.
- If the user asks about books, book requests, or library data, generate a SQL query in [SQL]...[/SQL] tags to retrieve the answer from the database, and summarize the results.
- If the question is not about the library database, do NOT mention the database or your limitations—just answer as a helpful tutor.
- Only use SELECT statements on the 'books' or 'book_requests' tables when generating SQL.
Example:
User: How many books are there?
AI: [SQL]SELECT COUNT(*) FROM books;[/SQL]
`;

async function callGemini(messages: any[], apiKey: string) {
  const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: messages,
    }),
  })
  if (!geminiResponse.ok) {
    let errorText = await geminiResponse.text()
    let errorJson
    try { errorJson = JSON.parse(errorText) } catch { errorJson = { raw: errorText } }
    console.error("Gemini API error:", errorJson)
    throw new Error(errorJson.error?.message || errorText || "Gemini API error")
  }
  const data = await geminiResponse.json()
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request."
  return aiResponse
}

function extractSQL(text: string): string | null {
  const match = text.match(/\[SQL\]([\s\S]+?)\[\/SQL\]/i)
  return match ? match[1].trim() : null
}

function isSafeSQL(sql: string): boolean {
  const allowed = /^(SELECT\s+.+\s+FROM\s+(books|book_requests))/i
  return allowed.test(sql) && !/;.*(drop|delete|update|insert|alter|create)/i.test(sql)
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("Gemini API key not configured.")
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 })
    }
    const supabase = await createClient()

    // 1. Build messages for Gemini
    const messages = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...((history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))),
      { role: "user", parts: [{ text: message }] },
    ]

    // 2. Get Gemini's response
    let aiResponse = await callGemini(messages, apiKey)
    const sql = extractSQL(aiResponse)

    if (sql && isSafeSQL(sql)) {
      // 3. Run the SQL query (read-only, safe)
      let dbResult
      try {
        const safeSql = sql.replace(/;\s*$/, "")
        const { data, error } = await supabase.rpc("run_sql", { sql: safeSql })
        if (error) throw error
        dbResult = data
      } catch (err: any) {
        console.error("DB error:", err)
        return NextResponse.json({ error: "Database error: " + (err.message || err) }, { status: 500 })
      }
      // 4. Ask Gemini to summarize the result
      const summaryMessages = [
        { role: "user", parts: [{ text: `The user asked: "${message}". Here is the database result: ${JSON.stringify(dbResult)}. Please provide a natural, conversational response that answers their question in a helpful way. Don't mention "database query" or technical details - just answer their question naturally.` }] },
      ]
      const summary = await callGemini(summaryMessages, apiKey)
      return NextResponse.json({ response: summary, sql, dbResult })
    }

    // 5. If no SQL, just return the normal Gemini response
    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("AI Tutor API Error:", error)
    return NextResponse.json({ error: "Failed to process request: " + (error?.message || error) }, { status: 500 })
  }
}
