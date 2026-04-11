import { loadStripe } from "@stripe/stripe-js";
import env from "@/config/env";

let stripePromise = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(env.stripePublishableKey);
  }
  return stripePromise;
}
