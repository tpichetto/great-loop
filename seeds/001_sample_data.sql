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
INSERT INTO landmarks (id, name, description, latitude, longitude, location, category, image_urls, opening_hours, admission_fee, contact_info, created_at, updated_at) VALUES
-- Historical landmarks
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Eiffel Tower', 'Iconic iron lattice tower in Paris, France, built for the 1889 World''s Fair.', 48.858370, 2.294481, ST_GeogFromText('SRID=4326;POINT(2.294481 48.858370)'), 'historical', ARRAY['https://example.com/eiffel1.jpg', 'https://example.com/eiffel2.jpg'], '{"summer": "09:30-23:45", "winter": "09:30-21:45"}', 28.00, '{"phone": "+33 892 70 12 39", "website": "https://www.toureiffel.paris"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Great Wall of China', 'Ancient series of fortifications built across northern China.', 40.431908, 116.570374, ST_GeogFromText('SRID=4326;POINT(116.570374 40.431908)'), 'historical', ARRAY['https://example.com/greatwall1.jpg'], '{"summer": "07:30-17:30", "winter": "08:00-16:30"}', 10.00, '{"phone": "+86 10 6162 6505", "website": "http://www.greatwall.com.cn"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Natural landmarks
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Grand Canyon', 'Massive canyon in Arizona, USA, carved by the Colorado River.', 36.106965, -112.112997, ST_GeogFromText('SRID=4326;POINT(-112.112997 36.106965)'), 'natural', ARRAY['https://example.com/grandcanyon1.jpg', 'https://example.com/grandcanyon2.jpg', 'https://example.com/grandcanyon3.jpg'], '{"summer": "24 hours", "winter": "08:00-17:00"}', 35.00, '{"phone": "+1 928 638 7878", "website": "https://www.nps.gov/grca"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Victoria Falls', 'World''s largest waterfall on the Zambezi River, border of Zambia and Zimbabwe.', -17.924298, 25.857152, ST_GeogFromText('SRID=4326;POINT(25.857152 -17.924298)'), 'natural', ARRAY['https://example.com/victoria1.jpg'], '{"summer": "06:00-18:00", "winter": "07:00-17:00"}', 30.00, '{"phone": "+260 21 125 5000", "website": "https://www.zambiatourism.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Cultural landmarks
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Taj Mahal', 'White marble mausoleum in Agra, India, built by Mughal Emperor Shah Jahan.', 27.175015, 78.042142, ST_GeogFromText('SRID=4326;POINT(78.042142 27.175015)'), 'cultural', ARRAY['https://example.com/taj1.jpg'], '{"summer": "06:00-19:00", "winter": "06:00-18:00"}', 50.00, '{"phone": "+91 562 222 3961", "website": "https://asi.nic.in"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Machu Picchu', '15th-century Inca citadel in the Andes Mountains of Peru.', -13.163142, -72.545000, ST_GeogFromText('SRID=4326;POINT(-72.545000 -13.163142)'), 'cultural', ARRAY['https://example.com/machu1.jpg'], '{"summer": "06:00-17:30", "winter": "06:00-16:00"}', 70.00, '{"phone": "+51 84 582 030", "website": "https://www.cultura.gob.pe"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Architectural landmarks
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Sydney Opera House', 'Multi-venue performing arts center in Sydney, Australia.', -33.856784, 151.215297, ST_GeogFromText('SRID=4326;POINT(151.215297 -33.856784)'), 'architectural', ARRAY['https://example.com/sydney1.jpg'], '{"daily": "09:00-17:00", "backstage_tours": "10:00-16:00"}', 47.00, '{"phone": "+61 2 9250 7111", "website": "https://www.sydneyoperahouse.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Burj Khalifa', 'Tallest building in the world, located in Dubai, UAE.', 25.197197, 55.274376, ST_GeogFromText('SRID=4326;POINT(55.274376 25.197197)'), 'architectural', ARRAY['https://example.com/burj1.jpg'], '{"daily": "08:30-23:00"}', 169.00, '{"phone": "+971 4 888 8822", "website": "https://www.burjkhalifa.ae"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Recreational landmarks
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Central Park', 'Urban park in Manhattan, New York City, USA.', 40.782864, -73.965355, ST_GeogFromText('SRID=4326;POINT(-73.965355 40.782864)'), 'recreational', ARRAY['https://example.com/centralpark1.jpg'], '{"daily": "06:00-01:00"}', 0.00, '{"phone": "+1 212 310 6600", "website": "https://www.centralparknyc.org"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Niagara Falls', 'Group of three waterfalls on the US-Canada border.', 43.096213, -79.037720, ST_GeogFromText('SRID=4326;POINT(-79.037720 43.096213)'), 'recreational', ARRAY['https://example.com/niagara1.jpg', 'https://example.com/niagara2.jpg'], '{"daily": "24 hours"}', 0.00, '{"phone": "+1 716 278 1798", "website": "https://www.niagarafallsinfo.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Additional landmark for good measure
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Pyramids of Giza', 'Ancient pyramid complex on the Giza Plateau in Egypt.', 29.979167, 31.134167, ST_GeogFromText('SRID=4326;POINT(31.134167 29.979167)'), 'historical', ARRAY['https://example.com/pyramids1.jpg'], '{"daily": "08:00-17:00"}', 60.00, '{"phone": "+20 2 3389 1992", "website": "https://www.antiquities.gov.eg"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample user progress
INSERT INTO user_progress (id, user_id, landmark_id, visited_at, status, notes, created_at) VALUES
('llllllll-llll-llll-llll-llllllllllll', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-02-15 10:30:00', 'visited', 'Amazing view from the top!', CURRENT_TIMESTAMP),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-03-20 14:00:00', 'completed', 'Absolutely breathtaking sunrise.', CURRENT_TIMESTAMP),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-10 11:00:00', 'discovered', 'Planning a trip soon', CURRENT_TIMESTAMP)
ON CONFLICT (user_id, landmark_id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (id, user_id, landmark_id, content, rating, helpful_count, is_public, created_at, updated_at) VALUES
('oooooooo-oooo-oooo-oooo-oooooooooooo', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Eiffel Tower is absolutely stunning at night! Highly recommend visiting during the golden hour.', 5, 42, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'The Grand Canyon is a must-see. The South Rim offers the best views for first-time visitors.', 5, 128, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'The Taj Mahal is even more beautiful in person. Visit early morning to avoid crowds and catch the sunrise reflecting on the marble.', 5, 89, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '33333333-3333-3333-3333-333333333333', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Central Park is an urban oasis. Rent a bike to explore efficiently, and don''t miss Belvedere Castle.', 4, 56, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert sample refresh tokens (for JWT rotation testing)
INSERT INTO refresh_tokens (id, user_id, token, expires_at, revoked, created_at) VALUES
('ssssssss-ssss-ssss-ssss-ssssssssssss', '11111111-1111-1111-1111-111111111111', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEiLCJpYXQiOjE3MTg3NTM2NjgsImV4cCI6MTcxODgzOTQ2OH0.example_token_1', CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '22222222-2222-2222-2222-222222222222', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMiLCJpYXQiOjE3MTg3NTM3MDksImV4cCI6MTcxODgzOTUwOX0.example_token_2', CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

COMMIT;
