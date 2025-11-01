import { Link } from "react-router-dom";
import RootDiv from "@/components/rootdiv";
import Button from "@/components/ui/button";
import { Home } from "lucide-react";

function Notfound() {
  return (
    <RootDiv>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-9xl font-bold text-sparkle-primary">404</h1>
        <p className="text-2xl font-medium text-sparkle-text mt-4">
          Page Not Found
        </p>
        <p className="text-sparkle-text-secondary mt-2 mb-6">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home size={18} />
            Go to Homepage
          </Button>
        </Link>
      </div>
    </RootDiv>
  );
}

export default Notfound;
