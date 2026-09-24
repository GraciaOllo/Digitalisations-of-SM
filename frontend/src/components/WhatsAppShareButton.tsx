import { MessageCircle } from 'lucide-react';

interface Props {
phone?: string;
documentNumber: string;
clientName: string;
total: number;
type: 'invoice' | 'quote' | 'credit_note';
}

export default function WhatsAppShareButton({ phone, documentNumber, clientName, total, type }: Props) {
if (!phone) return null;

const typeLabel = {
invoice: 'facture',
quote: 'devis',
credit_note: 'avoir',
}[type];

const message = `Bonjour ${clientName},\n\nVoici votre ${typeLabel} N° ${documentNumber} d'un montant de ${total.toLocaleString()} FCFA.\n\nMerci de votre confiance.\n— Envoyé via Kôdo`;

const cleanPhone = phone.replace(/\D/g, '');
const fullPhone = cleanPhone.startsWith('237') ? cleanPhone : `237${cleanPhone}`;
const url = `https://wa.me/${698062900}?text=${encodeURIComponent(message)}`;

return (
<a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a] transition"
>
    <MessageCircle size={16} />
    WhatsApp
</a>
);
}