import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
export async function GET() {
  try {
    const { rows: properties } = await db.execute('SELECT * FROM Property')
    let totalApartments=0, completedApartments=0, inProgressApartments=0, notStartedApartments=0
    const propStats = []
    for (const prop of properties) {
      const { rows: apartments } = await db.execute({ sql: 'SELECT * FROM Apartment WHERE "propertyId" = ?', args: [prop.id] })
      let pC=0,pI=0,pN=0
      for (const apt of apartments) {
        totalApartments++
        const { rows: stages } = await db.execute({ sql: 'SELECT status FROM Stage WHERE "apartmentId" = ?', args: [apt.id] })
        const allC = stages.length>0 && stages.every(s=>s.status==='COMPLETED')
        const allP = stages.length>0 && stages.every(s=>s.status==='PENDING')
        if(allC){completedApartments++;pC++}else if(allP){notStartedApartments++;pN++}else{inProgressApartments++;pI++}
      }
      propStats.push({id:prop.id,name:prop.name,location:prop.location,totalApartments:apartments.length,completedApartments:pC,inProgressApartments:pI,notStartedApartments:pN})
    }
    return NextResponse.json({totalProperties:properties.length,totalApartments,completedApartments,inProgressApartments,notStartedApartments,properties:propStats})
  } catch(e){console.error(e);return NextResponse.json({error:'Failed'},{status:500})}
}