"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { checkRateLimit, logAuditEvent } from "@/lib/utils"

interface BookRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onRequestSubmitted?: () => void
}

export default function BookRequestDialog({ open, onOpenChange, userId, onRequestSubmitted }: BookRequestDialogProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Rate limit check
    const allowed = await checkRateLimit({ userId, endpoint: "book_request", limit: 5, windowMinutes: 1 })
    if (!allowed) {
      setError("Rate limit exceeded. Please try again later.")
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("auth.uid():", user?.id, "userId prop:", userId);
      const { error } = await supabase.from("book_requests").insert([
        {
          user_id: user?.id,
          title,
          author,
          description,
          status: "pending",
        },
      ])

      if (error) {
        setError(error.message)
      } else {
        await logAuditEvent({
          userId,
          action: "create_book_request",
          tableName: "book_requests",
          newValues: { title, author, description },
        })
        setSuccess(true)
        setTitle("")
        setAuthor("")
        setDescription("")
        if (typeof onRequestSubmitted === "function") onRequestSubmitted();
        setTimeout(() => {
          setSuccess(false)
          onOpenChange(false)
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setAuthor("")
    setDescription("")
    setError("")
    setSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Book</DialogTitle>
          <DialogDescription>
            Can't find the book you're looking for? Request it and we'll try to add it to our collection.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="text-green-600 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Request Submitted!</h3>
            <p className="text-foreground">We'll review your request and get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-invalid={!title && error ? "true" : "false"}
                  aria-describedby={error ? "title-error" : undefined}
                  placeholder="Enter the book title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  aria-invalid={!author && error ? "true" : "false"}
                  aria-describedby={error ? "author-error" : undefined}
                  placeholder="Enter the author's name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional information about the book (edition, ISBN, etc.)"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#fe0002] hover:bg-[#fe0002]/90" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
