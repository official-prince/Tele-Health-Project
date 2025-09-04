import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{value || "Select..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          {React.Children.map(children, child =>
            React.cloneElement(child, { onValueChange, setOpen })
          )}
        </div>
      )}
    </div>
  )
}

const SelectContent = ({ children }) => <div className="p-1">{children}</div>

const SelectItem = ({ value, children, onValueChange, setOpen }) => (
  <button
    onClick={() => {
      onValueChange(value)
      setOpen(false)
    }}
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
  >
    {children}
  </button>
)

const SelectTrigger = ({ children }) => children
const SelectValue = ({ children }) => children

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }