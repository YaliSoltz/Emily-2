'use client'

interface UnsavedDialogProps {
  onStay: () => void
  onLeave: () => void
}

export default function UnsavedDialog({ onStay, onLeave }: UnsavedDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-[#5C3D2E]/10 p-8 max-w-sm w-full mx-4 shadow-xl">
        <h2 className="text-base text-[#3D2519] mb-3 font-medium">שינויים שלא נשמרו</h2>
        <p className="text-sm text-[#5C3D2E]/70 mb-6 leading-relaxed">
          יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לעזוב?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onStay}
            className="px-5 py-2 text-xs tracking-widest uppercase text-[#5C3D2E] border border-[#5C3D2E]/30 hover:border-[#5C3D2E] transition-colors"
          >
            הישאר
          </button>
          <button
            onClick={onLeave}
            className="px-5 py-2 text-xs tracking-widest uppercase bg-[#5C3D2E] text-[#F5F0E8] hover:bg-[#3D2519] transition-colors"
          >
            עזוב
          </button>
        </div>
      </div>
    </div>
  )
}
