export type DimensionField = 'width' | 'length' | 'height' | 'innerDiameter' | 'outerDiameter';

export type DimensionConfig = {
    key: DimensionField;
    label: string;
    shortLabel: string;
};

export function getDimensionConfigs(categoryName?: string | null): DimensionConfig[] {
    const name = categoryName?.toLowerCase() || '';

    // ผ้าเบรก
    if (name.includes('ผ้าเบรก')) {
        return [
            { key: 'width', label: 'กว้าง (Width)', shortLabel: 'กว้าง' },
            { key: 'length', label: 'หนา (Thickness)', shortLabel: 'หนา' },
            { key: 'height', label: 'สูง (Height)', shortLabel: 'สูง' }
        ];
    }
    
    // กรองน้ำมันเครื่อง
    if (name.includes('กรองน้ำมันเครื่อง') || name.includes('กรองโซล่า')) {
        return [
            { key: 'outerDiameter', label: 'รูนอก (OD)', shortLabel: 'OD' },
            { key: 'innerDiameter', label: 'รูใน (ID)', shortLabel: 'ID' },
            { key: 'height', label: 'สูง (Height)', shortLabel: 'สูง' }
        ];
    }

    // กรองอากาศ / กรองแอร์
    if (name.includes('กรองอากาศ') || name.includes('กรองแอร์')) {
        return [
            { key: 'width', label: 'กว้าง (Width)', shortLabel: 'กว้าง' },
            { key: 'length', label: 'ยาว (Length)', shortLabel: 'ยาว' },
            { key: 'height', label: 'สูง (Height)', shortLabel: 'สูง' },
            { key: 'outerDiameter', label: 'รูนอก (OD)', shortLabel: 'OD' },
            { key: 'innerDiameter', label: 'รูใน (ID)', shortLabel: 'ID' }
        ];
    }

    // Default (ลูกหมาก, บูช, โช้คอัพ, อื่นๆ)
    return [
        { key: 'width', label: 'กว้าง (A)', shortLabel: 'A' },
        { key: 'length', label: 'ยาว (B)', shortLabel: 'B' },
        { key: 'height', label: 'สูง (C)', shortLabel: 'C' },
        { key: 'innerDiameter', label: 'รูใน (ID)', shortLabel: 'ID' },
        { key: 'outerDiameter', label: 'รูนอก (OD)', shortLabel: 'OD' }
    ];
}
