
import axios from "axios";
import { Response, Request } from "express";

// PayPal API config
const PAYPAL_API_BASE = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// Default plans for subscription
export const SUBSCRIPTION_PLANS = {
  essential: {
    id: "P-ESSENTIAL",
    price: 14.99,
    name: "Essential Plan"
  },
  pro: {
    id: "P-PRO",
    price: 29.99,
    name: "Pro Plan"
  },
  business: {
    id: "P-BUSINESS",
    price: 79.99,
    name: "Business Plan"
  }
};

// Get PayPal credentials
function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // For development, use fallback credentials if not set
  if (!clientId || !clientSecret) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Using development PayPal credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET for production.");
      // Using a placeholder for development
      return {
        clientId: "AYxV9PCQgfG_HYZxfEqDgDwQ3vAFH4PWwGzJjM_k7fvHbhUeEs-mBiW13vPOSfcImfY6rtgZmTBTmHGj",
        clientSecret: "development_secret"
      };
    }
    throw new Error("Missing PayPal credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.");
  }

  return { clientId, clientSecret };
}

// Load PayPal default settings
export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    const { clientId } = getPayPalCredentials();
    res.json({
      clientId,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error("Error loading PayPal defaults:", error);
    res.status(500).json({ error: "Failed to load PayPal configuration" });
  }
}

// Get PayPal access token
async function getPayPalAccessToken() {
  try {
    const { clientId, clientSecret } = getPayPalCredentials();
    
    const response = await axios({
      method: "post",
      url: `${PAYPAL_API_BASE}/v1/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
      data: "grant_type=client_credentials",
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw new Error("Failed to get PayPal access token");
  }
}

// Create PayPal order
export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { planId } = req.body;
    const plan = Object.values(SUBSCRIPTION_PLANS).find(
      (plan) => plan.id === planId
    );

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    const accessToken = await getPayPalAccessToken();
    
    const response = await axios({
      method: "post",
      url: `${PAYPAL_API_BASE}/v2/checkout/orders`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: plan.price.toString(),
            },
            description: `AutoContentFlow - ${plan.name}`,
          },
        ],
        application_context: {
          brand_name: "AutoContentFlow",
          shipping_preference: "NO_SHIPPING",
        },
      },
    });

    return res.json({ orderID: response.data.id });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
}

// Capture PayPal order
export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { orderID } = req.params;
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios({
      method: "post",
      url: `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.status === "COMPLETED") {
      // In a real implementation, you would update the user's subscription in your database here
      // For now, we'll just return the capture details
      return res.json({ 
        status: response.data.status,
        details: response.data
      });
    } else {
      return res.status(400).json({ error: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return res.status(500).json({ error: "Failed to capture order" });
  }
}
