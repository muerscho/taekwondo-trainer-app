import { C, RADII } from '@/design/tokens';

export function DirtyFlagSaveButton({ isDirty, onSave, label = 'Speichern', disabled }: { isDirty: boolean; onSave: () => void; label?: string; disabled?: boolean }) {
  if (!isDirty) return null;
  return (
    <button onClick={onSave} disabled={disabled} style={{
      position: 'sticky', bottom: 12, marginTop: 16,
      width: '100%', padding: '12px 18px',
      background: C.primary, color: '#fff', border: 'none',
      borderRadius: RADII.md, fontWeight: 700, fontSize: 14,
      boxShadow: '0 6px 18px rgba(30,58,95,0.35)'
    }}>{label}</button>
  );
}
