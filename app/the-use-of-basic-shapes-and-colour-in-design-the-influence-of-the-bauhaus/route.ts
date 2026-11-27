// Retired WordPress content. Return Gone instead of redirecting unrelated URLs to the homepage.
export function GET() {
  return new Response("This article is no longer available.", {
    status: 410,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
