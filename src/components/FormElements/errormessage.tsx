interface ErrorMessageProps {
    message?: string;
  }
  export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null;
    return <p className="mt-0.5 text-sm text-red-500 md:text-xs">{message} *</p>;
  }
  