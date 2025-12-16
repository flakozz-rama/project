-- Demo user (password: demo123)
INSERT INTO users (email, name, password_hash) VALUES
('demo@gorent.com', 'Demo User', '$2a$10$demo_hash_placeholder')
ON CONFLICT DO NOTHING;

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
)
ON CONFLICT DO NOTHING;

-- Demo booking
INSERT INTO bookings (user_id, property_id, start_date, end_date, guests, status) VALUES
(1, 1, '2025-01-10', '2025-01-15', 2, 'confirmed')
ON CONFLICT DO NOTHING;

-- Demo conversation
INSERT INTO conversations (user_id, contact_name, contact_type, property_name) VALUES
(1, 'John Host', 'host', 'Modern Downtown Apartment')
ON CONFLICT DO NOTHING;

-- Demo messages
INSERT INTO messages (conversation_id, sender_id, text, read) VALUES
(1, NULL, 'Welcome! Let me know if you have any questions about the apartment.', TRUE),
(1, 1, 'Thanks! What time is check-in?', TRUE)
ON CONFLICT DO NOTHING;
