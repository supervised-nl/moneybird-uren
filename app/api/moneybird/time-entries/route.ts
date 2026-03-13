import { NextRequest, NextResponse } from "next/server";
import {
  createTimeEntry,
  getTimeEntries,
} from "@/lib/moneybird";

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get("filter") || undefined;
    const entries = await getTimeEntries(filter);
    return NextResponse.json(entries);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = await createTimeEntry(body);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
