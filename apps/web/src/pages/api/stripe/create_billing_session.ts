import type { NextApiRequest, NextApiResponse } from "next";

import { createNextApiContext } from "@kan/api/trpc";
import { createStripeClient } from "@kan/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const stripe = createStripeClient();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user } = await createNextApiContext(req);

    if (!user?.stripeCustomerId) {
      return res.status(404).json({ error: "No billing account found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error creating portal session" });
  }
}
