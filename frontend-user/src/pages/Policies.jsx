import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

const COMPANY = {
  name: "KOREX",
  grievanceOfficer: "Name of Grievance Officer",
  email: "support@Korexmart.com",
  phone: "+91 98765 43210",
  address: "Your registered business address, Surat, Gujarat, India",
  jurisdiction: "Surat, Gujarat",
  shipsTo: "India",
  deliveryDays: "3 to 7",
  returnDays: 7,
  refundDays: "5 to 7",
  damageReportHours: 48,
  reviewDays: "2 to 3",
  largeItems: "air conditioners, televisions, refrigerators, washing machines",
  freeShippingAbove: 999,
  shippingCharge: 99,

  codAtDoor:
    "The ways of paying at the door (for example cash or UPI) are confirmed at the time of delivery.",
  lastUpdated: "2 October 2026",
};

const C = COMPANY;

const POLICIES = {
  terms: {
    tab: "Terms & Conditions",
    title: "Terms & Conditions",
    intro: `These terms cover your use of the ${C.name} website and your purchases from us. By creating an account or placing an order, you agree to them.`,
    sections: [
      {
        h: "1. Your account",
        p: [
          "You need an account to place an order. You must be at least 18 years old, and the details you give must be accurate.",
        ],
        ul: [
          "Keep your password private. You are responsible for what happens under your account.",
          "Use one account per person.",
          "You can deactivate your account at any time from your Profile page. We may deactivate accounts that are used for fraud or abuse.",
        ],
      },
      {
        h: "2. Products and prices",
        p: [
          "Prices are in Indian Rupees (₹). Product images and descriptions are for guidance and may differ slightly from the item you receive.",
          "We may change prices and availability at any time. If a product is out of stock, or listed at a clearly wrong price, we may cancel the order and refund anything you paid.",
        ],
      },
      {
        h: "3. Placing an order",
        p: [
          "Your order is accepted when you receive an order confirmation email with your order number. You can follow it on the Track Order page.",
        ],
      },
      {
        h: "4. Payment",
        ul: [
          "Online payments are processed by Razorpay. We do not see or store your card, UPI or bank details.",
          `Cash on Delivery (COD): you pay when the order is delivered. ${C.codAtDoor}`,
          "An online order is treated as paid only after the payment succeeds. A COD order is treated as paid after it is delivered.",
        ],
      },
      {
        h: "5. Coupons",
        ul: [
          "One coupon can be used per order.",
          "A coupon can have a minimum order amount and an expiry date.",
          "We can withdraw a coupon that is misused.",
        ],
      },
      {
        h: "6. Shipping, cancellation and returns",
        p: [
          "Our Shipping & Delivery Policy and our Cancellation, Return & Refund Policy are part of these terms.",
        ],
      },
      {
        h: "7. Acceptable use",
        p: [
          "Do not misuse the site. This includes trying to access other people's accounts or the admin area, using automated tools to scrape or overload the site, and placing false orders.",
        ],
      },
      {
        h: "8. Our content",
        p: [
          `The ${C.name} name, logo, design and content belong to us. You may not copy or reuse them without our permission.`,
        ],
      },
      {
        h: "9. Limits on our liability",
        p: [
          "We work to keep the site accurate and available, but we cannot promise it will always be free of errors or interruptions. To the extent the law allows, our liability for any order is limited to the amount you paid for it.",
        ],
      },
      {
        h: "10. Governing law",
        p: [
          `These terms follow the laws of India. Disputes are handled by the courts at ${C.jurisdiction}.`,
        ],
      },
      {
        h: "11. Changes and contact",
        p: [
          `We may update these terms. The date at the top shows the latest version. Questions? Write to ${C.email}.`,
          `Grievance Officer: ${C.grievanceOfficer}. Email ${C.email} or call ${C.phone}.`,
        ],
      },
    ],
  },

  privacy: {
    tab: "Privacy Policy",
    title: "Privacy Policy",
    intro: `This policy explains what personal information ${C.name} collects, why we collect it, and the choices you have.`,
    sections: [
      {
        h: "1. What we collect",
        ul: [
          "Account details: your name, email address, phone number (optional) and password. Passwords are stored in scrambled (hashed) form, so we cannot read them.",
          "Order details: delivery addresses, the items you bought, amounts and payment status. For online payments we keep the Razorpay payment reference, not your card or UPI details.",
          "Messages you send through the Contact Us form.",
          "The items in your cart and wishlist.",
        ],
      },
      {
        h: "2. Cookies and browser storage",
        ul: [
          "A login cookie keeps you signed in for up to 7 days. The site needs it to work, and page scripts cannot read it.",
          "Your light or dark theme choice is saved in your browser.",
        ],
        p: ["We do not use advertising or analytics cookies."],
      },
      {
        h: "3. How we use your information",
        ul: [
          "To create your account and to process, deliver and track your orders.",
          "To send you order emails: welcome, order confirmation and status updates.",
          "To answer your messages and give support.",
          "To prevent fraud and keep the site secure.",
        ],
      },
      {
        h: "4. Who we share it with",
        p: [
          "We do not sell your personal information. We share only what is needed with the services that run the store:",
        ],
        ul: [
          "Razorpay, to process online payments.",
          "Resend, to send our emails to you.",
          "Our hosting providers, which store the site's data.",
          "Delivery partners, who need your name, phone number and address to deliver your order.",
          "Authorities, only where the law requires it.",
        ],
      },
      {
        h: "5. How long we keep it",
        p: [
          "We keep your account information while your account exists. Order and payment records are kept for as long as the law requires for accounting and tax. Deactivating your account stops you from signing in, but it does not erase these records.",
        ],
      },
      {
        h: "6. Your choices",
        ul: [
          "See and update your name, email and phone number on your Profile page.",
          "Change your password or deactivate your account from the Profile page.",
          `To ask for a copy of your data or to request deletion, email ${C.email}.`,
        ],
      },
      {
        h: "7. Security",
        p: [
          "We use hashed passwords, secure login cookies and encrypted (HTTPS) connections. No system is perfectly secure, so please use a strong password that you do not use elsewhere.",
        ],
      },
      {
        h: "8. Children",
        p: ["The store is for people aged 18 and over."],
      },
      {
        h: "9. Questions and complaints",
        p: [
          `For privacy questions or complaints, contact our Grievance Officer, ${C.grievanceOfficer}, at ${C.email} or ${C.phone}. Our address: ${C.address}.`,
          "We may update this policy. The date at the top shows the latest version.",
        ],
      },
    ],
  },

  refund: {
    tab: "Return, Refund & Cancellation",
    title: "Cancellation, Return & Refund Policy",
    intro:
      "How to cancel an order, report a problem with an item, return it, and get a refund.",
    sections: [
      {
        h: "1. Cancelling an order",
        ul: [
          "You can cancel an order before it ships. Contact us with your order number through the Contact Us page or by email.",
          "Once an order has shipped it cannot be cancelled, but you can still report a problem after delivery (see below).",
        ],
      },
      {
        h: "2. Refunds for cancelled orders",
        ul: [
          `Paid online: the full amount goes back to your original payment method within ${C.refundDays} business days after the cancellation is approved.`,
          "Cash on Delivery: you have paid nothing, so there is nothing to refund.",
        ],
      },
      {
        h: "3. Problems we accept, and how long you have",
        ul: [
          `Damaged in transit, wrong item, or a missing item or part: report it within ${C.damageReportHours} hours of delivery.`,
          `An item that does not work or has a defect: report it within ${C.returnDays} days of delivery.`,
          "After that, faults are handled under the manufacturer's warranty where one applies.",
        ],
      },
      {
        h: "4. Proof we need",
        p: [
          "Send everything to our support email with your order number. The clearer the proof, the faster we can decide.",
        ],
        ul: [
          "Clear photos of the item, the outer box and the shipping label.",
          "For a missing item or part: a video recorded from the moment you open the sealed package, with the shipping label visible. Please keep the box and packing material.",
          "For damage you can see at the door: tell the delivery person, and where possible refuse the package or note the damage on the delivery receipt.",
          "If you do not have a video, we will still look at your claim, but we may ask for more proof before we decide.",
        ],
      },
      {
        h: "5. Large appliances and electronics",
        p: [
          `This section covers ${C.largeItems}, and similar large or installed items. They have extra steps because a fault is often only found when the item is installed or switched on.`,
        ],
        ul: [
          "At delivery: check the package and the product in front of the delivery person before you sign. For a television, check the screen. Report visible damage on the spot.",
          `Report damage within ${C.damageReportHours} hours of delivery, with photos and a video.`,
          "Installation: have the item installed by the brand's authorised technician. Keep the invoice, box and all accessories until the item is installed and working.",
          `If the item does not work when first used, report it within ${C.returnDays} days of delivery. We may ask the brand's service centre or a technician to inspect it, or ask for a short video call to see the problem.`,
          "If the fault is confirmed, we replace the item or refund you. If it cannot be confirmed, we may decline the claim.",
          "Once a large item is installed and working, we do not accept returns for change of mind. Later faults are covered by the manufacturer's warranty.",
        ],
      },
      {
        h: "6. How we decide",
        p: [
          `We review your claim within ${C.reviewDays} business days and tell you the result by email: a replacement, a repair through the service centre, or a refund. We may decline claims that we cannot verify, or where a different item is sent back.`,
        ],
      },
      {
        h: "7. Sending an item back",
        p: [
          "Please do not send anything back until we confirm. We will tell you how to return it. The item must be the same one we delivered, with all its accessories.",
        ],
      },
      {
        h: "8. How refunds are paid",
        ul: [
          `Online payments: refunded to the original payment method within ${C.refundDays} business days after we approve the claim.`,
          "COD orders: refunded by bank transfer. We will ask you for your account details.",
        ],
      },
      {
        h: "9. Shipping charges",
        p: [
          "Shipping charges are refunded only when the problem is our mistake, such as a damaged, defective, missing or wrong item.",
        ],
      },
      {
        h: "10. What we cannot accept",
        p: [
          `Items damaged through misuse or wrong installation, and claims made after the time limits above.`,
        ],
      },
      {
        h: "11. Contact",
        p: [`Write to ${C.email} or call ${C.phone}.`],
      },
    ],
  },

  shipping: {
    tab: "Shipping & Delivery",
    title: "Shipping & Delivery Policy",
    intro: "How and when your order reaches you.",
    sections: [
      {
        h: "1. Where we deliver",
        p: [
          `We deliver across ${C.shipsTo} to the address you enter at checkout. Please check it carefully: an order cannot be redirected after it ships.`,
        ],
      },
      {
        h: "2. Delivery time",
        p: [
          `Orders usually arrive in ${C.deliveryDays} business days after confirmation. Delays can happen because of weather, courier problems or high demand.`,
        ],
      },
      {
        h: "3. Shipping charges",
        ul: [
          `Orders above ₹${C.freeShippingAbove} (after any coupon discount) ship free.`,
          `Orders of ₹${C.freeShippingAbove} or less pay a flat ₹${C.shippingCharge} shipping charge.`,
          "The exact charge is shown at checkout before you pay.",
        ],
      },
      {
        h: "4. Tracking your order",
        p: [
          "We email you when your order is confirmed, shipped, delivered or cancelled. You can also use the Track Order page with your order number.",
        ],
      },
      {
        h: "5. Cash on Delivery",
        p: [
          "COD is available. Please keep the amount ready. Payment is collected when the order is handed over to you.",
        ],
      },
      {
        h: "6. If you are not available",
        p: [
          "The courier may try again. An order that cannot be delivered may be returned to us and cancelled. If you had paid online, you will be refunded under our Cancellation, Return & Refund Policy.",
        ],
      },
      {
        h: "7. Damaged or wrong item",
        p: [
          `Check the package when it arrives. If the item is damaged, missing something or wrong, contact us within ${C.damageReportHours} hours. See the Cancellation, Return & Refund Policy for the proof we need.`,
        ],
      },
    ],
  },
};

