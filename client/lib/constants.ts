export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  rating: number
  reviews: number
  brand: string
  inStock: boolean
  tags?: string[]
  discount?: number
  sku?: string
}

export const mockProducts: Product[] = [
  // Traditional Rice (1-12)
  {
    id: 1,
    name: "Red Rice (Kekulu Hal)",
    price: 450,
    image: "/products/red-rice.jpg",
    category: "Rice",
    description: "Traditional Sri Lankan red rice, rich in fiber and nutrients. Perfect for everyday meals.",
    rating: 4.9,
    reviews: 234,
    brand: "Local Farm",
    inStock: true,
    tags: ["organic", "traditional", "fiber-rich"],
    sku: "RICE-RED-1KG"
  },
  {
    id: 2,
    name: "Samba Rice",
    price: 380,
    image: "/products/samba-rice.jpg",
    category: "Rice",
    description: "Premium Sri Lankan samba rice with distinctive aroma and taste. Ideal for special occasions.",
    rating: 4.8,
    reviews: 189,
    brand: "Local Farm",
    inStock: true,
    tags: ["aromatic", "premium", "special"],
    sku: "RICE-SAMBA-1KG"
  },
  {
    id: 3,
    name: "Nadu Rice",
    price: 320,
    image: "/products/nadu-rice.jpg",
    category: "Rice",
    description: "Classic Nadu rice, a staple in Sri Lankan households. Fluffy and delicious.",
    rating: 4.7,
    reviews: 312,
    brand: "Local Farm",
    inStock: true,
    tags: ["everyday", "fluffy", "classic"],
    sku: "RICE-NADU-1KG"
  },
  {
    id: 4,
    name: "Kuruluthuda Rice",
    price: 520,
    image: "/products/kuruluthuda.jpg",
    category: "Rice",
    description: "Ancient heritage rice variety known for its high nutritional value and unique taste.",
    rating: 4.9,
    reviews: 156,
    brand: "Heritage Farms",
    inStock: true,
    tags: ["heritage", "nutritious", "ancient"],
    sku: "RICE-KURULU-1KG"
  },
  {
    id: 5,
    name: "Pachchaperumal Rice",
    price: 580,
    image: "/products/pachchaperumal.jpg",
    category: "Rice",
    description: "Rare indigenous rice variety with exceptional health benefits. Low glycemic index.",
    rating: 4.8,
    reviews: 98,
    brand: "Heritage Farms",
    inStock: true,
    tags: ["rare", "low-gi", "indigenous"],
    sku: "RICE-PACHCHA-1KG"
  },
  {
    id: 6,
    name: "Suwandel Rice",
    price: 650,
    image: "/products/suwandel.jpg",
    category: "Rice",
    description: "The 'fragrant rice' of Sri Lanka. Known for its aromatic properties and delicate flavor.",
    rating: 5.0,
    reviews: 145,
    brand: "Heritage Farms",
    inStock: true,
    tags: ["fragrant", "premium", "aromatic"],
    discount: 10,
    sku: "RICE-SUWANDEL-1KG"
  },
  {
    id: 7,
    name: "Madathawalu Rice",
    price: 480,
    image: "/products/madathawalu.jpg",
    category: "Rice",
    description: "Traditional red rice variety with rich color and earthy flavor. High in antioxidants.",
    rating: 4.7,
    reviews: 167,
    brand: "Local Farm",
    inStock: true,
    tags: ["antioxidant", "traditional", "red"],
    sku: "RICE-MADA-1KG"
  },
  {
    id: 8,
    name: "Rathdel Rice",
    price: 550,
    image: "/products/rathdel.jpg",
    category: "Rice",
    description: "Ancient golden rice variety. Perfect for milk rice and special dishes.",
    rating: 4.8,
    reviews: 112,
    brand: "Heritage Farms",
    inStock: true,
    tags: ["golden", "ancient", "special-dishes"],
    sku: "RICE-RATHDEL-1KG"
  },

  // Pure Honey (9-16)
  {
    id: 9,
    name: "Wild Forest Honey (500ml)",
    price: 1200,
    image: "/products/wild-honey.jpg",
    category: "Honey",
    description: "100% pure wild honey collected from Sri Lankan forests. Unprocessed and natural.",
    rating: 4.9,
    reviews: 287,
    brand: "Wild Bee",
    inStock: true,
    tags: ["wild", "pure", "forest"],
    sku: "HONEY-WILD-500"
  },
  {
    id: 10,
    name: "Bee Honey (1L)",
    price: 2200,
    image: "/products/bee-honey.jpg",
    category: "Honey",
    description: "Premium bee honey from local apiaries. Rich in natural enzymes and antioxidants.",
    rating: 4.8,
    reviews: 198,
    brand: "Local Apiary",
    inStock: true,
    tags: ["premium", "local", "antioxidant"],
    sku: "HONEY-BEE-1L"
  },
  {
    id: 11,
    name: "Cinnamon Infused Honey",
    price: 1500,
    image: "/products/cinnamon-honey.jpg",
    category: "Honey",
    description: "Pure honey infused with Ceylon cinnamon. Perfect for health-conscious consumers.",
    rating: 4.7,
    reviews: 145,
    brand: "Ranketha Special",
    inStock: true,
    tags: ["infused", "cinnamon", "health"],
    sku: "HONEY-CINN-500"
  },
  {
    id: 12,
    name: "Ginger Honey",
    price: 1400,
    image: "/products/ginger-honey.jpg",
    category: "Honey",
    description: "Natural honey blended with fresh ginger. Great for immunity and cold relief.",
    rating: 4.8,
    reviews: 167,
    brand: "Ranketha Special",
    inStock: true,
    tags: ["ginger", "immunity", "natural"],
    sku: "HONEY-GING-500"
  },
  {
    id: 13,
    name: "Raw Honeycomb",
    price: 1800,
    image: "/products/honeycomb.jpg",
    category: "Honey",
    description: "Fresh honeycomb straight from the hive. The purest form of honey you can get.",
    rating: 5.0,
    reviews: 89,
    brand: "Wild Bee",
    inStock: true,
    tags: ["raw", "honeycomb", "purest"],
    discount: 15,
    sku: "HONEY-COMB-250"
  },
  {
    id: 14,
    name: "Stingless Bee Honey",
    price: 3500,
    image: "/products/stingless-honey.jpg",
    category: "Honey",
    description: "Rare honey from stingless bees. Known for exceptional medicinal properties.",
    rating: 4.9,
    reviews: 67,
    brand: "Wild Bee",
    inStock: true,
    tags: ["rare", "medicinal", "stingless"],
    sku: "HONEY-STINGLESS-250"
  },
  {
    id: 15,
    name: "Multifloral Honey (250ml)",
    price: 650,
    image: "/products/multifloral-honey.jpg",
    category: "Honey",
    description: "Honey collected from various flower sources. Complex flavor profile.",
    rating: 4.6,
    reviews: 234,
    brand: "Local Apiary",
    inStock: true,
    tags: ["multifloral", "complex", "variety"],
    sku: "HONEY-MULTI-250"
  },
  {
    id: 16,
    name: "Honey Gift Set",
    price: 4500,
    image: "/products/honey-gift.jpg",
    category: "Honey",
    description: "Beautifully packaged set of 4 honey varieties. Perfect gift for health enthusiasts.",
    rating: 4.9,
    reviews: 78,
    brand: "Ranketha Special",
    inStock: true,
    tags: ["gift", "variety", "premium"],
    discount: 10,
    sku: "HONEY-GIFT-SET"
  },

  // Art & Crafts (17-24)
  {
    id: 17,
    name: "Handwoven Reed Basket",
    price: 1800,
    image: "/products/reed-basket.jpg",
    category: "Art & Crafts",
    description: "Traditional Sri Lankan reed basket, handcrafted by skilled artisans. Multi-purpose use.",
    rating: 4.8,
    reviews: 89,
    brand: "Village Artisans",
    inStock: true,
    tags: ["handwoven", "traditional", "functional"],
    sku: "CRAFT-BASKET-01"
  },
  {
    id: 18,
    name: "Coconut Shell Bowl Set",
    price: 1200,
    image: "/products/coconut-bowl.jpg",
    category: "Art & Crafts",
    description: "Set of 4 polished coconut shell bowls. Eco-friendly and beautifully crafted.",
    rating: 4.7,
    reviews: 156,
    brand: "Eco Crafts",
    inStock: true,
    tags: ["eco-friendly", "coconut", "set"],
    sku: "CRAFT-CBOWL-SET"
  },
  {
    id: 19,
    name: "Lacquer Work Decorative Box",
    price: 2500,
    image: "/products/lacquer-box.jpg",
    category: "Art & Crafts",
    description: "Traditional Matara lacquer work box. Intricate designs in vibrant colors.",
    rating: 4.9,
    reviews: 67,
    brand: "Matara Crafts",
    inStock: true,
    tags: ["lacquer", "decorative", "traditional"],
    sku: "CRAFT-LACQUER-01"
  },
  {
    id: 20,
    name: "Handmade Coir Rope Mat",
    price: 950,
    image: "/products/coir-mat.jpg",
    category: "Art & Crafts",
    description: "Natural coir rope floor mat. Durable, eco-friendly, and locally made.",
    rating: 4.6,
    reviews: 198,
    brand: "Village Artisans",
    inStock: true,
    tags: ["coir", "natural", "durable"],
    sku: "CRAFT-COIR-MAT"
  },
  {
    id: 21,
    name: "Brass Oil Lamp (Traditional)",
    price: 3200,
    image: "/products/brass-lamp.jpg",
    category: "Art & Crafts",
    description: "Traditional Sri Lankan brass oil lamp. Symbol of light and prosperity.",
    rating: 4.9,
    reviews: 145,
    brand: "Metal Artisans",
    inStock: true,
    tags: ["brass", "traditional", "decorative"],
    sku: "CRAFT-LAMP-BRASS"
  },
  {
    id: 22,
    name: "Batik Wall Hanging",
    price: 4500,
    image: "/products/batik-art.jpg",
    category: "Art & Crafts",
    description: "Authentic Sri Lankan batik art piece. Hand-painted with natural dyes.",
    rating: 4.8,
    reviews: 56,
    brand: "Batik Artists",
    inStock: true,
    tags: ["batik", "art", "wall-decor"],
    discount: 20,
    sku: "CRAFT-BATIK-01"
  },
  {
    id: 23,
    name: "Wooden Spice Box Set",
    price: 1650,
    image: "/products/spice-box.jpg",
    category: "Art & Crafts",
    description: "Handcrafted wooden spice box with 6 compartments. Teak wood finish.",
    rating: 4.7,
    reviews: 123,
    brand: "Wood Crafts",
    inStock: true,
    tags: ["wooden", "kitchen", "functional"],
    sku: "CRAFT-SPICE-BOX"
  },
  {
    id: 24,
    name: "Palmyra Leaf Fan",
    price: 450,
    image: "/products/palmyra-fan.jpg",
    category: "Art & Crafts",
    description: "Traditional hand fan made from palmyra leaves. Natural cooling solution.",
    rating: 4.5,
    reviews: 234,
    brand: "Village Artisans",
    inStock: true,
    tags: ["palmyra", "traditional", "eco-friendly"],
    sku: "CRAFT-FAN-PALM"
  },
]

