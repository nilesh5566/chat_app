import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email } = await req.json();

    const user = await User.findOne({ email }).select("_id");
    console.log("USER EXIST CHECK:", user);

    if (user) {
      return NextResponse.json(
        { exists: true, message: "User already exists" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { exists: false, message: "User does not exist" },
      { status: 404 }
    );
  } catch (error) {
    console.error("USER EXIST CHECK ERROR:", error);
    return NextResponse.json(
      { message: "Error checking user existence" },
      { status: 500 }
    );
  }
}
