-- Create a safe, read-only run_sql function for Supabase
create or replace function public.run_sql(sql text)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  -- Only allow SELECT queries for safety
  if left(trim(lower(sql)), 6) <> 'select' then
    raise exception 'Only SELECT queries are allowed';
  end if;
  execute format('SELECT jsonb_agg(t) FROM (%s) t', sql) into result;
  return coalesce(result, '[]');
end;
$$;

-- Grant execute to anon and authenticated roles
grant execute on function public.run_sql(text) to anon, authenticated; 