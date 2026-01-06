interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p
      className={`mt-1 text-sm text-red-500 transition-opacity duration-200 md:text-xs ${
        message ? "opacity-100" : "select-none opacity-0"
      }`}
    >
      {" "}
      {message ? `${message} *` : <span className="invisible">&nbsp;</span>}
    </p>
  );
}
