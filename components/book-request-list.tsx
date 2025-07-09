import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BookRequestList({ bookRequests, setBookRequests, userId }: { bookRequests: any[], setBookRequests: (reqs: any[]) => void, userId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setLoadingId(id)
    setError("")
    try {
      const { error } = await supabase.from("book_requests").delete().eq("id", id).eq("user_id", userId)
      if (error) {
        setError(error.message)
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        setBookRequests(bookRequests.filter((req) => req.id !== id))
        toast({ title: "Book request deleted", description: "Your book request was deleted successfully." })
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setLoadingId(null)
      setConfirmId(null)
    }
  }

  if (!bookRequests || bookRequests.length === 0) return null

  return (
    <div className="mb-8">
      <Card className="bg-white dark:bg-card text-card-foreground border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Your Book Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {bookRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted dark:bg-secondary text-foreground border border-border border-l-4 border-l-[#fe0002]"
              >
                <div>
                  <div className="font-medium">{req.title}</div>
                  <div className="text-sm text-muted-foreground">{req.author}</div>
                  <div className="text-xs text-muted-foreground">{req.status}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmId(req.id)}
                  disabled={loadingId === req.id}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {loadingId === req.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!confirmId} onOpenChange={open => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book Request?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this book request? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)} disabled={loadingId !== null}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmId && handleDelete(confirmId)} disabled={loadingId !== null}>
              {loadingId === confirmId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 