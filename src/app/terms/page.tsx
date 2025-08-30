import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Little Latte Lane',
  description:
    'Terms and Conditions for ordering, delivery/collection, bookings, and refunds at Little Latte Lane.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-cyan-500/30 bg-black/50 p-6 shadow-[0_0_40px_rgba(0,255,255,0.15)] backdrop-blur">
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent" data-editable="terms-page-title">
              Terms & Conditions
            </span>
          </h1>
          <p className="text-sm text-gray-300" data-editable="terms-last-updated">
            Last Updated: <strong>August 11, 2025</strong>
          </p>
          <p className="mt-4 text-gray-200" data-editable="terms-introduction">
            Welcome to <strong>Little Latte Lane</strong>. These Terms and
            Conditions govern your use of our services, including online
            ordering, delivery/collection, and bookings. By placing an order or
            making a booking with Little Latte Lane, you agree to these Terms
            and Conditions.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300" data-editable="terms-acceptance-heading">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3 text-gray-200" data-editable="terms-acceptance-text">
            By placing an order or making a booking with Little Latte Lane, you
            agree to these Terms and Conditions. If you do not agree, please do
            not use our services.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300" data-editable="terms-age-heading">
            2. Age Requirement
          </h2>
          <p className="mt-3 text-gray-200" data-editable="terms-age-text">
            You must be at least <strong>16 years old</strong> to place an order
            or make a booking, or have explicit consent from a parent or
            guardian. By ordering, you confirm that you meet this requirement
            and accept that once payment is made, no refunds will be issued
            except as described in Section 5.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300">
            3. Orders and Payments
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
            <li>
              All orders must be placed through our official website or in
              person at our location.
            </li>
            <li>
              <strong>
                Payment must be made in full before your order is processed.
              </strong>
            </li>
            <li>
              We accept payment through the payment methods listed on our
              website.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300">
            4. Delivery and Collection
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
            <li>
              Orders can be collected in person or delivered{' '}
              <strong>only within Roberts Estate</strong>.
            </li>
            <li>
              <strong>
                If you are located outside Roberts Estate, we will not deliver
                your order.
              </strong>
            </li>
            <li>
              Customers outside Roberts Estate are responsible for collecting
              their orders from our café.
            </li>
            <li>
              If you are unable to enter Roberts Estate (e.g., without an entry
              code), the order will still be made, and{' '}
              <strong>no refund will be issued</strong>.
            </li>
            <li>
              <strong>
                It is your responsibility to ensure you can collect your food
                from our premises.
              </strong>
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300">
            5. Cancellations and Refunds
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
            <li>
              Orders can only be canceled within{' '}
              <strong>1–2 minutes after payment</strong> by calling us directly.
            </li>
            <li>
              If the kitchen has already started preparing your order,
              cancellation is not possible.
            </li>
            <li>
              <strong>
                No refunds will be given after the kitchen starts preparing the
                order.
              </strong>
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-fuchsia-300">
            Refunds will only be considered in the following cases:
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
            <li>
              The food is visibly spoiled or unsafe to eat, with evidence
              provided.
            </li>
            <li>
              The wrong order was prepared, and the mistake is confirmed to be
              our fault (e.g., allergies listed on the order were ignored).
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300">6. Bookings</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
            <li>
              Bookings can be made for tables or golf sessions through our
              website or in person.
            </li>
            <li>
              <strong>
                Payment must be made in advance to secure your booking.
              </strong>
            </li>
            <li>
              Booking changes must be requested at least{' '}
              <strong>24 hours in advance</strong>.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300">
            7. Allergies and Dietary Requirements
          </h2>
          <p className="mt-3 text-gray-200">
            It is the customer&apos;s responsibility to inform us of any
            allergies or dietary requirements when placing an order. We will
            take reasonable care, but cannot guarantee against
            cross-contamination.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300">
            8. Changes to Terms
          </h2>
          <p className="mt-3 text-gray-200">
            Little Latte Lane reserves the right to update these Terms and
            Conditions at any time without prior notice. The updated version
            will be posted on our website.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-cyan-300" data-editable="terms-contact-heading">Contact Us</h2>
          <address className="mt-3 not-italic text-gray-200" data-editable="terms-contact-details">
            <strong>Little Latte Lane</strong>
            <br />
            📍 Roberts Estate Community Centre, 11 Aristea Crescent, Roberts
            Estate, Middelburg
            <br />
            📧 Email:{' '}
            <a
              className="text-cyan-300 hover:underline"
              href="mailto:peet@littlelattelane.co.za"
            >
              peet@littlelattelane.co.za
            </a>
            <br />
            📞 Phone:{' '}
            <a
              className="text-cyan-300 hover:underline"
              href="tel:+27795041412"
            >
              +27 79 504 1412
            </a>
          </address>
        </div>
      </section>
    </main>
  );
}
