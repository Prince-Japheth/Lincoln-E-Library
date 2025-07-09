import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Users, Brain, Lock, Globe } from "lucide-react"

interface DashboardStatsProps {
  totalBooks: number
  publicBooks: number
  privateBooks: number
  totalRequests: number
  userRole: string
}

export default function DashboardStats({ totalBooks, publicBooks, privateBooks, totalRequests, userRole }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glassmorphism-card border-0 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
          <BookOpen className="h-5 w-5 text-[#fe0002]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{totalBooks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {publicBooks} public, {privateBooks} private
          </p>
        </CardContent>
      </Card>

      <Card className="glassmorphism-card border-0 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Public Books</CardTitle>
          <Globe className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{publicBooks}</div>
          <p className="text-xs text-muted-foreground mt-1">Available to everyone</p>
        </CardContent>
      </Card>

      <Card className="glassmorphism-card border-0 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Private Books</CardTitle>
          <Lock className="h-5 w-5 text-[#ff4444]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{privateBooks}</div>
          <p className="text-xs text-muted-foreground mt-1">Student access only</p>
        </CardContent>
      </Card>

      <Card className="glassmorphism-card border-0 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Your Requests</CardTitle>
          <FileText className="h-5 w-5 text-[#ff6b6b]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{totalRequests}</div>
          <p className="text-xs text-muted-foreground mt-1">Book requests made</p>
        </CardContent>
      </Card>
    </div>
  )
}
