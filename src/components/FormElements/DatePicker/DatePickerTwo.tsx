"use client";

import { ChevronUpIcon } from "@/assets/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";

interface DatePickerTwoProps {
  value?: string;
  onChange?: (newDate: string) => void;
  label?: string;
  minDate?: string; // Fecha mínima permitida (formato YYYY-MM-DD)
  disabled?: boolean; // Desactivar el selector
}

const DatePickerTwo: React.FC<DatePickerTwoProps> = ({
  value,
  onChange,
  label,
  minDate,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const fp = flatpickr(inputRef.current, {
      mode: "single",
      static: false, // Cambiar a false para que sea popup
      monthSelectorType: "static",
      dateFormat: "Y-m-d", // formato ISO
      defaultDate: value || undefined,
      minDate: minDate || undefined, // Aplicar fecha mínima si se proporciona
      appendTo: document.body, // Append al body para evitar problemas de z-index
      onChange: (selectedDates) => {
        if (onChange && selectedDates.length > 0) {
          const dateStr = selectedDates[0].toISOString().split("T")[0];
          onChange(dateStr);
        }
      },
    });

    return () => fp.destroy();
  }, [value, onChange, minDate]);

  return (
    <div>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          disabled={disabled}
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
