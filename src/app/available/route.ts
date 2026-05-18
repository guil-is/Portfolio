import { NextResponse, type NextRequest } from "next/server";

const CAL_URL = "https://cal.com/guil-is";
const PAGE_URL = "https://guil.is/available";
const OG_IMAGE = "https://guil.is/available_og.jpg";
const TITLE = "Book a call with Guil";
const DESCRIPTION = "Find a time that works for you.";

// Bots/crawlers get HTML with OG tags so link previews work.
// Everyone else gets a 307 straight to Cal.com.
const BOT_UA =
  /bot|crawl|spider|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|twitter|pinterest|embedly|preview|fetch|applebot/i;

export function GET(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!BOT_UA.test(ua)) {
    return NextResponse.redirect(CAL_URL, 307);
  }
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<meta property="og:type" content="website">
<meta property="og:url" content="${PAGE_URL}">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${TITLE}">
<meta name="twitter:description" content="${DESCRIPTION}">
<meta name="twitter:image" content="${OG_IMAGE}">
<meta name="twitter:creator" content="@guil_is">
</head>
<body><p><a href="${CAL_URL}">Continue to Cal.com →</a></p></body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
