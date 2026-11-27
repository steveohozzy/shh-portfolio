// This is not a real SHH Design page. Tell search engines it has been
// permanently removed rather than leaving it as an unexplained 404.
export function GET() {
  return new Response("This page is no longer available.", {
    status: 410,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
