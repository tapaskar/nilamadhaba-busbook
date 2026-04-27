-- ============================================================
-- 007_fare_policy.sql — fare/refund policy settings + IST timezone
-- ============================================================
-- All booking-flow money values that used to be hardcoded in the
-- frontend now live here. A future admin can change them without
-- a redeploy.
-- ============================================================

INSERT INTO public.app_settings (key, value) VALUES
  -- Tax + discount rates (%)
  ('gst_pct',                   '5'),
  ('loyalty_discount_pct',      '5'),

  -- Add-on prices (paise)
  ('convenience_fee_paise',     '0'),
  ('insurance_per_seat_paise',  '4900'),     -- ₹49
  ('meal_veg_paise',            '9900'),     -- ₹99
  ('meal_nonveg_paise',         '12900'),    -- ₹129
  ('seat_upgrade_paise',        '5000'),     -- ₹50

  -- Cancellation refund tiers (% of total amount)
  ('refund_12h_pct',            '100'),
  ('refund_6h_pct',             '75'),
  ('refund_2h_pct',             '50'),

  -- Coverage label for trip insurance copy
  ('insurance_coverage_label',  '₹2 lakh'),
  ('insurance_partner_label',   'ICICI Lombard')
ON CONFLICT (key) DO NOTHING;

-- ─── Default IST timezone for the database session ─────────────
-- (this is per-session — the application sets it on connect via the
-- driver, but setting the database default helps SQL Editor users)
ALTER DATABASE neondb SET timezone TO 'Asia/Kolkata';
