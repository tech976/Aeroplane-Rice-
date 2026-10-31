import { products } from '../products';
import { usePath } from '../router';

// The number the Aeroplane online shop already chats on.
const NUMBER = '918595912445';

/** A floating WhatsApp button. On a product page the message names the product. */
export function WhatsApp() {
  const path = usePath();
  const product = products.find((p) => path.replace(/\/+$/, '') === `/products/${p.id}`);
  const text = product ? `Hi Aeroplane, I have a question about ${product.name}.` : 'Hi Aeroplane, I have a question.';

  return (
    <a
      className="wa"
      href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
    >
      <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
        <path fill="currentColor" d="M16 3.2A12.7 12.7 0 0 0 5.1 22.4L3.3 28.8l6.6-1.7A12.7 12.7 0 1 0 16 3.2Zm0 23.2c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.5 10.5 0 1 1 16 26.4Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.4Z" />
      </svg>
      <span>Chat with us</span>
    </a>
  );
}
