import { useState } from "react";
import { getImageUrl, getModernImageUrl } from "../utils/image";

export default function OptimizedImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  onError,
  sizes,
  ...props
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const imageSrc = getImageUrl(src);
  const fallbackSrc = getImageUrl("/placeholder.jpg");
  const failed = failedSrc === imageSrc;
  const effectiveSrc = failed ? fallbackSrc : imageSrc;
  const webpSrc = getModernImageUrl(effectiveSrc);

  return (
    <picture className="contents">
      {webpSrc && <source srcSet={webpSrc} type="image/webp" sizes={sizes} />}
      <img
        src={effectiveSrc}
        alt={alt || ""}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        onError={(event) => {
          if (!failed) setFailedSrc(imageSrc);
          if (onError) onError(event);
        }}
        sizes={sizes}
        {...props}
      />
    </picture>
  );
}
