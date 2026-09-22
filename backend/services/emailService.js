import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "onboarding@resend.dev";
const STORE_NAME = "KOREX";

export const sendWelcomeEmail = async ({ email, username }) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Welcome to ${STORE_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            
      
            <div style="background:#4f8ef7;padding:40px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="color:white;font-size:24px;font-weight:900;">K</span>
              </div>
              <h1 style="color:white;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">${STORE_NAME}</h1>
            </div>

           
            <div style="padding:40px;">
              <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Welcome, ${username}! </h2>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Thanks for joining ${STORE_NAME}. Your account is ready — start exploring our premium collection.
              </p>
              <a href="${process.env.FRONTEND_USER_URL || "http://localhost:5174"}/products"
                style="display:inline-block;background:#4f8ef7;color:white;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
                Start Shopping →
              </a>
            </div>

         
            <div style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;">
              <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                © 2026 ${STORE_NAME}. All rights reserved. · Surat, Gujarat, India
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Welcome email error:", error.message);
  }
};

export const sendOrderConfirmationEmail = async ({
  email,
  username,
  order,
}) => {
  try {
    const itemsHtml =
      order.items
        ?.map(
          (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${item.product_name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;text-align:right;font-weight:700;">₹${Number(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `,
        )
        .join("") || "";

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Order Confirmed — ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            
       
            <div style="background:#4f8ef7;padding:40px;text-align:center;">
              <h1 style="color:white;margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:2px;">${STORE_NAME}</h1>
              <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">Order Confirmed ✓</p>
            </div>

         
            <div style="padding:40px;">
              <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 8px;">Hi ${username},</h2>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Your order has been placed successfully. We'll notify you when it ships.
              </p>

          
              <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="color:#6b7280;font-size:13px;font-weight:600;">Order Number</span>
                  <span style="color:#4f8ef7;font-size:13px;font-weight:800;font-family:monospace;">${order.order_number}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="color:#6b7280;font-size:13px;font-weight:600;">Payment</span>
                  <span style="color:#111827;font-size:13px;font-weight:700;">${order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#6b7280;font-size:13px;font-weight:600;">Total</span>
                  <span style="color:#111827;font-size:15px;font-weight:900;">₹${Number(order.final_amount).toLocaleString()}</span>
                </div>
              </div>

        
              <h3 style="color:#111827;font-size:15px;font-weight:800;margin:0 0 12px;">Items Ordered</h3>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Product</th>
                    <th style="text-align:center;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Qty</th>
                    <th style="text-align:right;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>

         
              <div style="margin-top:28px;text-align:center;">
                <a href="${process.env.FRONTEND_USER_URL || "http://localhost:5174"}/track/${order.order_number}"
                  style="display:inline-block;background:#4f8ef7;color:white;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
                  Track Your Order →
                </a>
              </div>
            </div>

          
            <div style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;">
              <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                © 2026 ${STORE_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Order confirmation email error:", error.message);
  }
};

export const sendOrderStatusEmail = async ({
  email,
  username,
  orderNumber,
  status,
  finalAmount,
}) => {
  const statusMessages = {
    confirmed: {
      label: "Order Confirmed",
      message: "Your order has been confirmed and is being prepared.",
      color: "#4f8ef7",
    },
    shipped: {
      label: "Order Shipped",
      message:
        "Your order is on its way! You can track it using the button below.",
      color: "#8b5cf6",
    },
    delivered: {
      label: "Order Delivered",
      message:
        "Your order has been delivered successfully. We hope you love it!",
      color: "#10b981",
    },
    cancelled: {
      label: "Order Cancelled",
      message:
        "Your order has been cancelled. If you have any questions, please contact us.",
      color: "#ef4444",
    },
  };

  const info = statusMessages[status];
  if (!info) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${info.label} — ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

            <div style="background:${info.color};padding:40px;text-align:center;">
              <h1 style="color:white;margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:2px;">${STORE_NAME}</h1>
              <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">${info.label}</p>
            </div>

            <div style="padding:40px;">
              <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 8px;">Hi ${username},</h2>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">${info.message}</p>

              <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="color:#6b7280;font-size:13px;font-weight:600;">Order Number</span>
                  <span style="color:${info.color};font-size:13px;font-weight:800;font-family:monospace;">${orderNumber}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#6b7280;font-size:13px;font-weight:600;">Total</span>
                  <span style="color:#111827;font-size:15px;font-weight:900;">₹${Number(finalAmount).toLocaleString()}</span>
                </div>
              </div>

              ${
                status !== "cancelled"
                  ? `
              <div style="text-align:center;">
                <a href="${process.env.FRONTEND_USER_URL || "http://localhost:5174"}/track/${orderNumber}"
                  style="display:inline-block;background:${info.color};color:white;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
                  Track Order →
                </a>
              </div>`
                  : `
              <div style="text-align:center;">
                <a href="${process.env.FRONTEND_USER_URL || "http://localhost:5174"}/contact"
                  style="display:inline-block;background:${info.color};color:white;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
                  Contact Support →
                </a>
              </div>`
              }
            </div>

            <div style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;">
              <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                © 2026 ${STORE_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Status email error:", error.message);
  }
};
