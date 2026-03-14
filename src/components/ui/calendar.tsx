import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export function Calendar() {
  return <DayPicker mode="single" className="rounded-md border" />;
}
