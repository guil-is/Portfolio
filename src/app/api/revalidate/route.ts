import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

type WebhookPayload = {
  _type?: string;
  slug?: { current?: string };
};

export async function POST(req: NextRequest) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  const provided = req.nextUrl.searchParams.get("secret");
  if (!expected || provided !== expected) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const paths = pathsForType(body);
  paths.forEach((p) => revalidatePath(p));

  return NextResponse.json({
    ok: true,
    type: body._type ?? null,
    revalidated: paths,
  });
}

function pathsForType({ _type, slug }: WebhookPayload): string[] {
  switch (_type) {
    case "siteSettings":
    case "testimonial":
      return ["/"];
    case "client":
      return ["/clients", "/"];
    case "person":
      return ["/people"];
    case "project": {
      const paths: string[] = ["/"];
      if (slug?.current) paths.push(`/projects/${slug.current}`);
      return paths;
    }
    default:
      return [];
  }
}
