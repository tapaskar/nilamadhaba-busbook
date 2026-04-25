-- ============================================================
-- 006_more_cities.sql — expand city coverage to Odisha, West Bengal,
-- and a few more demand corridors. Idempotent — uses ON CONFLICT.
-- ============================================================

INSERT INTO public.cities (id, name, state, is_active) VALUES
  -- Odisha
  ('city-bbsr', 'Bhubaneswar',  'Odisha',          true),
  ('city-cuttack','Cuttack',    'Odisha',          true),
  ('city-puri',   'Puri',       'Odisha',          true),
  ('city-rkl',    'Rourkela',   'Odisha',          true),
  ('city-brm',    'Berhampur',  'Odisha',          true),
  ('city-sbp',    'Sambalpur',  'Odisha',          true),
  ('city-balasore','Balasore',  'Odisha',          true),

  -- West Bengal
  ('city-kol',    'Kolkata',    'West Bengal',     true),
  ('city-howrah', 'Howrah',     'West Bengal',     true),
  ('city-siliguri','Siliguri',  'West Bengal',     true),
  ('city-asansol','Asansol',    'West Bengal',     true),
  ('city-durgapur','Durgapur',  'West Bengal',     true),
  ('city-darjeeling','Darjeeling','West Bengal',   true),
  ('city-kgp',    'Kharagpur',  'West Bengal',     true),

  -- Northern + Eastern corridor connectors
  ('city-del',    'Delhi',      'Delhi',           true),
  ('city-jaipur', 'Jaipur',     'Rajasthan',       true),
  ('city-luc',    'Lucknow',    'Uttar Pradesh',   true),
  ('city-bnr',    'Varanasi',   'Uttar Pradesh',   true),
  ('city-pat',    'Patna',      'Bihar',           true),
  ('city-ranchi', 'Ranchi',     'Jharkhand',       true),
  ('city-gwh',    'Guwahati',   'Assam',           true),

  -- Southern + Western fillers
  ('city-tvm',    'Trivandrum', 'Kerala',          true),
  ('city-mdu',    'Madurai',    'Tamil Nadu',      true),
  ('city-trichy', 'Tiruchi',    'Tamil Nadu',      true),
  ('city-vij',    'Vijayawada', 'Andhra Pradesh',  true),
  ('city-rajahmundry','Rajahmundry','Andhra Pradesh', true),
  ('city-ahm',    'Ahmedabad',  'Gujarat',         true),
  ('city-srt',    'Surat',      'Gujarat',         true),
  ('city-nag',    'Nagpur',     'Maharashtra',     true)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, state = EXCLUDED.state, is_active = true;

-- ─── Seed common east-coast and connector routes ───────────────

INSERT INTO public.routes (id, origin_city_id, destination_city_id, distance_km, estimated_duration_minutes, is_active) VALUES
  -- Odisha hub: Bhubaneswar
  ('route-bbsr-puri',      'city-bbsr',     'city-puri',     65,   90,  true),
  ('route-bbsr-cuttack',   'city-bbsr',     'city-cuttack',  30,   45,  true),
  ('route-bbsr-rkl',       'city-bbsr',     'city-rkl',      350, 480,  true),
  ('city-bbsr-brm-route', 'city-bbsr',     'city-brm',      170, 240,  true),
  ('route-bbsr-vtz',       'city-bbsr',     'city-vtz',      440, 600,  true),

  -- Kolkata hub
  ('route-kol-bbsr',       'city-kol',      'city-bbsr',     440, 600,  true),
  ('route-kol-puri',       'city-kol',      'city-puri',     500, 660,  true),
  ('route-kol-siliguri',   'city-kol',      'city-siliguri', 570, 720,  true),
  ('route-kol-asansol',    'city-kol',      'city-asansol',  220, 270,  true),
  ('route-kol-darjeeling', 'city-kol',      'city-darjeeling',640, 780, true),
  ('route-kol-pat',        'city-kol',      'city-pat',      580, 720,  true),
  ('route-kol-ranchi',     'city-kol',      'city-ranchi',   410, 540,  true),
  ('route-kol-gwh',        'city-kol',      'city-gwh',      1020,1320, true),

  -- Northern corridor
  ('route-del-jaipur',     'city-del',      'city-jaipur',   280, 330,  true),
  ('route-del-luc',        'city-del',      'city-luc',      540, 660,  true),
  ('route-luc-bnr',        'city-luc',      'city-bnr',      320, 420,  true),
  ('route-bnr-pat',        'city-bnr',      'city-pat',      230, 330,  true),
  ('route-del-jaipur-rev', 'city-jaipur',   'city-del',      280, 330,  true),

  -- Western
  ('route-mum-pne',        'city-mum',      'city-pne',      150, 210,  true),
  ('route-mum-ahm',        'city-mum',      'city-ahm',      525, 600,  true),
  ('route-pne-nag',        'city-pne',      'city-nag',      720, 840,  true),

  -- Southern fillers
  ('route-chn-mdu',        'city-chn',      'city-mdu',      460, 540,  true),
  ('route-chn-trichy',     'city-chn',      'city-trichy',   325, 420,  true),
  ('route-blr-tvm',        'city-blr',      'city-tvm',      720, 840,  true),
  ('route-hyd-vij',        'city-hyd',      'city-vij',      275, 330,  true)
ON CONFLICT (id) DO UPDATE
  SET origin_city_id = EXCLUDED.origin_city_id,
      destination_city_id = EXCLUDED.destination_city_id,
      distance_km = EXCLUDED.distance_km,
      estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
      is_active = true;
