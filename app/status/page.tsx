import { createClient } from "@/lib/supabase/server"

export default async function StatusPage() {
  const supabase = await createClient()

  // Test basic connectivity
  const { data: testData, error: testError } = await supabase
    .from("books")
    .select("count", { count: "exact", head: true })

  // Test public books query
  const { data: publicBooks, error: publicBooksError } = await supabase
    .from("books")
    .select("*")
    .or('is_public.eq.true,is_public.eq."true"')
    .limit(3)

  // Test courses query
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("*")
    .limit(3)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Database Status</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
            {testError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {testError.message}</p>
                <p><strong>Code:</strong> {testError.code}</p>
              </div>
            ) : (
              <div className="text-green-500">
                <p><strong>✅ Connected successfully</strong></p>
                <p>Total books: {testData || 'Unknown'}</p>
              </div>
            )}
          </div>

          {/* Public Books Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Public Books Test</h2>
            {publicBooksError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {publicBooksError.message}</p>
                <p><strong>Code:</strong> {publicBooksError.code}</p>
              </div>
            ) : (
              <div className="text-green-500">
                <p><strong>✅ Public books query successful</strong></p>
                <p>Found: {publicBooks?.length || 0} public books</p>
                {publicBooks?.map((book, index) => (
                  <div key={book.id} className="text-sm mt-2 p-2 bg-gray-100 rounded">
                    <p><strong>{index + 1}.</strong> {book.title}</p>
                    <p>is_public: {String(book.is_public)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Courses Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Courses Test</h2>
            {coursesError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {coursesError.message}</p>
                <p><strong>Code:</strong> {coursesError.code}</p>
              </div>
            ) : (
              <div className="text-green-500">
                <p><strong>✅ Courses query successful</strong></p>
                <p>Found: {courses?.length || 0} courses</p>
                {courses?.map((course, index) => (
                  <div key={course.id} className="text-sm mt-2 p-2 bg-gray-100 rounded">
                    <p><strong>{index + 1}.</strong> {course.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-yellow-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Fix</h2>
            <p className="mb-4">If you're seeing RLS errors, run this in your Supabase SQL Editor:</p>
            <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm">
              <p>-- Temporary fix to disable RLS on books table</p>
              <p>ALTER TABLE books DISABLE ROW LEVEL SECURITY;</p>
            </div>
            <p className="mt-4 text-sm">This will allow the site to work while we fix the RLS policies.</p>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Run the temporary fix SQL to disable RLS on books table</li>
            <li>Check if the home page now shows public books</li>
            <li>If it works, run the RLS fix script to properly secure the database</li>
            <li>Test admin login and other features</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 