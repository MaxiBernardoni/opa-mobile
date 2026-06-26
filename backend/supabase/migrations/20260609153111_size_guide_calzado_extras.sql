
-- Extend CHECK constraints to support calzado/extras categories and new fit_types
alter table size_guides drop constraint size_guides_category_check;
alter table size_guides add constraint size_guides_category_check
  check (category in ('tops', 'bottoms', 'calzado', 'extras'));

alter table size_guides drop constraint size_guides_fit_type_check;
alter table size_guides add constraint size_guides_fit_type_check
  check (fit_type in ('oversize', 'boxy', 'relaxed', 'baggy', 'straight', 'skinny', 'regular', 'wide', 'belt', 'bag'));

-- Add foot_length columns to size_guide_entries
alter table size_guide_entries
  add column foot_length_min numeric,
  add column foot_length_max numeric;

-- Insert 4 new guides and their entries
do $$
declare
  g_calzado_regular uuid;
  g_calzado_ancho   uuid;
  g_cinturon        uuid;
  g_bolso           uuid;
begin

  insert into size_guides (name, category, fit_type, brand_id)
  values ('Calzado Regular', 'calzado', 'regular', null)
  returning id into g_calzado_regular;

  insert into size_guide_entries (guide_id, size_label, foot_length_min, foot_length_max, sort_order) values
    (g_calzado_regular, '35', 21.7, 22.3, 0),
    (g_calzado_regular, '36', 22.3, 23.0, 1),
    (g_calzado_regular, '37', 23.0, 23.7, 2),
    (g_calzado_regular, '38', 23.7, 24.3, 3),
    (g_calzado_regular, '39', 24.3, 25.0, 4),
    (g_calzado_regular, '40', 25.0, 25.7, 5),
    (g_calzado_regular, '41', 25.7, 26.3, 6),
    (g_calzado_regular, '42', 26.3, 27.0, 7);

  insert into size_guides (name, category, fit_type, brand_id)
  values ('Calzado Ancho', 'calzado', 'wide', null)
  returning id into g_calzado_ancho;

  insert into size_guide_entries (guide_id, size_label, foot_length_min, foot_length_max, sort_order) values
    (g_calzado_ancho, '35', 21.7, 22.3, 0),
    (g_calzado_ancho, '36', 22.3, 23.0, 1),
    (g_calzado_ancho, '37', 23.0, 23.7, 2),
    (g_calzado_ancho, '38', 23.7, 24.3, 3),
    (g_calzado_ancho, '39', 24.3, 25.0, 4),
    (g_calzado_ancho, '40', 25.0, 25.7, 5),
    (g_calzado_ancho, '41', 25.7, 26.3, 6),
    (g_calzado_ancho, '42', 26.3, 27.0, 7);

  insert into size_guides (name, category, fit_type, brand_id)
  values ('Cinturón', 'extras', 'belt', null)
  returning id into g_cinturon;

  insert into size_guide_entries (guide_id, size_label, waist_min, waist_max, sort_order) values
    (g_cinturon, 'XS', 57, 70, 0),
    (g_cinturon, 'S',  65, 80, 1),
    (g_cinturon, 'M',  72, 90, 2),
    (g_cinturon, 'L',  80, 100, 3),
    (g_cinturon, 'XL', 87, 110, 4);

  insert into size_guides (name, category, fit_type, brand_id)
  values ('Bolso', 'extras', 'bag', null)
  returning id into g_bolso;

  insert into size_guide_entries (guide_id, size_label, sort_order) values
    (g_bolso, 'XS', 0),
    (g_bolso, 'S',  1),
    (g_bolso, 'M',  2),
    (g_bolso, 'L',  3),
    (g_bolso, 'XL', 4);

  update prendas set size_guide_id = g_calzado_regular where category = 'calzado';
  update prendas set size_guide_id = g_cinturon        where category = 'extras' and name ilike '%cintur%';
  update prendas set size_guide_id = g_bolso           where category = 'extras' and name ilike '%bolso%';

end;
$$;

-- Update get_recommended_size to handle calzado and extras
create or replace function get_recommended_size(guide_id uuid, p_user_id uuid)
returns table (size_label varchar, fit_preference varchar)
language plpgsql security definer
as $$
declare
  u user_measurements%rowtype;
  guide_cat varchar;
begin
  select * into u from user_measurements where user_id = p_user_id;
  if not found then return; end if;

  select category into guide_cat from size_guides where id = guide_id;

  if guide_cat = 'calzado' then
    return query
    select e.size_label, 'justo'::varchar
    from size_guide_entries e
    where e.guide_id = get_recommended_size.guide_id
      and u.height between e.foot_length_min and e.foot_length_max
    order by e.sort_order limit 1;
    return;
  end if;

  if guide_cat = 'extras' then
    return query
    select e.size_label, 'justo'::varchar
    from size_guide_entries e
    where e.guide_id = get_recommended_size.guide_id
      and e.waist_min is not null
      and u.waist between e.waist_min and e.waist_max
    order by e.sort_order limit 1;
    return;
  end if;

  if guide_cat = 'tops' then
    return query
    select e.size_label,
      case
        when u.chest >= (e.chest_max * 0.85) then 'ajustado'
        when u.chest <= (e.chest_min * 1.05) then 'holgado'
        else 'justo'
      end::varchar
    from size_guide_entries e
    where e.guide_id = get_recommended_size.guide_id
      and u.chest between e.chest_min and e.chest_max
    order by e.sort_order limit 1;
    return;
  end if;

  if guide_cat = 'bottoms' then
    return query
    select e.size_label,
      case
        when u.waist >= (e.waist_max * 0.90) then 'ajustado'
        when u.waist <= (e.waist_min * 1.05) then 'holgado'
        else 'justo'
      end::varchar
    from size_guide_entries e
    where e.guide_id = get_recommended_size.guide_id
      and u.waist between e.waist_min and e.waist_max
    order by e.sort_order limit 1;
    return;
  end if;

end;
$$;

grant execute on function get_recommended_size(uuid, uuid) to authenticated;
