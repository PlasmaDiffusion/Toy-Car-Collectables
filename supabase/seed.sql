-- ============================================================
-- DieCast Vault — seed data
-- Mirrors the static JSON in /data — safe to run multiple times.
-- Run via: supabase db seed  (or paste into the Supabase SQL editor)
-- ============================================================

-- ----------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------
INSERT INTO categories (id, name, slug, type, description, image_url) VALUES
  ('era-1950s-60s',      '1950s & 1960s',  'era-1950s-60s',      'era',         'The golden age of die-cast. Lesney, Dinky, and early Corgi pieces that started it all.',         '/images/cars/dinky-jaguar.svg'),
  ('era-1970s',          '1970s',           'era-1970s',           'era',         'Hot Wheels Redlines, Matchbox Superfast, and muscle-car mania in miniature.',                      '/images/cars/hw-firebird.svg'),
  ('era-1980s',          '1980s',           'era-1980s',           'era',         'Neon, cassette decks, and a wave of European diecast from Majorette and Siku.',                    '/images/cars/majorette-porsche.svg'),
  ('era-1990s',          '1990s',           'era-1990s',           'era',         'Treasure Hunts, Real Riders, and the collector''s-series boom.',                                   '/images/cars/hw-treasure-camaro.svg'),
  ('era-2000s-plus',     '2000s & Newer',   'era-2000s-plus',      'era',         'Premium lines, licensed replicas, and limited-edition modern releases.',                           '/images/cars/hw-ferrari.svg'),

  ('brand-hot-wheels',     'Hot Wheels',      'brand-hot-wheels',     'brand',       'The world''s best-selling toy car brand. Redlines, Flying Colors, Treasure Hunts, and beyond.',   '/images/cars/hw-mustang.svg'),
  ('brand-matchbox',       'Matchbox',        'brand-matchbox',       'brand',       'Lesney originals and Superfast era pieces — British heritage at 1:64.',                           '/images/cars/matchbox-challenger.svg'),
  ('brand-corgi',          'Corgi',           'brand-corgi',          'brand',       'Renowned for detailed interiors, opening features, and iconic movie tie-ins.',                    '/images/cars/corgi-aston.svg'),
  ('brand-johnny-lightning','Johnny Lightning','brand-johnny-lightning','brand',     'Topper Toys originals and the 1990s revival collector lines.',                                    '/images/cars/jl-toronado.svg'),
  ('brand-dinky',          'Dinky Toys',      'brand-dinky',          'brand',       'Meccano''s legendary British die-casts, sought after by serious collectors worldwide.',           '/images/cars/dinky-jaguar.svg'),
  ('brand-majorette',      'Majorette',       'brand-majorette',      'brand',       'French flair in miniature — excellent detail and robust construction.',                           '/images/cars/majorette-porsche.svg'),

  ('scale-164', '1:64 Scale', 'scale-164', 'scale', 'The classic pocket-size format — the standard for Hot Wheels and Matchbox.',                     '/images/cars/hw-mustang.svg'),
  ('scale-143', '1:43 Scale', 'scale-143', 'scale', 'Mid-size prestige format favoured by Corgi and Dinky for incredible detail.',                    '/images/cars/corgi-aston.svg'),
  ('scale-118', '1:18 Scale', 'scale-118', 'scale', 'Display-grade replicas with opening hoods, doors, and fine interior detail.',                    '/images/cars/hw-ferrari.svg'),

  ('type-muscle',   'Muscle Cars',      'type-muscle',   'vehicleType', 'Mustangs, Camaros, Challengers, Chargers — American horsepower frozen in metal.',          '/images/cars/hw-mustang.svg'),
  ('type-sports',   'Sports Cars',      'type-sports',   'vehicleType', 'Ferraris, Porsches, Aston Martins — European precision at collectible scale.',              '/images/cars/majorette-porsche.svg'),
  ('type-movie-tv', 'Movie & TV Cars',  'type-movie-tv', 'vehicleType', 'Batmobiles, Bond cars, and screen icons immortalised as die-cast.',                         '/images/cars/corgi-batmobile.svg'),

  ('condition-mib', 'Mint in Box', 'condition-mib', 'condition', 'Unplayed-with, original packaging intact. The pinnacle of collector condition.',          '/images/cars/hw-mustang.svg')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Toy Cars
