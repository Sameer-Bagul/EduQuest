import * as React from "react"
import DatePicker from "react-datepicker"
import { cn } from "@/lib/utils"

export type DatePickerProps = React.ComponentProps<typeof DatePicker>

function Calendar(props: DatePickerProps) {
  return <DatePicker {...props} />
}
Calendar.displayName = "Calendar"

export { Calendar }
