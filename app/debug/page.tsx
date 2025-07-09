import { createClient } from "@/lib/supabase/server"

export default async function DebugPage() {
  const supabase = await createClient()

  // Test different queries
  const { data: allBooks, error: allBooksError } = await supabase
    .from("books")
    .select("*")
    .limit(5)

  const { data: publicBooksBoolean, error: publicBooksBooleanError } = await supabase
    .from("books")
    .select("*")
    .eq("is_public", true)
    .limit(5)

  const { data: publicBooksString, error: publicBooksStringError } = await supabase
    .from("books")
    .select("*")
    .eq("is_public", "true")
    .limit(5)

  const { data: publicBooksOr, error: publicBooksOrError } = await supabase
    .from("books")
    .select("*")
    .or('is_public.eq.true,is_public.eq."true"')
    .limit(5)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Database Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* All Books */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">All Books (First 5)</h2>
            {allBooksError && <p className="text-red-500">Error: {allBooksError.message}</p>}
            <div className="space-y-2">
              {allBooks?.map((book) => (
                <div key={book.id} className="border p-2 rounded">
                  <p><strong>{book.title}</strong></p>
                  <p>is_public: {String(book.is_public)} (type: {typeof book.is_public})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Public Books with Boolean */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Public Books (Boolean Query)</h2>
            {publicBooksBooleanError && <p className="text-red-500">Error: {publicBooksBooleanError.message}</p>}
            <p className="text-sm text-gray-600 mb-2">Query: .eq("is_public", true)</p>
            <p className="font-semibold">Count: {publicBooksBoolean?.length || 0}</p>
            <div className="space-y-2">
              {publicBooksBoolean?.map((book) => (
                <div key={book.id} className="border p-2 rounded">
                  <p><strong>{book.title}</strong></p>
                  <p>is_public: {String(book.is_public)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Public Books with String */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Public Books (String Query)</h2>
            {publicBooksStringError && <p className="text-red-500">Error: {publicBooksStringError.message}</p>}
            <p className="text-sm text-gray-600 mb-2">Query: .eq("is_public", "true")</p>
            <p className="font-semibold">Count: {publicBooksString?.length || 0}</p>
            <div className="space-y-2">
              {publicBooksString?.map((book) => (
                <div key={book.id} className="border p-2 rounded">
                  <p><strong>{book.title}</strong></p>
                  <p>is_public: {String(book.is_public)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Public Books with OR Query */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Public Books (OR Query)</h2>
            {publicBooksOrError && <p className="text-red-500">Error: {publicBooksOrError.message}</p>}
            <p className="text-sm text-gray-600 mb-2">Query: .or('is_public.eq.true,is_public.eq."true"')</p>
            <p className="font-semibold">Count: {publicBooksOr?.length || 0}</p>
            <div className="space-y-2">
              {publicBooksOr?.map((book) => (
                <div key={book.id} className="border p-2 rounded">
                  <p><strong>{book.title}</strong></p>
                  <p>is_public: {String(book.is_public)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Run the <code>scripts/fix-boolean-values.sql</code> script in your Supabase SQL editor</li>
            <li>This will convert string boolean values to proper boolean values</li>
            <li>After running the script, refresh this page to see the results</li>
            <li>The home page should then show your public books correctly</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 