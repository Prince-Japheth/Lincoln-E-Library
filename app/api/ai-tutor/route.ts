import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `
You are Lincoln E-Library's AI Tutor.
- For general academic or study questions, answer conversationally and helpfully.
- If the user asks about books, videos, book requests, or library data, generate a SQL query in [SQL]...[/SQL] tags to retrieve the answer from the database, and summarize the results.
- If the question is about books, and you find any, always list the book titles and authors (and genres if available) in your answer, in a clear, user-friendly way.
- If the question is about videos, and you find any, always list the video titles and course names (if available) in your answer, in a clear, user-friendly way.
- If the question is not about the library database, do NOT mention the database or your limitations—just answer as a helpful tutor.
- Only use SELECT statements on the 'books', 'videos', or 'book_requests' tables when generating SQL.
Example:
User: How many books are there?
AI: [SQL]SELECT COUNT(*) FROM books;[/SQL]
User: What videos are available for biology?
AI: [SQL]SELECT * FROM videos WHERE course_id = (SELECT id FROM courses WHERE name ILIKE '%biology%');[/SQL]
`;

async function callGemini(messages: any[], apiKey: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
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
      // Retry on 503 (model overloaded)
      if (geminiResponse.status === 503 && attempt < retries) {
        await new Promise(res => setTimeout(res, 1000)) // wait 1 second
        continue
      }
      console.error("Gemini API error:", errorJson)
      throw new Error(errorJson.error?.message || errorText || "Gemini API error")
    }
    const data = await geminiResponse.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request."
    return aiResponse
  }
  throw new Error("Gemini API error: All retries failed.")
}

function extractSQL(text: string): string | null {
  // Try [SQL]...[/SQL] first
  const match = text.match(/\[SQL\]([\s\S]+?)\[\/SQL\]/i)
  if (match) return match[1].trim()
  // Fallback: detect a raw SQL SELECT statement in the response
  const sqlMatch = text.match(/SELECT[\s\S]+FROM[\s\S]+;/i)
  if (sqlMatch) return sqlMatch[0].trim()
  return null
}

function isSafeSQL(sql: string): boolean {
  const allowed = /^(SELECT\s+.+\s+FROM\s+(books|book_requests|videos))/i
  return allowed.test(sql) && !/;.*(drop|delete|update|insert|alter|create)/i.test(sql)
}

