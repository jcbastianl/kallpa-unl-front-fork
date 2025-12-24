"use client";

import { ChevronUpIcon } from "@/assets/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";

interface DatePickerTwoProps {
  value?: string;
  onChange?: (newDate: string) => void;
}

const DatePickerTwo: React.FC<DatePickerTwoProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const fp = flatpickr(inputRef.current, {
      mode: "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d", // formato ISO
      defaultDate: value || undefined,
      onChange: (selectedDates) => {
        if (onChange && selectedDates.length > 0) {
          const dateStr = selectedDates[0].toISOString().split("T")[0];
          onChange(dateStr);
        }
      },
    });

    return () => fp.destroy();
  }, [value, onChange]);

  return (
    <div>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        Seleccionar fecha
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          placeholder="yyyy-mm-dd"
        />

        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center text-dark-4 dark:text-dark-6">
          <ChevronUpIcon className="rotate-180" />
        </div>
      </div>
    </div>
  );
};

export default DatePickerTwo;
