import { NextResponse } from "next/server";

// Temporary safe handlers: avoid direct Prisma usage until we diagnose production error.
let inMemoryValue = "true";

export async function GET() {
  return NextResponse.json({ value: inMemoryValue });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const value = String(body?.value ?? "false");
    inMemoryValue = value;
    return NextResponse.json({ value });
  } catch {
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
