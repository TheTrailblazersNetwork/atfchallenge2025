import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch patients ordered by queue number
    const allPatients = await db.query(`
      SELECT 
        queue_number,
        name,
        gender,
        age,
        medical_condition,
        visit_status,
        estimated_wait_time
      FROM opd_queue
      ORDER BY queue_number ASC
      LIMIT 10
    `);

    // Organize patients by their status
    const currentPatient = allPatients.rows.find(p => p.visit_status === 'In Progress');
    const nextPatient = allPatients.rows.find(p => p.visit_status === 'Waiting');
    const upcomingPatients = allPatients.rows.filter(
      p => p.visit_status === 'Waiting' && p !== nextPatient
    );

    return NextResponse.json({
      currentPatient,
      nextPatient,
      upcomingPatients
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient queue' },
      { status: 500 }
    );
  }
}