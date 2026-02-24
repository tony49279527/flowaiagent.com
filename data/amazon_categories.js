// Amazon Product Taxonomy Data (Expanded)
// This is a comprehensive static subset of Amazon's massive taxonomy.
// It covers major departments and high-frequency subcategories.

const amazonCategories = {
    "Appliances": {
        "Refrigerators": ["French Door Refrigerators", "Side-by-Side Refrigerators", "Top-Freezer Refrigerators", "Compact Refrigerators", "Beverage Refrigerators"],
        "Laundry Appliances": ["Washers", "Dryers", "Stacked Washer & Dryer Units"],
        "Dishwashers": ["Built-In Dishwashers", "Portable Dishwashers", "Countertop Dishwashers"],
        "Ovens & Cooktops": ["Ranges", "Cooktops", "Wall Ovens", "Microwaves", "Range Hoods"],
        "Ice Makers": ["Countertop Ice Makers", "Built-In Ice Makers"]
    },
    "Arts, Crafts & Sewing": {
        "Painting, Drawing & Art Supplies": ["Painting", "Drawing", "Art Paper", "Easels", "Brushes"],
        "Beading & Jewelry Making": ["Beads", "Charms", "Jewelry Findings", "Beading Tools"],
        "Fabric": ["Cotton Fabric", "Felt", "Fleece", "Upholstery Fabric"],
        "Needlework": ["Embroidery", "Cross Stitch", "Knitting & Crochet", "Needlepoint"],
        "Sewing": ["Sewing Machines", "Thread", "Trim & Embellishments", "Sewing Tools"],
        "Scrapbooking & Stamping": ["Albums", "Paper", "Stickers", "Stamps & Ink Pads"]
    },
    "Automotive": {
        "Car Care": ["Exterior Care", "Interior Care", "Car Wash Equipment", "Cleaning Tools"],
        "Car Electronics & Accessories": ["Car Audio", "Car Video", "Car Safety & Security", "GPS units"],
        "Exterior Accessories": ["Covers", "Deflectors & Shields", "Running Boards & Steps", "Towing Products"],
        "Interior Accessories": ["Floor Mats & Cargo Liners", "Seat Covers", "Steering Wheel Covers", "Console Organizers"],
        "Lights & Lighting Accessories": ["Headlight Assemblies", "Bulbs", "Light Bars", "Tail Light Assemblies"],
        "Oils & Fluids": ["Motor Oils", "Additives", "Antifreeze & Coolant", "Brake Fluids"],
        "Performance Parts & Accessories": ["Exhaust Systems", "engine Parts", "Filters", "Ignition & Electrical"],
        "Replacement Parts": ["Brake System", "Body & Trim", "Filters", "Lighting", "Wiper Blades"],
        "Tires & Wheels": ["Tires", "Wheels", "Tire & Wheel Tools", "Accessories"]
    },
    "Baby": {
        "Activity & Entertainment": ["Walkers", "Jumpers", "Swings", "Playmats & Floor Gyms"],
        "Apparel & Accessories": ["Baby Boys", "Baby Girls"],
        "Baby Care": ["Bathing", "Grooming", "Health", "Skin Care"],
        "Car Seats & Accessories": ["Car Seats", "Car Seat Accessories", "Travel Systems"],
        "Diapering": ["Diapers", "Wipes", "Diaper Bags", "Changing Tables"],
        "Feeding": ["Bottle Feeding", "Breastfeeding", "Highchairs", "Solid Feeding"],
        "Nursery": ["Furniture", "Bedding", "Decor", "Storage & Organization"],
        "Potty Training": ["Potties", "Step Stools", "Training Pants"],
        "Strollers & Accessories": ["Strollers", "Stroller Accessories"]
    },
    "Beauty & Personal Care": {
        "Makeup": ["Face", "Eyes", "Lips", "Makeup Sets", "Makeup Tools & Accessories"],
        "Skin Care": ["Face", "Eyes", "Lip Care", "Body", "Sunscreens"],
        "Hair Care": ["Shampoo & Conditioner", "Styling Products", "Hair Loss Products", "Hair Color"],
        "Fragrance": ["Women's", "Men's", "Children's", "Sets"],
        "Tools & Accessories": ["Hair Styling Tools", "Makeup Brushes & Tools", "Skin Care Tools", "Mirrors"],
        "Personal Care": ["Deodorants", "Oral Care", "Shaving & Hair Removal", "Feminine Care"],
        "Foot, Hand & Nail Care": ["Nail Polish", "Nail Art", "Tools & Accessories", "Foot & Hand Care"]
    },
    "Books": {
        "Arts & Photography": ["Architecture", "Art", "Design", "Photography"],
        "Biographies & Memoirs": ["Arts & Literature", "Historical", "Leaders & Notable People"],
        "Business & Money": ["Economics", "Management & Leadership", "Marketing & Sales", "Investing"],
        "Children's Books": ["Animals", "Education", "Literature & Fiction", "Science Fiction & Fantasy"],
        "Computers & Technology": ["Programming", "Computer Science", "Software"],
        "Cookbooks, Food & Wine": ["Baking", "Regional & International", "Special Diet"],
        "Health, Fitness & Dieting": ["Alternative Medicine", "Diets & Weight Loss", "Exercise & Fitness"],
        "History": ["Ancient", "Medieval", "Modern", "Military"],
        "Literature & Fiction": ["Contemprary", "Classics", "Action & Adventure"],
        "Mystery, Thriller & Suspense": ["Mystery", "Thriller", "Suspense"],
        "Romance": ["Contemporary", "Historical", "Paranormal"],
        "Science & Math": ["Biological Sciences", "Chemistry", "Mathematics", "Physics"],
        "Sci-Fi & Fantasy": ["Science Fiction", "Fantasy"],
        "Self-Help": ["Personal Transformation", "Relationships", "Success"]
    },
    "Camera & Photo": {
        "Cameras": ["Digital SLR Cameras", "Mirrorless Cameras", "Point & Shoot Digital Cameras", "Instant Cameras"],
        "Lenses": ["Camera Lenses", "Lens Accessories"],
        "Accessories": ["Bags & Cases", "Batteries & Chargers", "Tripods & Monopods", "Memory Cards"],
        "Lighting & Studio": ["Lighting", "Backdrops", "Photo Studio Accessories"],
        "Video Surveillance": ["Surveillance Cameras", "Surveillance Systems"]
    },
    "Cell Phones & Accessories": {
        "Cell Phones": ["Unlocked Cell Phones", "Carrier Cell Phones", "Prepaid Cell Phones"],
        "Cases, Holsters & Sleeves": ["Basic Cases", "Holsters", "Sleeves", "Flip Cases"],
        "Accessories": ["Screen Protectors", "Chargers", "Cables", "Power Banks", "Headsets"],
        "Smartwatches & Accessories": ["Smartwatches", "Smartwatch Accessories"]
    },
    "Clothing, Shoes & Jewelry": {
        "Women": ["Clothing", "Shoes", "Jewelry", "Watches", "Hanbags"],
        "Men": ["Clothing", "Shoes", "Jewelry", "Watches"],
        "Girls": ["Clothing", "Shoes", "Jewelry", "Watches"],
        "Boys": ["Clothing", "Shoes", "Jewelry", "Watches"],
        "Baby": ["Baby Boys", "Baby Girls"]
    },
    "Computers & Accessories": {
        "Computers & Tablets": ["Laptops", "Desktops", "Tablets", "2-in-1 Laptops"],
        "Computer Accessories": ["Keyboards & Mice", "Laptop Accessories", "Cables", "Audio & Video Accessories"],
        "Computer Components": ["Processors", "Motherboards", "Memory", "Storage", "Graphics Cards", "Power Supplies"],
        "Data Storage": ["External Hard Drives", "USB Flash Drives", "Memory Cards", "Internal Hard Drives"],
        "Monitors": ["Gaming Monitors", "Curved Monitors", "4K Monitors"],
        "Networking Products": ["Routers", "Modems", "Network Adapters", "Switches"],
        "Printers & Ink": ["Printers", "Ink & Toner", "3D Printers"]
    },
    "Electronics": {
        "Accessories & Supplies": ["Audio & Video Accessories", "Cables", "Batteries"],
        "Headphones": ["Earbud & In-Ear", "Over-Ear", "On-Ear", "Wireless"],
        "Home Audio": ["Speakers", "Receivers & Amplifiers", "Home Theater Systems"],
        "Television & Video": ["Televisions", "Streaming Media Players", "Projectors", "Blue-ray Players"],
        "Wearable Technology": ["Fitness Trackers", "Smartwatches", "Virtual Reality"]
    },
    "Grocery & Gourmet Food": {
        "Beverages": ["Coffee", "Tea", "Water", "Soft Drinks", "Sports Drinks"],
        "Breakfast Foods": ["Cereal", "Breakfast Bars", "Pancakes & Waffles", "Oatmeal"],
        "Canned & Packaged Foods": ["Canned Meat", "Canned Vegetables", "Canned Fruit", "Packaged Meals"],
        "Snack Foods": ["Chips", "Cookies", "Crackers", "Popcorn", "Nuts & Seeds"],
        "Pantry Staples": ["Cooking & Baking", "Herbs, Spices & Seasonings", "Pasta & Noodles", "Soups, Stocks & Broths"]
    },
    "Health & Household": {
        "Health Care": ["First Aid", "Pain Relievers", "Sleep Aids", "Respiratory Aids"],
        "Household Supplies": ["Cleaning Supplies", "Paper Products", "Trash Bags", "Laundry"],
        "Medical Supplies & Equipment": ["Braces", "Splints & Supports", "Mobility Aids"],
        "Nutrition & Wellness": ["Vitamins & Supplements", "Sports Nutrition", "Weight Loss"],
        "Oral Care": ["Toothbrushes", "Toothpaste", "Floss", "Mouthwash"],
        "Sexual Wellness": ["Safer Sex", "Adult Toys"]
    },
    "Home & Kitchen": {
        "Bath": ["Bath Towels", "Bathroom Accessories", "Bathroom Rugs"],
        "Bedding": ["Bed Sheets", "Comforters & Sets", "Pillows", "Mattress Pads & Toppers"],
        "Furniture": ["Bedroom Furniture", "Living Room Furniture", "Kitchen & Dining Furniture", "Office Furniture"],
        "Home Mini": ["Curtains", "Rugs", "Wall Art", "Lighting", "Clocks"],
        "Kitchen & Dining": ["Cookware", "Bakeware", "Kitchen Utensils & Gadgets", "Small Appliances", "Tableware"],
        "Storage & Organization": ["Closet Storage", "Kitchen Storage", "Garage Storage", "Laundry Storage"],
        "Heating, Cooling & Air Quality": ["Air Conditioners", "Heaters", "Fans", "Air Purifiers", "Dehumidifiers"],
        "Irons & Steamers": ["Irons", "Steamers", "Ironing Boards"],
        "Vacuums & Floor Care": ["Vacuums", "Carpet Cleaners", "Steam Mops", "Robot Vacuums"]
    },
    "Industrial & Scientific": {
        "Abrasive & Finishing Products": ["Abrasives", "Finishing"],
        "Additive Manufacturing": ["3D Printers", "3D Printing Filament"],
        "Lab & Scientific Products": ["Lab Equipment", "Lab Supplies", "Life Science Supplies"],
        "Occupational Health & Safety": ["Safety Apparel", "Signs & Signals"],
        "Test, Measure & Inspect": ["Temperature & Humidity", "Electrical Testing", "Dimensional Measurement"]
    },
    "Luggage & Travel Gear": {
        "Luggage": ["Carry-Ons", "Checked Luggage", "Luggage Sets"],
        "Backpacks": ["Casual Daypacks", "Laptop Backpacks", "Hiking Backpacks"],
        "Accessories": ["Travel Accessories", "Umbrellas", "Packing Organizers"]
    },
    "Office Products": {
        "Office Electronics": ["Calculators", "Printers", "Shredders", "Scanners"],
        "Office Furniture & Lighting": ["Chairs & Sofas", "Desks & Workstations", "Carts & Stands", "Lighting"],
        "Office Supplies": ["Desk Accessories", "Paper", "Writing & Correction", "Tape, Adhesives & Fasteners", "Filing Products"]
    },
    "Patio, Lawn & Garden": {
        "Garden & Lawn Care": ["Gardening Tools", "Watering Equipment", "Plant Care"],
        "Outdoor Décor": ["Outdoor Rugs", "Lighting", "Flags"],
        "Outdoor Furniture": ["Patio Furniture Sets", "Chairs", "Tables", "Umbrellas"],
        "Grills & Outdoor Cooking": ["Gas Grills", "Charcoal Grills", "Smokers", "Grilling Accessories"],
        "Generators & Portable Power": ["Generators", "Solar Power"]
    },
    "Pet Supplies": {
        "Dogs": ["Food", "Treats", "Toys", "Beds", "Collars & Leashes", "Clothing"],
        "Cats": ["Food", "Treats", "Litter & Housebreaking", "Toys", "Beds"],
        "Fish & Aquatic Pets": ["Aquariums", "Food", "Cleaning"],
        "Birds": ["Cages", "Food", "Toys"],
        "Small Animals": ["Cages", "Food", "Toys", "Bedding"]
    },
    "Sports & Outdoors": {
        "Exercise & Fitness": ["Cardio Training", "Strength Training", "Yoga", "Accessories"],
        "Hunting & Fishing": ["Hunting", "Fishing", "Tactical & Personal Defense"],
        "Team Sports": ["Basketball", "Baseball", "Football", "Soccer"],
        "Outdoor Recreation": ["Camping & Hiking", "Cycling", "Water Sports", "Winter Sports"],
        "Sports Clothing": ["Men", "Women", "Boys", "Girls"]
    },
    "Tools & Home Improvement": {
        "Appliances": ["Large Appliances", "Small Appliances"],
        "Building Supplies": ["HVAC", "Building Materials"],
        "Electrical": ["Breakers", "Outlets", "Switches"],
        "Hardware": ["Cabinet Hardware", "Door Hardware", "Nails & Screws"],
        "Kitchen & Bath Fixtures": ["Kitchen Faucets", "Kitchen Sinks", "Bathroom Faucets", "Bathroom Sinks", "Toilets", "Showerheads"],
        "Light Bulbs": ["LED Bulbs", "Incandescent Bulbs", "Fluorescent Tubes"],
        "Lighting & Ceiling Fans": ["Ceiling Lights", "Outdoor Lighting", "Ceiling Fans", "Lamps"],
        "Power & Hand Tools": ["Power Tools", "Hand Tools", "Tool Storage"],
        "Safety & Security": ["Home Security Systems", "Alarms", "Safes"]
    },
    "Toys & Games": {
        "Action Figures & Statues": ["Action Figures", "Playsets"],
        "Arts & Crafts": ["Drawing & Painting", "Craft Kits"],
        "Building Toys": ["Building Sets", "Stacking Blocks"],
        "Dolls & Accessories": ["Dolls", "Dollhouses"],
        "Games": ["Board Games", "Card Games"],
        "Learning & Education": ["Science Kits", "Reading & Writing"],
        "Puzzles": ["Jigsaw Puzzles", "3D Puzzles"],
        "Vehicles": ["Toy Cars", "Remote Control Vehicles"]
    },
    "Video Games": {
        "PlayStation 5": ["Consoles", "Games", "Accessories"],
        "PlayStation 4": ["Consoles", "Games", "Accessories"],
        "Xbox Series X & S": ["Consoles", "Games", "Accessories"],
        "Xbox One": ["Consoles", "Games", "Accessories"],
        "Nintendo Switch": ["Consoles", "Games", "Accessories"],
        "PC Gaming": ["Laptops", "Desktops", "Monitors", "Accessories", "Components"]
    }
};

// Make it available globally if loaded in browser
if (typeof window !== 'undefined') {
    window.amazonCategories = amazonCategories;
}

// Export for node if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = amazonCategories;
}
