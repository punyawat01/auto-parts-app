import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const parts = await prisma.part.findMany({
            include: {
                category: true,
                alternativeNumbers: true,
                compatibilities: {
                    include: {
                        vehicle: {
                            include: {
                                model: {
                                    include: { brand: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { partNumber: 'asc' }
        });

        const rows = parts.map(p => {
            const alts = p.alternativeNumbers.map(a => `${a.number}${a.note ? ` (${a.note})` : ''}`).join(', ');
            const comps = p.compatibilities.map(c => {
                let v = c.vehicle;
                return `${v.model.brand.name} ${v.model.name} ${v.year}${c.notes ? ` [${c.notes}]` : ''}`;
            }).join(', ');

            return {
                'รหัสอะไหล่': p.partNumber,
                'ชื่ออะไหล่': p.name,
                'ยี่ห้ออะไหล่': p.partBrand || '',
                'หมวดหมู่': p.category?.name || '',
                'กว้าง (A)': p.width || '',
                'ยาว (B)': p.length || '',
                'สูง (C)': p.height || '',
                'รูใน (ID)': p.innerDiameter || '',
                'รูนอก (OD)': p.outerDiameter || '',
                'ราคา': p.price || '',
                'รายละเอียด': p.description || '',
                'รหัสเทียบ/OEM': alts,
                'รุ่นรถที่รองรับ': comps
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PartsList');

        // Create buffer
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="autoparts_export.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });

    } catch (error) {
        console.error('API Export Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to export' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
