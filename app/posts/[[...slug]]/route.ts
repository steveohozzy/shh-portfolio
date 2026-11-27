// The old WordPress blog has been retired. Return Gone instead of
// redirecting unrelated article URLs to the homepage.
export function GET() {
  return new Response("This content is no longer available.", {
    status: 410,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
