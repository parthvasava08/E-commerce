import { Resend } from "resend";

const STORE_NAME = "KOREX";

let client = null;
const getClient = () => {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
};

let warnedAboutTestSender = false;
const getFrom = () => {
  const from = process.env.FROM_EMAIL;
  if (!from) {
    if (!warnedAboutTestSender) {
      console.warn(
        "FROM_EMAIL is not set. Using Resend's test sender, which can only " +
          "deliver to your own Resend account email. Set FROM_EMAIL to an " +
          "address on a domain you verified in Resend.",
      );
      warnedAboutTestSender = true;
    }
    return "onboarding@resend.dev";
  }
  return from;
};

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const storeUrl = () =>
  (process.env.FRONTEND_USER_URL || "http://localhost:5174").replace(
    /\/+$/,
    "",
  );

const send = async ({ to, subject, html }, label) => {
  try {
    const { error } = await getClient().emails.send({
      from: getFrom(),
      to,
      subject,
      html,
    });
    if (error) {
      console.error(
        `${label} email FAILED (${error.name || "error"}): ${error.message}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`${label} email error:`, err.message);
    return false;
  }
};

const infoRow = (label, valueHtml, last = false) => `
  <tr>
    <td style="color:#6b7280;font-size:13px;font-weight:600;padding:0 0 ${last ? 0 : 8}px 0;">${label}</td>
    <td style="text-align:right;padding:0 0 ${last ? 0 : 8}px 0;">${valueHtml}</td>
  </tr>`;

const infoBox = (rowsHtml) => `
  <table role="presentation" width="100%" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;border-collapse:separate;">
    <tbody>${rowsHtml}</tbody>
  </table>`;

const footer = (extra = "") => `
  <div style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
      © 2026 ${STORE_NAME}. All rights reserved.${extra}
    </p>
  </div>`;

const button = (href, text, color) => `
  <a href="${href}"
    style="display:inline-block;background:${color};color:white;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
    ${text}
  </a>`;

const shell = (bodyHtml) => `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${bodyHtml}
  </div>
</body>
</html>`;

export const sendWelcomeEmail = async ({ email, username }) => {
  const html = shell(`
    <div style="background:#4f8ef7;padding:40px;text-align:center;">
      <div style="display:inline-block;width:48px;height:48px;line-height:48px;background:rgba(255,255,255,0.2);border-radius:12px;margin-bottom:16px;">
        <span style="color:white;font-size:24px;font-weight:900;">K</span>
      </div>
      <h1 style="color:white;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">${STORE_NAME}</h1>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Welcome, ${esc(username)}!</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Thanks for joining ${STORE_NAME}. Your account is ready. Start exploring our premium collection.
      </p>
      ${button(`${storeUrl()}/products`, "Start Shopping →", "#4f8ef7")}
    </div>
    ${footer(" · Surat, Gujarat, India")}
  `);

  return send(
    { to: email, subject: `Welcome to ${STORE_NAME}!`, html },
    "Welcome",
  );
};

export const sendOrderConfirmationEmail = async ({
  email,
  username,
  order,
}) => {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${esc(item.product_name)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:center;">${esc(item.quantity)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;text-align:right;font-weight:700;">${inr(Number(item.price) * Number(item.quantity))}</td>
      </tr>`,
    )
    .join("");

  const th =
    "font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;";

  const html = shell(`
    <div style="background:#4f8ef7;padding:40px;text-align:center;">
      <h1 style="color:white;margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:2px;">${STORE_NAME}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">Order Confirmed ✓</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 8px;">Hi ${esc(username)},</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 28px;">
        Your order has been placed successfully. We'll notify you when it ships.
      </p>
      ${infoBox(
        infoRow(
          "Order Number",
          `<span style="color:#4f8ef7;font-size:13px;font-weight:800;font-family:monospace;">${esc(order.order_number)}</span>`,
        ) +
          infoRow(
            "Payment",
            `<span style="color:#111827;font-size:13px;font-weight:700;">${order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}</span>`,
          ) +
          infoRow(
            "Total",
            `<span style="color:#111827;font-size:15px;font-weight:900;">${inr(order.final_amount)}</span>`,
            true,
          ),
      )}
      <h3 style="color:#111827;font-size:15px;font-weight:800;margin:0 0 12px;">Items Ordered</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;${th}">Product</th>
            <th style="text-align:center;${th}">Qty</th>
            <th style="text-align:right;${th}">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top:28px;text-align:center;">
        ${button(`${storeUrl()}/track/${encodeURIComponent(order.order_number)}`, "Track Your Order →", "#4f8ef7")}
      </div>
    </div>
    ${footer()}
  `);

  return send(
    { to: email, subject: `Order Confirmed — ${order.order_number}`, html },
    "Order confirmation",
  );
};

const STATUS_INFO = {
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
    message: "Your order has been delivered successfully. We hope you love it!",
    color: "#10b981",
  },
  cancelled: {
    label: "Order Cancelled",
    message:
      "Your order has been cancelled. If you have any questions, please contact us.",
    color: "#ef4444",
  },
};

export const sendOrderStatusEmail = async ({
  email,
  username,
  orderNumber,
  status,
  finalAmount,
}) => {
  const info = STATUS_INFO[status];
  if (!info) return false;

  const cta =
    status !== "cancelled"
      ? button(
          `${storeUrl()}/track/${encodeURIComponent(orderNumber)}`,
          "Track Order →",
          info.color,
        )
      : button(`${storeUrl()}/contact`, "Contact Support →", info.color);

  const html = shell(`
    <div style="background:${info.color};padding:40px;text-align:center;">
      <h1 style="color:white;margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:2px;">${STORE_NAME}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">${info.label}</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 8px;">Hi ${esc(username)},</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">${info.message}</p>
      ${infoBox(
        infoRow(
          "Order Number",
          `<span style="color:${info.color};font-size:13px;font-weight:800;font-family:monospace;">${esc(orderNumber)}</span>`,
        ) +
          infoRow(
            "Total",
            `<span style="color:#111827;font-size:15px;font-weight:900;">${inr(finalAmount)}</span>`,
            true,
          ),
      )}
      <div style="text-align:center;">${cta}</div>
    </div>
    ${footer()}
  `);

  return send(
    { to: email, subject: `${info.label} — ${orderNumber}`, html },
    "Status",
  );
};
