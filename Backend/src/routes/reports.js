import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Your Prisma client import

export async function GET() {
  try {
    const reports = await prisma.reports.findMany();
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Error fetching reports", error: error.message },
      { status: 500 }
    );
  }
}
