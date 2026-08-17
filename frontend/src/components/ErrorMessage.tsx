import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <div className="error-message__icon">⚠️</div>
      <p className="error-message__text">{message}</p>
      {onRetry && (
        <button className="error-message__retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
