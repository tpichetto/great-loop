-- Seed data for landmarks table
-- Contains 10 diverse landmarks from around the world with various categories

BEGIN;

-- Insert sample users (for progress and comments)
INSERT INTO users (id, email, password_hash, first_name, last_name, avatar_url, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', 'https://example.com/avatar1.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'john@example.com', '$2a$10$YourHashedPasswordHere', 'John', 'Doe', 'https://example.com/avatar2.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333333', 'jane@example.com', '$2a$10$YourHashedPasswordHere', 'Jane', 'Smith', 'https://example.com/avatar3.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert 10 diverse landmarks with PostGIS geography points
INSERT INTO landmarks (id, name, description, latitude, longitude, location, category, image_urls, opening_hours, price_level, contact_info, rating, review_count, tags, created_at, updated_at) VALUES
-- Attraction
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Eiffel Tower', 'Iconic iron lattice tower in Paris, France, built for the 1889 World''s Fair. Experience breathtaking views of the city from the observation decks.', 48.858370, 2.294481, ST_GeogFromText('SRID=4326;POINT(2.294481 48.858370)'), 'attraction', ARRAY['https://example.com/eiffel1.jpg', 'https://example.com/eiffel2.jpg'], '{"summer": "09:30-23:45", "winter": "09:30-21:45"}', 3, '{"phone": "+33 892 70 12 39", "website": "https://www.toureiffel.paris"}', 4.7, 25434, ARRAY['iconic', 'romantic', 'architecture'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Park
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Central Park', 'Urban park in Manhattan, New York City. A sprawling green oasis with walking trails, lakes, and recreational facilities. Perfect for a day outdoors.', 40.782864, -73.965355, ST_GeogFromText('SRID=4326;POINT(-73.965355 40.782864)'), 'park', ARRAY['https://example.com/centralpark1.jpg'], '{"daily": "06:00-01:00"}', 0, '{"phone": "+1 212 310 6600", "website": "https://www.centralparknyc.org"}', 4.8, 45621, ARRAY['urban', 'recreation', 'nature'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Museum
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Louvre Museum', 'World''s largest art museum and historic monument in Paris. Home to the Mona Lisa and thousands of masterpieces.', 48.860611, 2.337644, ST_GeogFromText('SRID=4326;POINT(2.337644 48.860611)'), 'museum', ARRAY['https://example.com/louvre1.jpg'], '{"daily": "09:00-18:00", "closed": "Tuesday"}', 2, '{"phone": "+33 1 40 20 50 50", "website": "https://www.louvre.fr"}', 4.6, 32109, ARRAY['art', 'history', 'culture'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Restaurant (Times Square area)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Joe''s Pizza', 'Famous New York style pizza slice shop in Manhattan. A classic NYC institution serving authentic thin-crust pizza since 1975.', 40.758896, -73.985130, ST_GeogFromText('SRID=4326;POINT(-73.985130 40.758896)'), 'restaurant', ARRAY['https://example.com/joes1.jpg'], '{"daily": "11:00-04:00"}', 1, '{"phone": "+1 212-366-1182", "website": "https://www.joespizza.nyc"}', 4.5, 8956, ARRAY['pizza', 'newyork', 'casual'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Nature (Grand Canyon)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Grand Canyon', 'Massive canyon in Arizona, USA, carved by the Colorado River. A spectacular natural wonder with stunning vistas and hiking trails.', 36.106965, -112.112997, ST_GeogFromText('SRID=4326;POINT(-112.112997 36.106965)'), 'nature', ARRAY['https://example.com/grandcanyon1.jpg', 'https://example.com/grandcanyon2.jpg', 'https://example.com/grandcanyon3.jpg'], '{"summer": "24 hours", "winter": "08:00-17:00"}', 0, '{"phone": "+1 928 638 7878", "website": "https://www.nps.gov/grca"}', 4.9, 12847, ARRAY['hiking', 'scenic', 'adventure'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Entertainment (Disneyland)
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Disneyland', 'The happiest place on Earth! Magic Kingdom theme park in Anaheim, California featuring classic Disney characters and attractions.', 33.812092, -117.918976, ST_GeogFromText('SRID=4326;POINT(-117.918976 33.812092)'), 'entertainment', ARRAY['https://example.com/disneyland1.jpg'], '{"daily": "08:00-22:00"}', 4, '{"phone": "+1 714-781-4565", "website": "https://www.disneyland.com"}', 4.8, 25678, ARRAY['family', 'theme-park', 'magic'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Shopping (Fifth Avenue)
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Fifth Avenue', 'Iconic shopping street in Manhattan, New York. Luxury flagship stores, department stores, and flagship boutiques line this famous avenue.', 40.774082, -73.964355, ST_GeogFromText('SRID=4326;POINT(-73.964355 40.774082)'), 'shopping', ARRAY['https://example.com/fifth1.jpg'], '{"stores": "10:00-20:00"}', 3, '{"phone": null, "website": "https://www.fifthavenue.nyc"}', 4.4, 5623, ARRAY['luxury', 'shopping', 'nyc'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Historic (Pyramids of Giza)
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Pyramids of Giza', 'Ancient pyramid complex on the Giza Plateau in Egypt. The last surviving wonder of the ancient world.', 29.979167, 31.134167, ST_GeogFromText('SRID=4326;POINT(31.134167 29.979167)'), 'historic', ARRAY['https://example.com/pyramids1.jpg'], '{"daily": "08:00-17:00"}', 2, '{"phone": "+20 2 3389 1992", "website": "https://www.antiquities.gov.eg"}', 4.8, 9876, ARRAY['ancient', 'wonder', 'egypt'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Nature (Victoria Falls)
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Victoria Falls', 'World''s largest waterfall on the Zambezi River, border of Zambia and Zimbabwe. A spectacular sight with thundering water and mist.', -17.924298, 25.857152, ST_GeogFromText('SRID=4326;POINT(25.857152 -17.924298)'), 'nature', ARRAY['https://example.com/victoria1.jpg'], '{"daily": "06:00-18:00"}', 1, '{"phone": "+260 21 125 5000", "website": "https://www.zambiatourism.com"}', 4.9, 6789, ARRAY['waterfall', 'adventure', 'africa'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Attraction (Sydney Opera House)
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Sydney Opera House', 'Multi-venue performing arts center in Sydney, Australia. Iconic 20th-century architecture and cultural hub.', -33.856784, 151.215297, ST_GeogFromText('SRID=4326;POINT(151.215297 -33.856784)'), 'attraction', ARRAY['https://example.com/sydney1.jpg'], '{"daily": "09:00-17:00", "backstage_tours": "10:00-16:00"}', 3, '{"phone": "+61 2 9250 7111", "website": "https://www.sydneyoperahouse.com"}', 4.7, 5432, ARRAY['architecture', 'performing-arts', 'sydney'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample user progress
INSERT INTO user_progress (id, user_id, landmark_id, visited_at, status, notes, created_at) VALUES
('llllllll-llll-llll-llll-llllllllllll', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-02-15 10:30:00', 'visited', 'Amazing view from the top!', CURRENT_TIMESTAMP),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-03-20 14:00:00', 'completed', 'Absolutely breathtaking sunrise.', CURRENT_TIMESTAMP),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10 11:00:00', 'discovered', 'Planning a trip soon', CURRENT_TIMESTAMP)
ON CONFLICT (user_id, landmark_id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (id, user_id, landmark_id, content, rating, helpful_count, is_public, created_at, updated_at) VALUES
('oooooooo-oooo-oooo-oooo-oooooooooooo', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Eiffel Tower is absolutely stunning at night! Highly recommend visiting during the golden hour.', 5, 42, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'The Grand Canyon is a must-see. The South Rim offers the best views for first-time visitors.', 5, 128, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'The Louvre houses incredible art. Give yourself at least half a day to explore.', 5, 89, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Central Park is an urban oasis. Rent a bike to explore efficiently, and don''t miss Belvedere Castle.', 4, 56, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert sample refresh tokens (for JWT rotation testing)
INSERT INTO refresh_tokens (id, user_id, token, expires_at, revoked, created_at) VALUES
('ssssssss-ssss-ssss-ssss-ssssssssssss', '11111111-1111-1111-1111-111111111111', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_token_1', CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '22222222-2222-2222-2222-222222222222', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_token_2', CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

COMMIT;
