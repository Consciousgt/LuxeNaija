/**
 * LuxeNaija Product Catalog Data & Dynamic State Manager
 */

const DEFAULT_PRODUCTS = [
  // ── PREMIER NEW LUXURY ADDITIONS ──
  {
    id: 1,
    name: "Submariner Date 41mm Ceramic",
    brand: "Rolex",
    category: "accessories",
    gender: "unisex",
    price: 345000,
    originalPrice: 1150000,
    image: "images/product_rolex_submariner.jpg",
    rating: 5.0,
    reviews: 142,
    deliveryDays: 21,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["41mm Oystersteel"],
    description: "The benchmark among luxury divers' watches. Featuring a black Cerachrom bezel insert, robust Oystersteel bracelet, and self-winding calibre 3235 movement with 70-hour power reserve. Delivered with Rolex green presentation box, warranty card, and store receipt."
  },
  {
    id: 2,
    name: "Saddle Bag with Strap Black Grained",
    brand: "Dior",
    category: "bags",
    gender: "women",
    price: 245000,
    originalPrice: 780000,
    image: "images/product_dior_saddle.jpg",
    rating: 4.9,
    reviews: 89,
    deliveryDays: 20,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["Medium", "Mini"],
    description: "Maria Grazia Chiuri brings a fresh update to the iconic Saddle bag. Crafted in black grained calfskin with a magnetic 'D' stirrup clasp and antique gold-finish metal 'CD' signature on each side of the handle. Includes detachable matching shoulder strap and Christian Dior dust bag."
  },
  {
    id: 3,
    name: "Classic Double Flap Bag Quilted Caviar",
    brand: "Chanel",
    category: "bags",
    gender: "women",
    price: 295000,
    originalPrice: 920000,
    image: "images/product_chanel_flap.jpg",
    rating: 5.0,
    reviews: 118,
    deliveryDays: 22,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["Medium (25.5cm)", "Jumbo (30cm)"],
    description: "The ultimate emblem of timeless French luxury. Crafted in black diamond-quilted caviar leather with 24K gold-plated hardware, double CC turn-lock, and woven leather chain strap. Comes with Chanel magnetic box, booklet, dust bag, and verification code."
  },
  {
    id: 4,
    name: "Monolith Brushed Leather Combat Boots",
    brand: "Prada",
    category: "sneakers",
    gender: "unisex",
    price: 185000,
    originalPrice: 590000,
    image: "images/product_prada_boots.jpg",
    rating: 4.8,
    reviews: 64,
    deliveryDays: 24,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "A bold modernist silhouette inspired by uniform design. Crafted from brushed calf leather and nylon with detachable multi-pouches featuring Prada enameled metal triangle logo. Super-lightweight lug tread block sole."
  },
  {
    id: 5,
    name: "H Au Carre Reversible Leather Belt 38mm",
    brand: "Hermes",
    category: "accessories",
    gender: "unisex",
    price: 135000,
    originalPrice: 420000,
    image: "images/product_hermes_belt.jpg",
    rating: 4.9,
    reviews: 95,
    deliveryDays: 18,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["85cm", "90cm", "95cm", "100cm", "105cm"],
    description: "Reversible belt strap in Box 135 and Togo calfskin leather with iconic brushed gold-plated 'H' buckle. Hand-burnished edges and saddle-stitch craftsmanship. Includes orange presentation box and ribbon."
  },
  {
    id: 6,
    name: "Triple S Clear Sole Chunky Sneakers",
    brand: "Balenciaga",
    category: "sneakers",
    gender: "unisex",
    price: 165000,
    originalPrice: 510000,
    image: "images/product_balenciaga_triples.jpg",
    rating: 4.8,
    reviews: 73,
    deliveryDays: 21,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "The pioneer of luxury chunky streetwear. Features a 3-layered complex outsole with Clear Sole technology, embroidered size on the toe edge, and Balenciaga logo on the lateral side. Complete with spare laces and branded dust bag."
  },
  {
    id: 7,
    name: "GG Supreme Jacquard Zip Hooded Jacket",
    brand: "Gucci",
    category: "clothing",
    gender: "men",
    price: 175000,
    originalPrice: 540000,
    image: "images/product_gucci_jacket.jpg",
    rating: 4.9,
    reviews: 58,
    deliveryDays: 22,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "The classic GG monogram reinterpreted on water-resistant jacquard technical fabric with signature green-and-red Web knit cuffs and custom gold zip pullers. Sourced directly from official flagship stores in Milan."
  },
  {
    id: 8,
    name: "Loulou Medium Y-Quilted Shoulder Bag",
    brand: "YSL",
    category: "bags",
    gender: "women",
    price: 215000,
    originalPrice: 680000,
    image: "images/product_ysl_loulou.jpg",
    rating: 4.9,
    reviews: 82,
    deliveryDays: 19,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["Medium (32 x 22 cm)"],
    description: "Supple calfskin leather featuring iconic 'Y' chevron matelassé quilting, magnetic snap closure, and brushed antique gold metal YSL monogram. Convertible sliding chain strap for shoulder or crossbody styling."
  },

  // ── ESTABLISHED COLLECTION ──
  {
    id: 9,
    name: "Marmont Matelassé Shoulder Bag",
    brand: "Gucci",
    category: "bags",
    gender: "women",
    price: 195000,
    originalPrice: 650000,
    image: "images/product_gucci_bag.jpg",
    rating: 4.9,
    reviews: 84,
    deliveryDays: 21,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["Small", "Medium"],
    description: "Authentic Gucci GG Marmont shoulder bag in soft matelassé chevron leather with heart motif on the back. Antique gold-toned hardware, double G logo, microfiber lining with a suede-like finish. Sourced directly from Italy/UK."
  },
  {
    id: 10,
    name: "Air Jordan 1 Retro High OG 'Chicago'",
    brand: "Nike",
    category: "sneakers",
    gender: "men",
    price: 120000,
    originalPrice: 380000,
    image: "images/product_nike_jordan.jpg",
    rating: 4.8,
    reviews: 126,
    deliveryDays: 20,
    isFeatured: true,
    isSale: false,
    batch: "Batch 7",
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "The legendary 1985 silhouette in the iconic Chicago colorway. Premium full-grain leather upper, Nike Air cushioning in the sole, original wings logo on the ankle. 100% authentic deadstock."
  },
  {
    id: 11,
    name: "Monogram Eclipse Canvas Slender Wallet",
    brand: "Louis Vuitton",
    category: "accessories",
    gender: "men",
    price: 85000,
    originalPrice: 280000,
    image: "images/product_lv_wallet.jpg",
    rating: 4.9,
    reviews: 93,
    deliveryDays: 18,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["One Size"],
    description: "Slim and sophisticated, the Slender Wallet in Monogram Eclipse coated canvas easily slips into any pocket. Features 8 credit card slots and a bill compartment with grained cowhide leather lining."
  },
  {
    id: 12,
    name: "Oversized Tailored Wool-Blend Blazer",
    brand: "Zara",
    category: "clothing",
    gender: "women",
    price: 48000,
    originalPrice: 120000,
    image: "images/product_zara_blazer.jpg",
    rating: 4.7,
    reviews: 67,
    deliveryDays: 16,
    isFeatured: false,
    isSale: true,
    batch: "Batch 7",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Straight-cut blazer featuring lapel collar and long sleeves with pronounced shoulder pads. Front flap pockets, chest welt pocket, and back central vent. Premium wool-blend texture."
  },
  {
    id: 13,
    name: "RS-X Efekt Luxury PRM Sneakers",
    brand: "Puma",
    category: "sneakers",
    gender: "unisex",
    price: 55000,
    originalPrice: 145000,
    image: "images/product_puma_sneaker.jpg",
    rating: 4.6,
    reviews: 44,
    deliveryDays: 18,
    isFeatured: false,
    isSale: true,
    batch: "Batch 7",
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
    description: "Futuristic retro running aesthetic with mesh and leather overlays. Ultra-cushioned midsole for all-day comfort. Metallic gold detailing and rubber traction outsole."
  },
  {
    id: 14,
    name: "Medusa Biggie Hexagonal Sunglasses",
    brand: "Versace",
    category: "accessories",
    gender: "unisex",
    price: 98000,
    originalPrice: 320000,
    image: "images/product_versace_sunglasses.jpg",
    rating: 4.9,
    reviews: 51,
    deliveryDays: 19,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["Standard Fit"],
    description: "Iconic Medusa Biggie sunglasses featuring thick black acetate frames and wide temples adorned with gold-tone heritage Medusa hardware. 100% UV protection."
  },
  {
    id: 15,
    name: "GG Leather Belt with Shiny Buckle",
    brand: "Gucci",
    category: "accessories",
    gender: "unisex",
    price: 110000,
    originalPrice: 350000,
    image: "images/product_gucci_belt.jpg",
    rating: 4.9,
    reviews: 77,
    deliveryDays: 18,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["80cm", "85cm", "90cm", "95cm", "100cm"],
    description: "Signature smooth black calfskin leather belt with shiny gold-toned interlocking GG buckle. Sourced from authorized retailers in Milan with original box, dust bag, and certificate."
  },
  {
    id: 16,
    name: "Ultraboost Light Running Shoes",
    brand: "Adidas",
    category: "sneakers",
    gender: "men",
    price: 72000,
    originalPrice: 190000,
    image: "images/product_adidas_ultraboost.jpg",
    rating: 4.7,
    reviews: 58,
    deliveryDays: 18,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "Lightest Ultraboost ever made with 30% lighter Light BOOST material. Continental Better Rubber outsole delivers extraordinary grip in wet and dry conditions."
  },
  {
    id: 17,
    name: "BB Logo Oversized Heavy Fleece Hoodie",
    brand: "Balenciaga",
    category: "clothing",
    gender: "unisex",
    price: 140000,
    originalPrice: 420000,
    image: "images/product_balenciaga_hoodie.jpg",
    rating: 4.8,
    reviews: 39,
    deliveryDays: 22,
    isFeatured: false,
    isSale: false,
    batch: "Batch 7",
    sizes: ["S", "M", "L", "XL"],
    description: "Heavyweight organic curly fleece with oversized dropped shoulder cut. Embroidered tonal BB logo on the chest and kangaroo pocket. Ribbed trims."
  },
  // ── WATCH EDIT: curated independently for LuxeNaija ──
  ...[
    [18, "Aster Chronograph", "LuxeNaija", "men", 98000, 148000, "42mm / Steel", "new"],
    [19, "Monarch Automatic", "LuxeNaija", "men", 156000, 225000, "40mm / Steel", "hot"],
    [20, "Sable Moonphase", "LuxeNaija", "women", 135000, 195000, "36mm / Gold tone", "new"],
    [21, "Coastline Diver", "LuxeNaija", "men", 112000, 169000, "43mm / Steel", ""],
    [22, "Noir Square Classic", "LuxeNaija", "unisex", 87000, 126000, "34mm / Black", ""],
    [23, "Verde GMT", "LuxeNaija", "men", 129000, 188000, "41mm / Steel", "hot"],
    [24, "Celeste Mini", "LuxeNaija", "women", 76000, 109000, "30mm / Silver tone", "new"],
    [25, "Heritage Roman", "LuxeNaija", "unisex", 94000, 137000, "38mm / Leather", ""],
    [26, "Atlas Sport", "LuxeNaija", "men", 119000, 178000, "44mm / Steel", ""],
    [27, "Solstice Mesh", "LuxeNaija", "women", 82000, 121000, "34mm / Rose gold", ""],
    [28, "Eclipse Skeleton", "LuxeNaija", "men", 172000, 249000, "42mm / Steel", "hot"],
    [29, "Regent Leather", "LuxeNaija", "unisex", 71000, 105000, "38mm / Leather", ""],
    [30, "Onyx Digital", "LuxeNaija", "men", 63000, 92000, "40mm / Black", "new"],
    [31, "Aurelia Petite", "LuxeNaija", "women", 91000, 134000, "28mm / Gold tone", ""],
    [32, "Navigator Dual Time", "LuxeNaija", "men", 144000, 210000, "42mm / Steel", ""],
    [33, "Ivory Dress Watch", "LuxeNaija", "women", 79000, 115000, "32mm / Leather", ""],
    [34, "Rally Racing Chrono", "LuxeNaija", "men", 126000, 184000, "43mm / Steel", "hot"],
    [35, "Mosaic Bracelet Watch", "LuxeNaija", "unisex", 105000, 154000, "36mm / Steel", ""]
  ].map(([id, name, brand, gender, price, originalPrice, size, badge], index) => ({
    id, name, brand, category: "watches", gender, price, originalPrice,
    image: "images/watch-studio.svg", rating: 4.7 + (index % 3) / 10,
    reviews: 19 + index * 7, deliveryDays: 12 + (index % 6), isFeatured: index < 8,
    isSale: index % 5 === 0, badge, batch: "Watch Edit", sizes: [size],
    description: `A refined ${name.toLowerCase()} selected for the LuxeNaija Watch Edit. Includes presentation packaging and a 12-month LuxeNaija service guarantee.`
  }))
];

