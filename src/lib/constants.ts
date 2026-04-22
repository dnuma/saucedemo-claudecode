export const MESSAGES = {
  LOCKED_OUT_ERROR: 'Sorry, this user has been locked out',
  INVENTORY_TITLE: 'Products',
  ORDER_COMPLETE_HEADER: 'Thank you for your order!',
  ERROR_FIRST_NAME_REQUIRED: 'First Name is required',
  ERROR_LAST_NAME_REQUIRED: 'Last Name is required',
  ERROR_POSTAL_CODE_REQUIRED: 'Postal Code is required',
  ACCESS_DENIED_INVENTORY: "You can only access '/inventory.html' when you are logged in",
  ACCESS_DENIED_CART: "You can only access '/cart.html' when you are logged in",
};

export const URLS = {
  INVENTORY: /inventory\.html/,
  CART: /cart\.html/,
  CHECKOUT_STEP_ONE: /checkout-step-one\.html/,
  CHECKOUT_OVERVIEW: /checkout-step-two\.html/,
  CHECKOUT_COMPLETE: /checkout-complete\.html/,
};

export const INVENTORY = {
  TOTAL_ITEMS: 6,
  PRODUCT_BACKPACK: 'Sauce Labs Backpack',
  UNIQUE_BROKEN_IMAGE_COUNT: 1,
};

export const SORT = {
  AZ: 'az',
  ZA: 'za',
  LOW_TO_HIGH: 'lohi',
  HIGH_TO_LOW: 'hilo',
};

export const TIMEOUTS = {
  PERFORMANCE_GLITCH: 15000,
  PERFORMANCE_GLITCH_MIN_DELAY: 3000,
};
