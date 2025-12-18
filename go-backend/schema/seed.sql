-- Demo user (password: demo123)
INSERT INTO users (email, name, password_hash, role) VALUES
('demo@gorent.com', 'Demo User', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user')
ON CONFLICT (email) DO NOTHING;

-- Admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role) VALUES
('admin@gorent.com', 'Admin User', '$2a$10$rPrF4cHvT6TvJxmKv8Y4.OX8K9K1Lq8VQ6Q1zfxQZT7sQzKK.6Vhe', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Demo properties
INSERT INTO properties (title, location, price_per_night, rating, reviews, guests, bedrooms, bathrooms, type, amenities, image, owner_id) VALUES
(
    'Modern Downtown Apartment',
    'San Francisco, CA',
    150.00,
    4.8,
    124,
    4,
    2,
    1,
    'apartment',
    ARRAY['wifi', 'parking', 'ac', 'kitchen'],
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    1
),
(
    'Luxury Villa with Ocean View',
    'Malibu, CA',
    450.00,
    4.9,
    89,
    8,
    4,
    3,
    'villa',
    ARRAY['wifi', 'pool', 'parking', 'ac', 'kitchen', 'gym'],
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    1
),
(
    'Cozy Mountain Cabin',
    'Lake Tahoe, CA',
    200.00,
    4.7,
    56,
    6,
    3,
    2,
    'cabin',
    ARRAY['wifi', 'fireplace', 'parking', 'kitchen', 'hot_tub'],
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
    1
),
(
    'Beachfront Condo',
    'Santa Monica, CA',
    280.00,
    4.6,
    78,
    4,
    2,
    2,
    'condo',
    ARRAY['wifi', 'pool', 'parking', 'ac', 'kitchen', 'beach_access'],
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    2
);

-- Demo booking (30 days from now)
INSERT INTO bookings (user_id, property_id, start_date, end_date, guests, status) VALUES
(1, 1, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '35 days', 2, 'confirmed');

-- Pending booking (for testing expiry worker)
INSERT INTO bookings (user_id, property_id, start_date, end_date, guests, status) VALUES
(1, 2, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', 4, 'pending');

-- Demo conversation
INSERT INTO conversations (user_id, contact_name, contact_type, property_name) VALUES
(1, 'John Host', 'host', 'Modern Downtown Apartment');

-- Demo messages
INSERT INTO messages (conversation_id, sender_id, text, read) VALUES
(1, NULL, 'Welcome! Let me know if you have any questions about the apartment.', TRUE),
(1, 1, 'Thanks! What time is check-in?', TRUE);