// Helper to get merged catalog (defaults + admin-created products)
function getMergedProducts() {
  try {
    const custom = JSON.parse(localStorage.getItem('luxenaija_custom_products') || '[]');
    const deletedIds = JSON.parse(localStorage.getItem('luxenaija_deleted_product_ids') || '[]');
    
    // Filter out deleted defaults
    const activeDefaults = DEFAULT_PRODUCTS.filter(p => !deletedIds.includes(p.id));
    
    // Combine
    return [...custom, ...activeDefaults];
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

// Global accessor
window.PRODUCTS = getMergedProducts();

// Helper functions for Admin CRUD
window.saveCustomProduct = function(product) {
  const custom = JSON.parse(localStorage.getItem('luxenaija_custom_products') || '[]');
  const existingIndex = custom.findIndex(p => p.id === product.id);
  if (existingIndex >= 0) {
    custom[existingIndex] = product;
  } else {
    custom.unshift(product);
  }
  localStorage.setItem('luxenaija_custom_products', JSON.stringify(custom));
  window.PRODUCTS = getMergedProducts();
};

window.deleteProduct = function(productId) {
  let custom = JSON.parse(localStorage.getItem('luxenaija_custom_products') || '[]');
  custom = custom.filter(p => p.id !== productId);
  localStorage.setItem('luxenaija_custom_products', JSON.stringify(custom));
  
  const deletedIds = JSON.parse(localStorage.getItem('luxenaija_deleted_product_ids') || '[]');
  if (!deletedIds.includes(productId)) {
    deletedIds.push(productId);
    localStorage.setItem('luxenaija_deleted_product_ids', JSON.stringify(deletedIds));
  }
  window.PRODUCTS = getMergedProducts();
};
