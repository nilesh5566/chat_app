import { NextResponse } from "next/server";
import prisma from "@/lib/mongodb";

// GET - Fetch online users
export async function GET() {
  try {
    const onlineUsers = await prisma.onlineUser.findMany({
      where: { isOnline: true },
    });

    return NextResponse.json(onlineUsers);
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json(
      { error: "Failed to fetch online users" },
      { status: 500 }
    );
  }
}