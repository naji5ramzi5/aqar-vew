import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
export async function GET() {
  try {
    const { rows: properties } = await db.execute('SELECT * FROM Property ORDER BY "createdAt" DESC')
    const result = []
    for (const prop of properties) {
      const { rows: apartments } = await db.execute({ sql: 'SELECT * FROM Apartment WHERE "propertyId" = ? ORDER BY number ASC', args: [prop.id] })
      const aptsWithStages = []
      for (const apt of apartments) {
        const { rows: stages } = await db.execute({ sql: 'SELECT * FROM Stage WHERE "apartmentId" = ? ORDER BY "stageOrder" ASC', args: [apt.id] })
        aptsWithStages.push({ ...apt, stages })
      }
      result.push({ ...prop, apartments: aptsWithStages })
    }
    return NextResponse.json(result)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}