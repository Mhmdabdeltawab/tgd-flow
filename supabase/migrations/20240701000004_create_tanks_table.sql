CREATE TABLE IF NOT EXISTS public.tanks (
  id TEXT PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  quality JSONB,
  departure_date TEXT NOT NULL,
  arrival_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

alter publication supabase_realtime add table tanks;