export const brands = [
  {
    name: "Local Farm",
    logo: "/brands/local-farm.png",
    description: "Traditional rice from local Sri Lankan farmers"
  },
  {
    name: "Heritage Farms",
    logo: "/brands/heritage-farms.png",
    description: "Preserving ancient grain varieties"
  },
  {
    name: "Wild Bee",
    logo: "/brands/wild-bee.png",
    description: "Pure honey from Sri Lankan forests"
  },
  {
    name: "Local Apiary",
    logo: "/brands/local-apiary.png",
    description: "Community beekeeping collective"
  },
  {
    name: "Ranketha Special",
    logo: "/brands/ranketha-special.png",
    description: "Our curated specialty products"
  },
  {
    name: "Village Artisans",
    logo: "/brands/village-artisans.png",
    description: "Handcrafted products from rural communities"
  },
  {
    name: "Eco Crafts",
    logo: "/brands/eco-crafts.png",
    description: "Sustainable and eco-friendly crafts"
  },
  {
    name: "Matara Crafts",
    logo: "/brands/matara-crafts.png",
    description: "Traditional lacquer work artisans"
  },
]

export const categories = [
  {
    id: "rice",
    name: "Traditional Rice",
    slug: "rice",
    description: "Authentic Sri Lankan rice varieties",
    image: "/categories/rice.jpg",
    productCount: 8
  },
  {
    id: "honey",
    name: "Pure Honey",
    slug: "honey",
    description: "Organic and wild honey products",
    image: "/categories/honey.jpg",
    productCount: 8
  },
  {
    id: "art-crafts",
    name: "Art & Crafts",
    slug: "art-crafts",
    description: "Handmade artisan products",
    image: "/categories/crafts.jpg",
    productCount: 8
  },
]