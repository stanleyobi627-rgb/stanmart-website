import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | StanMart";
  }, []);

  return (
    <div className="page">
      <div className="empty-state nf">
        <h1>404</h1>
        <h3>This page could not be found</h3>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
