import { useId } from "react"
import { Check } from "lucide-react"

export default function Checkbox({ label, checked, onChange }) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer select-none text-slate-200"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer hidden"
        aria-checked={checked}
      />
      <div className="h-5 w-5 rounded-md border-2 border-slate-500 flex items-center justify-center transition-colors peer-checked:bg-slate-600 peer-checked:border-slate-400">
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </div>
      <span className="text-sm">{label}</span>
    </label>
  )
}
