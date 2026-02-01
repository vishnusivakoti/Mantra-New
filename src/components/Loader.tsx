import './Loader.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function Loader({ size = 'medium', message }: LoaderProps) {
  return (
    <div className="loader-container">
      <div className={`loader ${size}`}>
        <div className="spinner"></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
}