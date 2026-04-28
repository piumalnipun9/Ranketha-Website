import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.address.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.newsletterSubscription.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
        data: {
            name: 'Ranketha Admin',
            email: 'admin@ranketha.lk',
            password: hashedPassword,
            phone: '+94713430510',
            emailVerified: true,
            role: 'ADMIN',
        },
    });

    // Create Test Customer
    console.log('👤 Creating test customer...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customerUser = await prisma.user.create({
        data: {
            name: 'Kasun Perera',
            email: 'kasun@example.com',
            password: customerPassword,
            phone: '+94771234567',
            emailVerified: true,
            role: 'CUSTOMER',
        },
    });

    // Create Categories
    console.log('📦 Creating categories...');
    const riceCategory = await prisma.category.create({
        data: {
            name: 'Rice',
            slug: 'rice',
        },
    });

    const honeyCategory = await prisma.category.create({
        data: {
            name: 'Honey',
            slug: 'honey',
        },
    });

    const artCraftsCategory = await prisma.category.create({
        data: {
            name: 'Art & Crafts',
            slug: 'art-crafts',
        },
    });

    // Create Products
    console.log('🍚 Creating rice products...');

    // Rice Products
    const suwandel = await prisma.product.create({
        data: {
            itemCode: 'RICE-001',
            name: 'Suwandel Rice',
            slug: 'suwandel-rice',
            description: 'Suwandel is one of the most prized traditional Sri Lankan rice varieties, known for its exquisite aroma and delicate taste. This heritage grain has been cultivated for centuries and is rich in nutrients. Perfect for special occasions and everyday meals alike. Grown organically without pesticides or chemical fertilizers.',
            imageUrls: ['/images/products/suwandel-rice.jpg'],
            price: 850.00,
            stockQuantity: 50,
            isFeatured: true,
            isUsed: false,
        },
    });

    const kaluHeenati = await prisma.product.create({
        data: {
            itemCode: 'RICE-002',
            name: 'Kalu Heenati Rice',
            slug: 'kalu-heenati-rice',
            description: 'Kalu Heenati is an ancient red rice variety with a distinctive dark bran layer. Known for its high nutritional value, it is rich in antioxidants, iron, and fiber. This traditional rice helps maintain healthy blood sugar levels and is perfect for those seeking a wholesome diet.',
            imageUrls: ['/images/products/kalu-heenati-rice.jpg'],
            price: 780.00,
            stockQuantity: 75,
            isFeatured: true,
            isUsed: false,
        },
    });

    const pachchaPerumal = await prisma.product.create({
        data: {
            itemCode: 'RICE-003',
            name: 'Pachcha Perumal Rice',
            slug: 'pachcha-perumal-rice',
            description: 'Pachcha Perumal is a rare and valuable traditional rice variety with a unique greenish hue. It is known for its cooling properties and is traditionally recommended for those with digestive issues. This organic rice is carefully hand-harvested and sun-dried.',
            imageUrls: ['/images/products/pachcha-perumal-rice.jpg'],
            price: 920.00,
            stockQuantity: 30,
            isFeatured: false,
            isUsed: false,
        },
    });

    const rathuHeenati = await prisma.product.create({
        data: {
            itemCode: 'RICE-004',
            name: 'Rathu Heenati Rice',
            slug: 'rathu-heenati-rice',
            description: 'Rathu Heenati is a premium red rice variety celebrated for its nutty flavor and chewy texture. Rich in vitamins B and E, magnesium, and phosphorus. This traditional grain is perfect for biryanis, fried rice, and everyday cooking.',
            imageUrls: ['/images/products/rathu-heenati-rice.jpg'],
            price: 720.00,
            stockQuantity: 100,
            isFeatured: false,
            isUsed: false,
        },
    });

    const madathawalu = await prisma.product.create({
        data: {
            itemCode: 'RICE-005',
            name: 'Madathawalu Rice',
            slug: 'madathawalu-rice',
            description: 'Madathawalu is a traditional Sri Lankan rice variety known for its medium grain and excellent cooking properties. It absorbs flavors beautifully and is ideal for curries and rice dishes. Grown using sustainable farming methods.',
            imageUrls: ['/images/products/madathawalu-rice.jpg'],
            price: 680.00,
            stockQuantity: 60,
            isFeatured: false,
            isUsed: false,
        },
    });

    // Honey Products
    console.log('🍯 Creating honey products...');

    const wildForestHoney = await prisma.product.create({
        data: {
            itemCode: 'HONEY-001',
            name: 'Wild Forest Honey',
            slug: 'wild-forest-honey',
            description: 'Pure wild forest honey collected from the pristine forests of Sri Lanka. This raw, unprocessed honey retains all its natural enzymes, antioxidants, and healing properties. Known for its rich amber color and complex floral notes. Perfect for daily consumption, cooking, and natural remedies.',
            imageUrls: ['/images/products/wild-forest-honey.jpg'],
            price: 1500.00,
            stockQuantity: 40,
            isFeatured: true,
            isUsed: false,
        },
    });

    const beeMeeHoney = await prisma.product.create({
        data: {
            itemCode: 'HONEY-002',
            name: 'Bee Mee Honey (Stingless Bee)',
            slug: 'bee-mee-honey',
            description: 'Bee Mee honey is harvested from stingless bees (Meliponini) and is extremely rare and valuable. This medicinal honey has been used in traditional Ayurvedic medicine for centuries. It has a unique tangy-sweet taste and is known for its antibacterial and healing properties.',
            imageUrls: ['/images/products/bee-mee-honey.jpg'],
            price: 3500.00,
            stockQuantity: 15,
            isFeatured: true,
            isUsed: false,
        },
    });

    const cinnamonHoney = await prisma.product.create({
        data: {
            itemCode: 'HONEY-003',
            name: 'Ceylon Cinnamon Infused Honey',
            slug: 'cinnamon-infused-honey',
            description: 'A luxurious blend of pure Sri Lankan honey infused with premium Ceylon cinnamon. This combination creates a powerful health tonic that supports immunity, digestion, and metabolism. Delicious in tea, on toast, or straight from the spoon.',
            imageUrls: ['/images/products/cinnamon-honey.jpg'],
            price: 1800.00,
            stockQuantity: 25,
            isFeatured: false,
            isUsed: false,
        },
    });

    const multiFloralHoney = await prisma.product.create({
        data: {
            itemCode: 'HONEY-004',
            name: 'Multi-Floral Raw Honey',
            slug: 'multi-floral-raw-honey',
            description: 'This multi-floral honey is collected from bees that forage on diverse wildflowers across Sri Lankan meadows. Each batch has a unique flavor profile reflecting the seasonal blooms. Raw and unfiltered to preserve maximum nutrition.',
            imageUrls: ['/images/products/multi-floral-honey.jpg'],
            price: 1200.00,
            stockQuantity: 55,
            isFeatured: false,
            isUsed: false,
        },
    });

    // Art & Crafts Products
    console.log('🎨 Creating art & crafts products...');

    const weavenBasket = await prisma.product.create({
        data: {
            itemCode: 'CRAFT-001',
            name: 'Traditional Weaven Basket',
            slug: 'traditional-weaven-basket',
            description: 'Handcrafted woven basket made by skilled artisans using traditional techniques passed down through generations. Made from sustainably harvested natural materials. Perfect for storage, decoration, or as a unique gift. Each piece is one-of-a-kind.',
            imageUrls: ['/images/products/weaven-basket.jpg'],
            price: 2500.00,
            stockQuantity: 20,
            isFeatured: true,
            isUsed: false,
        },
    });

    const coconutShellBowl = await prisma.product.create({
        data: {
            itemCode: 'CRAFT-002',
            name: 'Polished Coconut Shell Bowl Set',
            slug: 'coconut-shell-bowl-set',
            description: 'Set of 4 beautifully polished coconut shell bowls, handcrafted by local artisans. These eco-friendly bowls are perfect for serving smoothie bowls, salads, or decorative purposes. Each bowl features natural variations making it unique.',
            imageUrls: ['/images/products/coconut-bowl-set.jpg'],
            price: 1800.00,
            stockQuantity: 35,
            isFeatured: false,
            isUsed: false,
        },
    });

    const brassOilLamp = await prisma.product.create({
        data: {
            itemCode: 'CRAFT-003',
            name: 'Traditional Brass Oil Lamp',
            slug: 'brass-oil-lamp',
            description: 'Authentic Sri Lankan brass oil lamp (Pahana) handcrafted by master craftsmen. This traditional lamp is an essential part of Sri Lankan culture and ceremonies. Features intricate designs and a beautiful patina. Can be used with coconut oil.',
            imageUrls: ['/images/products/brass-oil-lamp.jpg'],
            price: 4500.00,
            stockQuantity: 12,
            isFeatured: true,
            isUsed: false,
        },
    });

    const wovenMat = await prisma.product.create({
        data: {
            itemCode: 'CRAFT-004',
            name: 'Dumbara Weaving Mat',
            slug: 'dumbara-weaving-mat',
            description: 'Exquisite Dumbara mat handwoven using ancient techniques from the Dumbara region. These mats are known for their distinctive patterns and durability. Made from natural fibers and dyed with organic colors. Perfect as a floor mat, table runner, or wall hanging.',
            imageUrls: ['/images/products/dumbara-mat.jpg'],
            price: 6500.00,
            stockQuantity: 8,
            isFeatured: false,
            isUsed: false,
        },
    });

    const lacquerwareBox = await prisma.product.create({
        data: {
            itemCode: 'CRAFT-005',
            name: 'Lacquerware Jewelry Box',
            slug: 'lacquerware-jewelry-box',
            description: 'Beautiful lacquerware jewelry box featuring traditional Sri Lankan patterns in vibrant colors. Handcrafted from wood and coated with multiple layers of natural lacquer. Features a velvet-lined interior with compartments for organizing jewelry.',
            imageUrls: ['/images/products/lacquerware-box.jpg'],
            price: 3800.00,
            stockQuantity: 15,
            isFeatured: false,
            isUsed: false,
        },
    });

    // Link Products to Categories
    console.log('🔗 Linking products to categories...');

    // Rice products
    const riceProducts = [suwandel, kaluHeenati, pachchaPerumal, rathuHeenati, madathawalu];
    for (const product of riceProducts) {
        await prisma.productCategory.create({
            data: {
                productId: product.id,
                categoryId: riceCategory.id,
            },
        });
    }

    // Honey products
    const honeyProducts = [wildForestHoney, beeMeeHoney, cinnamonHoney, multiFloralHoney];
    for (const product of honeyProducts) {
        await prisma.productCategory.create({
            data: {
                productId: product.id,
                categoryId: honeyCategory.id,
            },
        });
    }

    // Art & Crafts products
    const craftProducts = [weavenBasket, coconutShellBowl, brassOilLamp, wovenMat, lacquerwareBox];
    for (const product of craftProducts) {
        await prisma.productCategory.create({
            data: {
                productId: product.id,
                categoryId: artCraftsCategory.id,
            },
        });
    }

    // Create some reviews
    console.log('⭐ Creating reviews...');

    await prisma.review.createMany({
        data: [
            {
                rating: 5,
                comment: 'Excellent quality rice! The aroma is amazing and it cooks perfectly every time.',
                productId: suwandel.id,
                userId: customerUser.id,
            },
            {
                rating: 5,
                comment: 'The best honey I have ever tasted. You can really tell it is pure and natural.',
                productId: wildForestHoney.id,
                userId: customerUser.id,
            },
            {
                rating: 4,
                comment: 'Beautiful craftsmanship. Makes a wonderful gift!',
                productId: weavenBasket.id,
                userId: customerUser.id,
            },
            {
                rating: 5,
                comment: 'Kalu Heenati is my favorite traditional rice. Great for my health!',
                productId: kaluHeenati.id,
                userId: customerUser.id,
            },
        ],
    });

    // Create a sample address for the customer
    console.log('📍 Creating sample address...');
    await prisma.address.create({
        data: {
            userId: customerUser.id,
            fullName: 'Kasun Perera',
            addressLine1: '123 Temple Road',
            addressLine2: 'Near Bo Tree',
            city: 'Kandy',
            district: 'Kandy',
            zipCode: '20000',
            phoneNumber: '+94771234567',
            isDefault: true,
        },
    });

    // Create newsletter subscriptions
    console.log('📧 Creating newsletter subscriptions...');
    await prisma.newsletterSubscription.createMany({
        data: [
            { email: 'subscriber1@example.com', source: 'homepage' },
            { email: 'subscriber2@example.com', source: 'footer' },
            { email: 'subscriber3@example.com', source: 'popup' },
        ],
    });

    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - 1 Admin user (admin@ranketha.lk / admin123)');
    console.log('   - 1 Customer user (kasun@example.com / customer123)');
    console.log('   - 3 Categories (Rice, Honey, Art & Crafts)');
    console.log('   - 5 Rice products');
    console.log('   - 4 Honey products');
    console.log('   - 5 Art & Crafts products');
    console.log('   - 4 Reviews');
    console.log('   - 1 Address');
    console.log('   - 3 Newsletter subscriptions');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
