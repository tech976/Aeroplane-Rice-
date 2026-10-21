import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { SHOP_URL, firstInStock, price, products } from '../products';
import { fromVariantId, liveVariant, onShopify } from '../host';
import { plansFor } from '../subscriptions';

// `plan` is the subscription plan's id when the pack is on subscribe and save; `key` is the
// store's own id for the line inside the Shopify theme
type Line = { id: string; productId: string; size: string; quantity: number; plan?: string; key?: string };
type CartValue = {
  lines: Line[];
  count: number;
  add: (productId: string, size: string, quantity?: number, plan?: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  open: () => void;
};

const CartContext = createContext<CartValue | null>(null);
const STORE = 'aeroplane-cart';

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside CartProvider');
  return cart;
}

function load(): Line[] {
  if (onShopify) return [];
  try { return JSON.parse(localStorage.getItem(STORE) ?? '[]'); } catch { return []; }
}

const lineId = (productId: string, size: string, plan?: string) => [productId, size, plan].filter(Boolean).join(':');

// Inside the Shopify theme the cart is the store's own, through its cart API, so checkout sees it.
type StoreItem = { key: string; variant_id: number; quantity: number; selling_plan_allocation?: { selling_plan: { id: number } } };
async function storeCart(): Promise<Line[]> {
  const cart: { items: StoreItem[] } = await (await fetch('/cart.js')).json();
  return cart.items.flatMap((item) => {
    const found = fromVariantId(item.variant_id);
    if (!found) return [];
    const plan = item.selling_plan_allocation ? String(item.selling_plan_allocation.selling_plan.id) : undefined;
    return [{ id: lineId(found.productId, found.size, plan), ...found, plan, key: item.key, quantity: item.quantity }];
  });
}

async function post(path: string, body: unknown) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
}

export function Stepper({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity">−</button>
      <output>{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity">+</button>
    </div>
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(load);
  const drawer = useRef<HTMLDialogElement>(null);
  const current = useRef(lines);
  current.current = lines;
  // store requests run one after another, and each ends by taking the store's cart as the truth
  const queue = useRef(Promise.resolve());
  const send = useCallback((request?: () => Promise<void>) => {
    if (!onShopify) return;
    queue.current = queue.current
      .then(() => request?.())
      .catch((error) => console.error(error))
      .then(storeCart)
      .then(setLines, (error) => console.error(error));
  }, []);

  useEffect(() => { send(); }, [send]);

  useEffect(() => {
    if (onShopify) return;
    try { localStorage.setItem(STORE, JSON.stringify(lines)); } catch { /* storage unavailable: the cart lasts for this visit */ }
  }, [lines]);

  const open = useCallback(() => drawer.current?.showModal(), []);

  // Shopify's own /cart address shows the home page with the cart open
  useEffect(() => { if (location.pathname.replace(/\/+$/, '') === '/cart') open(); }, [open]);

  const add = useCallback((productId: string, size: string, quantity = 1, plan?: string) => {
    const id = lineId(productId, size, plan);
    setLines((lines) => lines.some((line) => line.id === id)
      ? lines.map((line) => (line.id === id ? { ...line, quantity: line.quantity + quantity } : line))
      : [...lines, { id, productId, size, quantity, plan }]);
    const variant = liveVariant(productId, size);
    if (variant) send(() => post('/cart/add.js', { items: [{ id: variant.id, quantity, ...(plan && { selling_plan: Number(plan) }) }] }));
    open();
  }, [open, send]);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((lines) => lines.flatMap((line) => (line.id !== id ? [line] : quantity > 0 ? [{ ...line, quantity }] : [])));
    // the line's store key is read when the request runs, after any earlier add has come back
    send(async () => {
      const key = current.current.find((line) => line.id === id)?.key;
      if (key) await post('/cart/change.js', { id: key, quantity: Math.max(0, quantity) });
    });
  }, [send]);

  const rows = lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.productId);
    const variant = product?.variants.find((v) => v.size === line.size);
    if (!product || !variant) return [];
    const plan = line.plan ? plansFor(product, variant).find((p) => p.id === line.plan) : undefined;
    return [{ ...line, product, each: plan?.price ?? variant.price, was: variant.was, planName: plan?.name }];
  });
  const count = rows.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = rows.reduce((sum, row) => sum + row.each * row.quantity, 0);
  const saved = rows.reduce((sum, row) => sum + (row.was - row.each) * row.quantity, 0);

  const value = useMemo(() => ({ lines, count, add, setQuantity, open }), [lines, count, add, setQuantity, open]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <dialog className="cart" ref={drawer} aria-label="Your cart" onClick={(event) => { if (event.target === drawer.current) drawer.current?.close(); }}>
        <div className="cart__panel">
          <header className="cart__head">
            <h2>Your cart <span>({count})</span></h2>
            <button type="button" className="cart__close" aria-label="Close cart" onClick={() => drawer.current?.close()}><span /><span /></button>
          </header>

          {rows.length === 0 ? (
            <div className="cart__empty">
              <span className="ico ico--bowl" aria-hidden="true" />
              <p>Your cart is empty.</p>
              <a className="btn" href="/#range" onClick={() => drawer.current?.close()}>Shop the range</a>
            </div>
          ) : (
            <>
              <ul className="cart__lines">
                {rows.map((row) => (
                  <li key={row.id}>
                    <img src={row.product.image} alt="" width={row.product.width} height={row.product.height} loading="lazy" />
                    <div>
                      <h3>{row.product.name}</h3>
                      <p>{row.size}, {price(row.each)}</p>
                      {row.planName && <p className="cart__plan">Subscribe and save · {row.planName}</p>}
                      <div className="cart__controls">
                        <Stepper value={row.quantity} onChange={(q) => setQuantity(row.id, q)} label={`Quantity of ${row.product.name} ${row.size}`} />
                        <button type="button" className="cart__remove" onClick={() => setQuantity(row.id, 0)}>Remove</button>
                      </div>
                    </div>
                    <p className="cart__price">{price(row.each * row.quantity)}</p>
                  </li>
                ))}
              </ul>
              <footer className="cart__foot">
                <p className="cart__total"><span>Subtotal</span><b>{price(subtotal)}</b></p>
                {saved > 0 && <p className="cart__saved">You save {price(saved)} on shop prices.</p>}
                {onShopify ? (
                  <>
                    <p className="cart__note">Delivery and taxes are worked out at checkout.</p>
                    <a className="btn cart__checkout" href="/checkout">Checkout</a>
                  </>
                ) : (
                  <>
                    <p className="cart__note">Payment and delivery are completed on the Aeroplane online shop, where you can pick these packs again at the same prices.</p>
                    <a className="btn cart__checkout" href={`${SHOP_URL}/shop/`} target="_blank" rel="noopener">Continue to the shop</a>
                  </>
                )}
              </footer>
            </>
          )}
        </div>
      </dialog>
    </CartContext.Provider>
  );
}

/** Adds the smallest pack of a product in one tap. Used beside dishes and recipes. */
export function QuickAdd({ productId, className = '' }: { productId: string; className?: string }) {
  const { add } = useCart();
  const product = products.find((p) => p.id === productId)!;
  const variant = firstInStock(product);
  return (
    <button type="button" className={`btn btn--small ${className}`} disabled={!variant.inStock} onClick={() => add(product.id, variant.size)}>
      Add {product.name} {variant.size}, {price(variant.price)}
    </button>
  );
}

/** Cart button for the header. */
export function CartButton() {
  const { count, open } = useCart();
  return (
    <button type="button" className="cart-button" onClick={open} aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {count > 0 && <b>{count}</b>}
    </button>
  );
}