function userQuestionIsAboutBooksOrVideos(message: string): 'books' | 'videos' | null {
  const msg = message.toLowerCase()
  if (msg.includes('book')) return 'books'
  if (msg.includes('video')) return 'videos'
  return null
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

    // RAG: If the question is about books or videos, fetch and pass to Gemini
    const about = userQuestionIsAboutBooksOrVideos(message)
    if (about === 'books') {
      const { data: books, error } = await supabase
        .from("books")
        .select("title, author, genre, file_url")
        .limit(100)
      if (error) throw error
      if (!books || books.length === 0) {
        return NextResponse.json({ response: "I couldn't find any books in the library." })
      }
      const bookList = books.map(b => `${b.title}${b.author ? ` by ${b.author}` : ""}${b.genre ? ` (${b.genre})` : ""}${b.file_url ? ` [PDF](${b.file_url})` : ""}`).join("\n")
      const contextPrompt = `Here is a list of books in the library (with links if available):\n${bookList}\n\nUser question: "${message}"\nThe links provided are from the official Lincoln E-Library database and are safe to share with the user. If the user asks for a link, always provide the link from the data above, formatted as a clickable URL. Never refuse to provide a link if it is present in the data. If a user asks for a link, always respond with the link from the list above, and do not say you are unable to provide links. Based only on the list above, answer the user's question. If a book has a file link, include it in your answer. Use bullet points for lists. Be concise, clear, and user-friendly. Do not invent or guess any books not in the list.`
      const aiResponse = await callGemini([{ role: "user", parts: [{ text: contextPrompt }] }], apiKey)
      return NextResponse.json({ response: aiResponse })
    }
    if (about === 'videos') {
      const { data: videos, error } = await supabase
        .from("videos")
        .select("title, course_id, link")
        .limit(100)
      if (error) throw error
      if (!videos || videos.length === 0) {
        return NextResponse.json({ response: "I couldn't find any videos in the library." })
      }
      // Optionally fetch course names for videos
      const { data: courses } = await supabase.from("courses").select("id, name")
      const courseMap = (courses || []).reduce((acc: any, c: any) => { acc[c.id] = c.name; return acc }, {})
      const videoList = videos.map(v => `${v.title}${v.course_id && courseMap[v.course_id] ? ` (${courseMap[v.course_id]})` : ""}${v.link ? ` [Watch Video](${v.link})` : ""}`).join("\n")
      const contextPrompt = `Here is a list of videos in the library (with links if available):\n${videoList}\n\nUser question: "${message}"\nThe links provided are from the official Lincoln E-Library database and are safe to share with the user. If the user asks for a link, always provide the link from the data above, formatted as a clickable URL. Never refuse to provide a link if it is present in the data. If a user asks for a link, always respond with the link from the list above, and do not say you are unable to provide links. Based only on the list above, answer the user's question. If a video has a link, include it in your answer. Use bullet points for lists. Be concise, clear, and user-friendly. Do not invent or guess any videos not in the list.`
      const aiResponse = await callGemini([{ role: "user", parts: [{ text: contextPrompt }] }], apiKey)
      return NextResponse.json({ response: aiResponse })
    }

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
        // Always use case-insensitive search and robustly remove trailing semicolons
        const safeSql = sql.trim().replace(/;+ *$/, "")
        const { data, error } = await supabase.rpc("run_sql", { sql: safeSql })
        if (error) throw error
        dbResult = data
      } catch (err: any) {
        console.error("DB error:", err)
        return NextResponse.json({ error: "Database error: " + (err.message || err) }, { status: 500 })
      }

      // If the result is books
      if (Array.isArray(dbResult) && dbResult.length > 0 && dbResult[0].title) {
        // Books
        const bookList = dbResult.map(
          (b: any) => `${b.title}${b.author ? ` by ${b.author}` : ""}${b.genre ? ` (${b.genre})` : ""}`
        ).join("\n")
        return NextResponse.json({
          response: `Here are the books I found:\n\n${bookList}`,
          sql,
          dbResult
        })
      }
      // If the result is videos
      if (Array.isArray(dbResult) && dbResult.length > 0 && dbResult[0].title && dbResult[0].link) {
        // Videos
        const videoList = dbResult.map(
          (v: any) => `${v.title}${v.course_name ? ` (${v.course_name})` : ""}`
        ).join("\n")
        return NextResponse.json({
          response: `Here are the videos I found:\n\n${videoList}`,
          sql,
          dbResult
        })
      }
      // If no results
      if (Array.isArray(dbResult) && dbResult.length === 0) {
        return NextResponse.json({
          response: `I couldn't find any results for your query.`,
          sql,
          dbResult
        })
      }
      // Otherwise, fallback to Gemini summary
      const summaryMessages = [
        { role: "user", parts: [{ text: `The user asked: "${message}". Here is the database result: ${JSON.stringify(dbResult)}. Only use the information in the database result below. Do not invent or guess any book or video titles, authors, or genres. If the result contains books, list only the book titles, authors, and genres from the database result. If the result contains videos, list only the video titles and course names from the database result. If there are no results, say so. Do not mention 'database query' or technical details—just answer their question naturally.` }] },
      ]
      const summary = await callGemini(summaryMessages, apiKey)
      return NextResponse.json({ response: summary, sql, dbResult })
    }

    // 5. If no SQL, just return the normal Gemini response (but never show SQL to user)
    // If the response looks like a SQL query, hide it and show a fallback message
    if (/^SELECT[\s\S]+FROM[\s\S]+;/i.test(aiResponse.trim())) {
      return NextResponse.json({ response: "Sorry, I couldn't find any results for your query." })
    }
    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("AI Tutor API Error:", error)
    return NextResponse.json({ error: "Failed to process request: " + (error?.message || error) }, { status: 500 })
  }
}
