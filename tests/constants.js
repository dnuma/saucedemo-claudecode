const MESSAGES = {
  LOCKED_OUT_ERROR: 'Sorry, this user has been locked out',
  INVENTORY_TITLE: 'Products',
};

const URLS = {
  INVENTORY: /inventory\.html/,
};

const INVENTORY = {
  TOTAL_ITEMS: 6,
  PRODUCT_BACKPACK: 'Sauce Labs Backpack',
  UNIQUE_BROKEN_IMAGE_COUNT: 1,
};

const TIMEOUTS = {
  PERFORMANCE_GLITCH: 15000,
  PERFORMANCE_GLITCH_MIN_DELAY: 3000,
};

module.exports = { MESSAGES, URLS, INVENTORY, TIMEOUTS };
