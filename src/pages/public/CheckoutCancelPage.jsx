import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { XCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/common/Button";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal font-display">
            Payment cancelled
          </h1>
          <p className="text-charcoal-subtle text-sm md:text-base">
            Your payment was not processed. No charges have been made to your
            account. You can try again anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={ROUTES.CHECKOUT}>
            <Button size="md">Try Again</Button>
          </Link>
          <Link to={ROUTES.EXPERIENCES}>
            <Button variant="outline" size="md">
              Explore Experiences
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
