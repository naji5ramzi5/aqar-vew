import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
export async function GET(_r: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { rows: props } = await db.execute({ sql: 'SELECT * FROM Property WHERE id = ?', args: [id] })
    if (!props.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const prop = props[0]
    const { rows: apartments } = await db.execute({ sql: 'SELECT * FROM Apartment WHERE "propertyId" = ? ORDER BY number ASC', args: [id] })
    const aptsWithStages = []
    for (const apt of apartments) {
      const { rows: stages } = await db.execute({ sql: 'SELECT * FROM Stage WHERE "apartmentId" = ? ORDER BY "stageOrder" ASC', args: [apt.id] })
      aptsWithStages.push({ ...apt, stages })
    }
    return NextResponse.json({ ...prop, apartments: aptsWithStages })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}