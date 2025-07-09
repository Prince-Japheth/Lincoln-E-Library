"use client"
import { useState } from "react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState("")
  const [type, setType] = useState("feedback")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess("")
    setError("")
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, rating, message, type })
    })
    setLoading(false)
    if (res.ok) {
      setSuccess("Thank you for your feedback! We appreciate your input.")
      setName("")
      setEmail("")
      setRating(5)
      setMessage("")
      setType("feedback")
    } else {
      setError("There was an error sending your message. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Contact & Feedback</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Type</label>
            <select className="w-full border rounded px-3 py-2" value={type} onChange={e => setType(e.target.value)}>
              <option value="feedback">Feedback / Rating</option>
              <option value="benefit">How the e-library benefited you</option>
              <option value="request">Request a Book</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Rating</label>
            <select className="w-full border rounded px-3 py-2" value={rating} onChange={e => setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Message</label>
            <textarea className="w-full border rounded px-3 py-2" rows={4} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-[#fe0002] text-white py-2 rounded font-semibold" disabled={loading}>
            {loading ? "Sending..." : "Send Feedback"}
          </button>
          {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  )
} 