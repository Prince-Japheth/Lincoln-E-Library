import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "@/lib/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Log an audit event to the audit_logs table.
 * @param userId - The user performing the action
 * @param action - The action performed (e.g., 'delete_book', 'update_user')
 * @param tableName - The table affected
 * @param recordId - The affected record's ID
 * @param oldValues - Previous values (optional)
 * @param newValues - New values (optional)
 */
export async function logAuditEvent({ userId, action, tableName, recordId, oldValues, newValues, ipAddress, userAgent }: {
  userId: string,
  action: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string,
}) {
  const supabase = createClient()
  const { error, data } = await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues ? JSON.stringify(oldValues) : null,
    new_values: newValues ? JSON.stringify(newValues) : null,
    ip_address: ipAddress || null,
    user_agent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
  });
  if (error) {
    console.error("[AUDIT] logAuditEvent error:", error);
    throw error;
  }
  return data;
}

/**
 * Check and increment rate limit for a user and endpoint.
 * Returns true if under limit, false if limit exceeded.
 * @param userId - The user ID
 * @param endpoint - The endpoint/action name
 * @param limit - Max allowed requests per window
 * @param windowMinutes - Window size in minutes
 */
export async function checkRateLimit({ userId, endpoint, limit = 10, windowMinutes = 1 }: {
  userId: string,
  endpoint: string,
  limit?: number,
  windowMinutes?: number,
}): Promise<boolean> {
  const supabase = createClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)
  // Try to find an existing rate limit row
  const { data, error } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: false })
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())
    .lte("window_end", now.toISOString())
    .limit(1)

  if (error) return true // fail open

  if (data && data.length > 0) {
    const row = data[0]
    if (row.request_count >= limit) {
      return false
    } else {
      await supabase.from("rate_limits").update({ request_count: row.request_count + 1, updated_at: now.toISOString() }).eq("id", row.id)
      return true
    }
  } else {
    // Insert new window
    await supabase.from("rate_limits").insert({
      user_id: userId,
      endpoint,
      request_count: 1,
      window_start: now.toISOString(),
      window_end: new Date(now.getTime() + windowMinutes * 60 * 1000).toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    return true
  }
}