const ORDER = ["terms", "privacy", "refund", "shipping"];

function Policies() {
  const { slug } = useParams();
  const policy = POLICIES[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!policy) return <Navigate to="/policies/terms" replace />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap gap-2 mb-8">
        {ORDER.map((key) => (
          <Link
            key={key}
            to={`/policies/${key}`}
            className={`text-xs font-bold px-4 py-2 rounded-full no-underline border transition-colors ${
              key === slug
                ? "bg-[#4f8ef7] border-[#4f8ef7] text-white"
                : "bg-white dark:bg-[#0e1117] border-gray-200 dark:border-[#1a1f2e] text-gray-600 dark:text-[#9aa2b1] hover:border-[#4f8ef7]"
            }`}
          >
            {POLICIES[key].tab}
          </Link>
        ))}
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-2">
        {policy.title}
      </h1>
      <p className="text-xs text-gray-400 dark:text-[#6b7585] mb-4">
        Last updated: {C.lastUpdated}
      </p>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-[#9aa2b1] mb-8">
        {policy.intro}
      </p>

      <div className="flex flex-col gap-7">
        {policy.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-base font-bold text-gray-900 dark:text-[#f0f2f7] mb-2">
              {s.h}
            </h2>
            {s.p?.map((text) => (
              <p
                key={text}
                className="text-sm leading-relaxed text-gray-600 dark:text-[#9aa2b1] mb-2"
              >
                {text}
              </p>
            ))}
            {s.ul && (
              <ul className="list-disc pl-5 flex flex-col gap-1.5">
                {s.ul.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-gray-600 dark:text-[#9aa2b1]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-[#6b7585] mt-10 pt-6 border-t border-gray-200 dark:border-[#1a1f2e]">
        Questions? Visit our{" "}
        <Link
          to="/contact"
          className="text-[#4f8ef7] no-underline font-semibold"
        >
          Contact Us
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

export default Policies;
