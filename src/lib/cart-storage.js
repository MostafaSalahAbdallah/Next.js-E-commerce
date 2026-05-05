const CART_KEY = "ecommerce_cart";

export function getGuestCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addGuestCartItem(product, quantity = 1) {
  const items = getGuestCart();
  const existingItem = items.find((item) => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({ product, quantity });
  }

  saveGuestCart(items);
  return items;
}

export function updateGuestCartItem(productId, quantity) {
  const nextQuantity = Number(quantity);
  const items = getGuestCart()
    .map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      return { ...item, quantity: nextQuantity };
    })
    .filter((item) => item.quantity > 0);

  saveGuestCart(items);
  return items;
}

export function removeGuestCartItem(productId) {
  const items = getGuestCart().filter((item) => item.product.id !== productId);
  saveGuestCart(items);
  return items;
}
