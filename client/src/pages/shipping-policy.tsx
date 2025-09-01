export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Shipping & Delivery Policy
            </h1>
            
            <div className="text-sm text-gray-600 mb-8">
              <p>Last updated on Sep 1st 2025</p>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                For International buyers, orders are shipped and delivered through registered
                international courier companies and/or International speed post only.
                For domestic buyers, orders are shipped through registered domestic courier
                companies and /or speed post only.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Shipping Timeline</h3>
                <p className="text-blue-800">
                  Orders are shipped within <strong>0-7 days</strong> or as per the delivery date agreed
                  at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                </p>
              </div>

              <p>
                reportsnmarkets is not liable for any delay in delivery by the courier company / postal
                authorities and only guarantees to hand over the consignment to the courier company or
                postal authorities within <strong>0-7 days</strong> from the date of the order
                and payment or as per the delivery date agreed at the time of order confirmation.
              </p>

              <p>
                Delivery of all orders will be to the address provided by the buyer. Delivery of our services will
                be confirmed on your mail ID as specified during registration.
              </p>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Need Help?</h3>
                <p className="text-green-800">
                  For any issues in utilizing our services you may contact our helpdesk:
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-green-800"><strong>Phone:</strong> 7841941033</p>
                  <p className="text-green-800"><strong>Email:</strong> sameerbagul2004@gmail.com</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> The above content is created at reportsnmarkets's sole discretion. 
                  Razorpay shall not be liable for any content provided here and shall not be responsible for any 
                  claims and liability that may arise due to merchant's non-adherence to it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}