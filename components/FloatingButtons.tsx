import { MessageCircle, Phone } from 'lucide-react';

export default function FloatingButtons() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918796807060';
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '8796807060';

  return (
    <>
      {/* WhatsApp */}
      {/* <div className="fixed bottom-6 left-6 z-50 group">\
        <span
          className="absolute inset-0 rounded-full bg-green-500 opacity-40"
          style={{ animation: 'pulse-ring 2s ease-out infinite' }}
        />
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hi!%20I%20want%20to%20book%20a%20cab%20with%20SK%20Car%20Rental.`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-400
                     flex items-center justify-center text-white shadow-2xl
                     transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 4px 20px rgba(34,197,94,0.45)' }}
          aria-label="WhatsApp"
        >
          <MessageCircle size={22} />
        </a>
        <span className="absolute left-16 bottom-3 bg-foreground text-background text-xs
                         font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap
                         opacity-0 group-hover:opacity-100 pointer-events-none
                         transition-opacity duration-200">
          Chat on WhatsApp
        </span>
      </div> */}

      {/* Call */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <span
          className="absolute inset-0 rounded-full bg-orange-500 opacity-40"
          style={{ animation: 'pulse-ring 2s ease-out infinite 0.5s' }}
        />
        <a
          href={`tel:${phoneNumber}`}
          className="relative w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400
                     flex items-center justify-center text-white shadow-2xl
                     transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 4px 20px rgba(249,115,22,0.45)' }}
          aria-label="Call"
        >
          <Phone size={22} />
        </a>
        {/* Tooltip */}
        <span className="absolute right-16 bottom-3 bg-foreground text-background text-xs
                         font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap
                         opacity-0 group-hover:opacity-100 pointer-events-none
                         transition-opacity duration-200">
          Call Now
        </span>
      </div>
    </>
  );
}