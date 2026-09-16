interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <div className={`brand ${inverse ? "brand--inverse" : ""}`} aria-label="Vera home">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 44 44" role="img">
          <path d="M8 10.5 19.4 32a3 3 0 0 0 5.3 0L36 10.5" />
          <path d="M13.5 10.5 22 26.2l8.5-15.7" />
          <circle cx="22" cy="34" r="2.5" />
        </svg>
      </span>
      {!compact && (
        <span className="brand__type">
          <strong>vera</strong>
          <small>Benefits, made human</small>
        </span>
      )}
    </div>
  );
}
