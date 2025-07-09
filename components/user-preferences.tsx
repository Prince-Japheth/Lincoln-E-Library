"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface UserPreferencesProps {
  userId: string
}

export default function UserPreferences({ userId }: UserPreferencesProps) {
  const [theme, setTheme] = useState("system")
  const [fontSize, setFontSize] = useState("medium")
  const [readingMode, setReadingMode] = useState("scroll")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single()
      if (data) {
        setTheme(data.theme || "system")
        setFontSize(data.font_size || "medium")
        setReadingMode(data.reading_mode || "scroll")
        setNotificationsEnabled(data.notifications_enabled ?? true)
      }
    } catch (err) {
      setError("Failed to load preferences")
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          theme,
          font_size: fontSize,
          reading_mode: readingMode,
          notifications_enabled: notificationsEnabled
        })
      if (error) {
        setError("Failed to save preferences")
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    } catch (err) {
      setError("Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-xl mx-auto bg-white/80 dark:bg-gray-900/80 border-0">
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="block font-medium">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Font Size</label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Reading Mode</label>
          <Select value={readingMode} onValueChange={setReadingMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scroll">Scroll</SelectItem>
              <SelectItem value="paged">Paged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
          <label htmlFor="notifications">Enable notifications</label>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Preferences saved!</div>}
        <Button onClick={savePreferences} disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
} 