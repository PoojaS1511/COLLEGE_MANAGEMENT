-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meal TEXT NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  time TIME NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_weekly_default BOOLEAN NOT NULL DEFAULT false,
  is_special BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_day ON menu_items(day);
CREATE INDEX IF NOT EXISTS idx_menu_items_meal ON menu_items(meal);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_approved ON menu_items(is_approved);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_weekly_default ON menu_items(is_weekly_default);

-- Add comments for documentation
COMMENT ON TABLE menu_items IS 'Stores hostel menu items with their details';
COMMENT ON COLUMN menu_items.day IS 'Day of the week for this menu item';
COMMENT ON COLUMN menu_items.meal IS 'Type of meal (breakfast, lunch, snacks, dinner)';
COMMENT ON COLUMN menu_items.time IS 'Time when this meal is served';
COMMENT ON COLUMN menu_items.items IS 'JSON array of food items with their types';
COMMENT ON COLUMN menu_items.is_approved IS 'Whether this menu item has been approved by an admin';
COMMENT ON COLUMN menu_items.is_weekly_default IS 'Whether this is a default weekly menu item';
COMMENT ON COLUMN menu_items.is_special IS 'Whether this is a special menu item';

-- Enable RLS (Row Level Security) for Supabase
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON menu_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON menu_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users with admin role" ON menu_items
  FOR DELETE TO authenticated USING (auth.role() = 'admin');

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
