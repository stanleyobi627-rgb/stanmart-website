interface StarsProps {
  rating: number;
  reviews?: number;
  size?: string;
}

export default function Stars({ rating, reviews, size = "13px" }: StarsProps) {
  const stars = [1, 2, 3, 4, 5].map((step) => {
    if (rating >= step) return "fa-solid fa-star";
    if (rating >= step - 0.5) return "fa-solid fa-star-half-stroke";
    return "fa-regular fa-star";
  });

  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${rating} out of 5 stars`}>
      {stars.map((cls, i) => (
        <i key={i} className={cls} />
      ))}
      {reviews !== undefined && <span className="stars-count">({reviews})</span>}
    </span>
  );
}
