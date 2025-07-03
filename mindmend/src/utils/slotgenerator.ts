// utils/slotGenerator.ts

export function generateTimeSlots(start: string = "09:00", end: string = "17:00", interval: number = 30) {
    const slots: { start_time: string; end_time: string }[] = [];
    let [hour, minute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
  
    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      // Calculate end time
      let endHourCalc = hour;
      let endMinuteCalc = minute + interval;
      while (endMinuteCalc >= 60) {
        endHourCalc += 1;
        endMinuteCalc -= 60;
      }
      const endTime = `${String(endHourCalc).padStart(2, "0")}:${String(endMinuteCalc).padStart(2, "0")}`;
      slots.push({ start_time: startTime, end_time: endTime });
      // Increment start time
      minute += interval;
      while (minute >= 60) {
        hour += 1;
        minute -= 60;
      }
    }
  
    return slots;
  }
  