-- ----------------------------------------------------------------
INSERT INTO toy_cars (id, name, brand, production_year, model_year, scale, condition, vehicle_type, material, price, images, description, facebook_marketplace_url, featured, tags) VALUES

  ('hw-1969-mustang-boss-redline',
   '1969 Ford Mustang Boss 429', 'Hot Wheels', 1969, 1969, '1:64', 'Mint in Box', 'Muscle Car', 'Diecast',
   285,
   ARRAY['/images/cars/hw-mustang.svg', '/images/cars/hw-mustang-alt.svg'],
   'First-year Hot Wheels Redline issue in Antifreeze yellow. Base still has the original rivets intact. The blister card is unpunched with brilliant colors and zero creasing. One of the most sought-after Redline Mustangs in this condition.',
   'https://www.facebook.com/marketplace/item/example-001',
   TRUE,
   ARRAY['redline', 'mustang', '1969', 'antifreeze', 'unpunched card']),

  ('matchbox-1970-challenger',
   '1970 Dodge Challenger', 'Matchbox', 1971, 1970, '1:64', 'Excellent', 'Muscle Car', 'Diecast',
   48,
   ARRAY['/images/cars/matchbox-challenger.svg'],
   'Matchbox Superfast #1 from the 1971 range in metallic red. The wheels show minimal play wear and the chrome is intact. Comes in the original Superfast box with only minor corner wear. A solid mid-grade example.',
   'https://www.facebook.com/marketplace/item/example-002',
   FALSE,
   ARRAY['superfast', 'challenger', 'dodge', 'muscle', '1971']),

  ('corgi-1966-aston-db5',
   '1966 Aston Martin DB5 — James Bond', 'Corgi', 1966, 1964, '1:43', 'Near Mint', 'Movie & TV', 'Diecast',
   320,
   ARRAY['/images/cars/corgi-aston.svg'],
   'Corgi #261 James Bond Aston Martin DB5 in silver birch with all working features: ejector seat, revolving number plates, extending bumper rams, and passenger-seat ejector intact. Original box with both inserts. A truly exceptional survivor example from the Goldfinger era.',
   NULL,
   TRUE,
   ARRAY['james bond', 'aston martin', 'goldfinger', 'spy car', 'corgi 261', 'near mint']),

  ('jl-1968-toronado',
   '1968 Oldsmobile Toronado Custom', 'Johnny Lightning', 1969, 1968, '1:64', 'Good', 'Muscle Car', 'Diecast',
   95,
   ARRAY['/images/cars/jl-toronado.svg'],
   'Topper Toys Johnny Lightning Custom Toronado in plum purple. A legitimate 1969 Topper original — one of the first eight Customs released. The paint shows expected play wear but no chips through to metal. Wheels still spin freely.',
   'https://www.facebook.com/marketplace/item/example-004',
   FALSE,
   ARRAY['topper', 'johnny lightning', '1969 original', 'toronado', 'custom', 'plum']),

  ('hw-1979-firebird-ta',
   '1979 Pontiac Firebird T/A', 'Hot Wheels', 1979, 1979, '1:64', 'Near Mint', 'Muscle Car', 'Diecast',
   38,
   ARRAY['/images/cars/hw-firebird.svg'],
   'Hot Wheels Flying Colors Firebird in black with the iconic gold Screaming Chicken hood graphic fully intact. Blackwall wheels with no flat spots. One of the strongest graphics in the Flying Colors run and an evergreen favourite.',
   'https://www.facebook.com/marketplace/item/example-005',
   TRUE,
   ARRAY['firebird', 'trans am', 'pontiac', 'flying colors', 'blackwall', 'screaming chicken']),

  ('hw-2003-ferrari-360',
   '2003 Ferrari 360 Modena', 'Hot Wheels', 2003, 1999, '1:18', 'Mint in Box', 'Sports Car', 'Diecast',
   145,
   ARRAY['/images/cars/hw-ferrari.svg'],
   'Hot Wheels 100% series Ferrari 360 Modena in rosso corsa red. Opening hood, doors, and engine cover. Real Riders rubber tyres. Limited to 25,000 pieces worldwide. Sealed in the premium box — never displayed.',
   NULL,
   FALSE,
   ARRAY['ferrari', '360 modena', '1:18', '100% series', 'real riders', 'limited']),

  ('dinky-1957-jaguar-xk120',
   '1957 Jaguar XK 120', 'Dinky Toys', 1957, 1949, '1:43', 'Good', 'Sports Car', 'Diecast',
   75,
   ARRAY['/images/cars/dinky-jaguar.svg'],
   'Dinky #157 Jaguar XK 120 Coupe in cream with red seats. Chassis in dark blue. Light rub marks to the sides and a few small chips visible under magnification, but overall a solid display piece. A genuine 1950s British classic.',
   'https://www.facebook.com/marketplace/item/example-007',
   FALSE,
   ARRAY['jaguar', 'xk120', 'dinky', '1957', 'british', 'pre-war style']),

  ('matchbox-1964-mercedes-230sl',
   '1964 Mercedes-Benz 230SL', 'Matchbox', 1964, 1963, '1:64', 'Near Mint', 'Sports Car', 'Diecast',
   60,
   ARRAY['/images/cars/matchbox-challenger.svg'],
   'Matchbox Regular Wheels #27 Mercedes-Benz 230SL in white with grey interior and yellow tinted windows. Original grey plastic wheels. Produced in the Lesney era during the early 1960s golden period. Comes in a Matchbox type D box with strong colours.',
   NULL,
   FALSE,
   ARRAY['mercedes', '230sl', 'lesney', 'regular wheels', '1964', 'german']),

  ('hw-1971-el-camino',
   '1971 Chevrolet El Camino', 'Hot Wheels', 1971, 1971, '1:64', 'Excellent', 'Truck & Van', 'Diecast',
   110,
   ARRAY['/images/cars/hw-firebird.svg'],
   'Hot Wheels Spoilers series El Camino in spectraflame orange. Redline wheels still show orange pinstripe. A surprisingly hard El Camino to find in this grade — the orange spectraflame is prone to fading but this example is vibrant.',
   'https://www.facebook.com/marketplace/item/example-009',
   FALSE,
   ARRAY['el camino', 'chevrolet', 'spoilers', 'spectraflame', 'redline', '1971']),

  ('majorette-1983-porsche-911',
   '1983 Porsche 911 SC', 'Majorette', 1983, 1978, '1:64', 'Excellent', 'Sports Car', 'Diecast',
   22,
   ARRAY['/images/cars/majorette-porsche.svg'],
   'Majorette #211 Porsche 911 SC in silver with opening doors and detailed engine compartment visible through the rear window. The French label is still readable on the base. A great entry-level piece from the 1980s European collector scene.',
   'https://www.facebook.com/marketplace/item/example-010',
   FALSE,
   ARRAY['porsche', '911', 'majorette', 'french', '1983', 'opening doors']),

  ('hw-1995-treasure-camaro',
   '1995 Hot Wheels Treasure Hunt ''67 Camaro', 'Hot Wheels', 1995, 1967, '1:64', 'Mint in Box', 'Muscle Car', 'Diecast',
   475,
   ARRAY['/images/cars/hw-treasure-camaro.svg'],
   'First-generation Treasure Hunt series ''67 Camaro — #9 of 12. The gold Treasure Hunt logo on the base is crisp. Card is unpunched with no yellowing or creasing. A defining piece of the modern Hot Wheels collector era and extremely difficult to find unpunched.',
   'https://www.facebook.com/marketplace/item/example-011',
   TRUE,
   ARRAY['treasure hunt', 'camaro', '1967', '1995', 'limited', 'first series', 'unpunched']),

  ('jl-2001-barracuda-white-lightning',
   '2001 Plymouth Barracuda ''70 White Lightning', 'Johnny Lightning', 2001, 1970, '1:64', 'Mint in Box', 'Muscle Car', 'Diecast',
   55,
   ARRAY['/images/cars/jl-toronado.svg'],
   'Johnny Lightning White Lightning variant ''70 Plymouth Barracuda in the chase chrome finish. Sealed in the original blister pack. White Lightning variants were randomly inserted 1-per-case in the Johnny Lightning Muscle Cars USA series.',
   NULL,
   FALSE,
   ARRAY['barracuda', 'plymouth', 'white lightning', 'chrome', 'chase', '2001']),

  ('corgi-1968-batmobile',
   '1968 Batman Batmobile', 'Corgi', 1968, 1966, '1:43', 'Good', 'Movie & TV', 'Diecast',
   195,
   ARRAY['/images/cars/corgi-batmobile.svg'],
   'Corgi #267 Batmobile from the Adam West TV series. Original black body with the red jet exhaust and gold trim all present. Chains and bat-ray projector intact. The box shows heavy wear and is split at one corner — model itself is a solid Grade 3.',
   'https://www.facebook.com/marketplace/item/example-013',
   TRUE,
   ARRAY['batmobile', 'batman', 'corgi 267', 'tv series', 'adam west', '1968']),

  ('hw-1975-hot-bird',
   '1975 Hot Wheels Hot Bird', 'Hot Wheels', 1975, 1975, '1:64', 'Excellent', 'Muscle Car', 'Diecast',
   42,
   ARRAY['/images/cars/hw-firebird.svg'],
   'Hot Wheels Blackwall era Hot Bird in tan with the Firebird tampo in excellent condition. The spoiler is present and unbroken — a common failure point for this casting. Blackwall wheels show minimal play use.',
   'https://www.facebook.com/marketplace/item/example-014',
   FALSE,
   ARRAY['hot bird', 'firebird', 'blackwall', '1975', 'tan', 'tampo']),

  ('hw-2010-charger-daytona',
   '2010 Dodge Charger Daytona ''69', 'Hot Wheels', 2010, 1969, '1:64', 'Near Mint', 'Race Car', 'Diecast',
   18,
   ARRAY['/images/cars/matchbox-challenger.svg'],
   'Hot Wheels ''69 Dodge Charger Daytona from the 2010 mainline in orange with the signature nose cone and rear wing. Spectraflame finish and Real Riders tyres on this premium release. A must for Mopar and NASCAR history fans.',
   NULL,
   FALSE,
   ARRAY['charger', 'daytona', 'dodge', 'mopar', 'nascar', 'nose cone', '1969']),

  ('hw-1988-camaro-iroc',
   '1988 Chevrolet Camaro IROC-Z', 'Hot Wheels', 1988, 1988, '1:64', 'Near Mint', 'Muscle Car', 'Diecast',
   28,
   ARRAY['/images/cars/hw-treasure-camaro.svg'],
   'Hot Wheels 1988 mainline IROC-Z in bright red with the iconic ''80s side tampos fully intact. Ultra-hots wheels in near-perfect condition. A great snapshot of the 1980s American muscle scene.',
   'https://www.facebook.com/marketplace/item/example-016',
   FALSE,
   ARRAY['camaro', 'iroc-z', '1988', 'ultra-hots', 'red', 'tampo']),

  ('matchbox-1982-rolls-royce',
   '1982 Rolls-Royce Silver Spirit', 'Matchbox', 1982, 1980, '1:64', 'Good', 'Classic', 'Diecast',
   15,
   ARRAY['/images/cars/matchbox-challenger.svg'],
   'Matchbox #39 Rolls-Royce Silver Spirit in silver with a tan interior. Light play wear and a small scuff to the rear quarter — easily overlooked at arm''s length. A classic British luxury car from the Superfast era.',
   NULL,
   FALSE,
   ARRAY['rolls-royce', 'silver spirit', 'matchbox', 'luxury', 'british', '1982']),

  ('hw-1993-ferrari-testarossa',
   '1993 Ferrari Testarossa', 'Hot Wheels', 1993, 1984, '1:64', 'Excellent', 'Sports Car', 'Diecast',
   32,
   ARRAY['/images/cars/hw-ferrari.svg'],
   'Hot Wheels 1993 mainline Ferrari Testarossa in red with detailed side strake tampo. Ultra-hots wheels and gold chrome windows. A popular casting that captures the Testarossa''s iconic wedge profile beautifully.',
   'https://www.facebook.com/marketplace/item/example-018',
   FALSE,
   ARRAY['ferrari', 'testarossa', '1993', 'red', 'ultra-hots', 'miami vice'])

ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- car_categories  (junction rows)
-- ----------------------------------------------------------------
INSERT INTO car_categories (car_id, category_id) VALUES
  -- 1969 Ford Mustang Boss 429
  ('hw-1969-mustang-boss-redline', 'era-1950s-60s'),
  ('hw-1969-mustang-boss-redline', 'brand-hot-wheels'),
  ('hw-1969-mustang-boss-redline', 'scale-164'),
  ('hw-1969-mustang-boss-redline', 'type-muscle'),
  ('hw-1969-mustang-boss-redline', 'condition-mib'),

  -- 1970 Dodge Challenger
  ('matchbox-1970-challenger', 'era-1970s'),
  ('matchbox-1970-challenger', 'brand-matchbox'),
  ('matchbox-1970-challenger', 'scale-164'),
  ('matchbox-1970-challenger', 'type-muscle'),

  -- 1966 Aston Martin DB5
  ('corgi-1966-aston-db5', 'era-1950s-60s'),
  ('corgi-1966-aston-db5', 'brand-corgi'),
  ('corgi-1966-aston-db5', 'scale-143'),
  ('corgi-1966-aston-db5', 'type-movie-tv'),
  ('corgi-1966-aston-db5', 'condition-mib'),

  -- 1968 Oldsmobile Toronado
  ('jl-1968-toronado', 'era-1950s-60s'),
  ('jl-1968-toronado', 'brand-johnny-lightning'),
  ('jl-1968-toronado', 'scale-164'),
  ('jl-1968-toronado', 'type-muscle'),

  -- 1979 Pontiac Firebird T/A
  ('hw-1979-firebird-ta', 'era-1970s'),
  ('hw-1979-firebird-ta', 'brand-hot-wheels'),
  ('hw-1979-firebird-ta', 'scale-164'),
  ('hw-1979-firebird-ta', 'type-muscle'),

  -- 2003 Ferrari 360 Modena
  ('hw-2003-ferrari-360', 'era-2000s-plus'),
  ('hw-2003-ferrari-360', 'brand-hot-wheels'),
  ('hw-2003-ferrari-360', 'scale-118'),
  ('hw-2003-ferrari-360', 'type-sports'),
  ('hw-2003-ferrari-360', 'condition-mib'),

  -- 1957 Jaguar XK 120
  ('dinky-1957-jaguar-xk120', 'era-1950s-60s'),
  ('dinky-1957-jaguar-xk120', 'brand-dinky'),
  ('dinky-1957-jaguar-xk120', 'scale-143'),
  ('dinky-1957-jaguar-xk120', 'type-sports'),

  -- 1964 Mercedes-Benz 230SL
  ('matchbox-1964-mercedes-230sl', 'era-1950s-60s'),
  ('matchbox-1964-mercedes-230sl', 'brand-matchbox'),
  ('matchbox-1964-mercedes-230sl', 'scale-164'),
  ('matchbox-1964-mercedes-230sl', 'type-sports'),

  -- 1971 Chevrolet El Camino
  ('hw-1971-el-camino', 'era-1970s'),
  ('hw-1971-el-camino', 'brand-hot-wheels'),
  ('hw-1971-el-camino', 'scale-164'),

  -- 1983 Porsche 911 SC
  ('majorette-1983-porsche-911', 'era-1980s'),
  ('majorette-1983-porsche-911', 'brand-majorette'),
  ('majorette-1983-porsche-911', 'scale-164'),
  ('majorette-1983-porsche-911', 'type-sports'),

  -- 1995 Treasure Hunt Camaro
  ('hw-1995-treasure-camaro', 'era-1990s'),
  ('hw-1995-treasure-camaro', 'brand-hot-wheels'),
  ('hw-1995-treasure-camaro', 'scale-164'),
  ('hw-1995-treasure-camaro', 'type-muscle'),
  ('hw-1995-treasure-camaro', 'condition-mib'),

  -- 2001 Plymouth Barracuda White Lightning
  ('jl-2001-barracuda-white-lightning', 'era-2000s-plus'),
  ('jl-2001-barracuda-white-lightning', 'brand-johnny-lightning'),
  ('jl-2001-barracuda-white-lightning', 'scale-164'),
  ('jl-2001-barracuda-white-lightning', 'type-muscle'),
  ('jl-2001-barracuda-white-lightning', 'condition-mib'),

  -- 1968 Batman Batmobile
  ('corgi-1968-batmobile', 'era-1950s-60s'),
  ('corgi-1968-batmobile', 'brand-corgi'),
  ('corgi-1968-batmobile', 'scale-143'),
  ('corgi-1968-batmobile', 'type-movie-tv'),

  -- 1975 Hot Bird
  ('hw-1975-hot-bird', 'era-1970s'),
  ('hw-1975-hot-bird', 'brand-hot-wheels'),
  ('hw-1975-hot-bird', 'scale-164'),
  ('hw-1975-hot-bird', 'type-muscle'),

  -- 2010 Dodge Charger Daytona
  ('hw-2010-charger-daytona', 'era-2000s-plus'),
  ('hw-2010-charger-daytona', 'brand-hot-wheels'),
  ('hw-2010-charger-daytona', 'scale-164'),

  -- 1988 Chevrolet Camaro IROC-Z
  ('hw-1988-camaro-iroc', 'era-1980s'),
  ('hw-1988-camaro-iroc', 'brand-hot-wheels'),
  ('hw-1988-camaro-iroc', 'scale-164'),
  ('hw-1988-camaro-iroc', 'type-muscle'),

  -- 1982 Rolls-Royce Silver Spirit
  ('matchbox-1982-rolls-royce', 'era-1980s'),
  ('matchbox-1982-rolls-royce', 'brand-matchbox'),
  ('matchbox-1982-rolls-royce', 'scale-164'),

  -- 1993 Ferrari Testarossa
  ('hw-1993-ferrari-testarossa', 'era-1990s'),
  ('hw-1993-ferrari-testarossa', 'brand-hot-wheels'),
  ('hw-1993-ferrari-testarossa', 'scale-164'),
  ('hw-1993-ferrari-testarossa', 'type-sports')

ON CONFLICT DO NOTHING;
