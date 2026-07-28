import { NextResponse } from "next/server"
import { getMdxTopics } from "@/lib/mdx-auto-register"

export async function GET() {
  const topics = getMdxTopics()
  const keys = Object.keys(topics)
  return NextResponse.json({
    count: keys.length,
    keys: keys.slice(0, 20),
  })
}
