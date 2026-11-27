-- MoviLang · економіка курсів: монети, лавка, спутник, місячний кубок фракцій.
-- Монети рахує тільки сервер (security definer RPC). Клієнт не може писати в гаманець напряму.

create table if not exists eco_rules (
  course_id uuid primary key references courses(id) on delete cascade,
  rules jsonb not null default '{}'
);

create table if not exists eco_items (
  course_id uuid not null references courses(id) on delete cascade,
  item text not null check (item ~ '^[a-z0-9_]{2,32}$'),
  kind text not null check (kind in ('hint','freeze','boost','food','frame','theme','sticker','outfit')),
  price int not null check (price > 0),
  primary key (course_id, item)
);

create table if not exists eco_wallets (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  coins int not null default 0 check (coins >= 0),
  earned int not null default 0,
  spent int not null default 0,
  xp int not null default 0,
  fed_at timestamptz,
  boost int not null default 0,
  inv jsonb not null default '{}',
  owned text[] not null default '{}',
  equipped jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists eco_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  kind text not null,
  ref text not null,
  amount int not null,
  faction text,
  month text not null default to_char(now() at time zone 'Europe/Warsaw', 'YYYY-MM'),
  created_at timestamptz not null default now(),
  unique (user_id, course_id, kind, ref)
);
create index if not exists eco_ledger_cup on eco_ledger (course_id, month, faction) where amount > 0;
create index if not exists eco_ledger_user_day on eco_ledger (user_id, kind, ref);

create table if not exists eco_cup_winners (
  course_id uuid not null references courses(id) on delete cascade,
  month text not null,
  faction text,
  coins int not null default 0,
  primary key (course_id, month)
);

alter table eco_rules enable row level security;
alter table eco_items enable row level security;
alter table eco_wallets enable row level security;
alter table eco_ledger enable row level security;
alter table eco_cup_winners enable row level security;
drop policy if exists eco_rules_read on eco_rules;      create policy eco_rules_read on eco_rules for select using (true);
drop policy if exists eco_items_read on eco_items;      create policy eco_items_read on eco_items for select using (true);
drop policy if exists eco_cup_read on eco_cup_winners;  create policy eco_cup_read on eco_cup_winners for select using (true);
drop policy if exists eco_wallet_own on eco_wallets;    create policy eco_wallet_own on eco_wallets for select using (user_id = (select auth.uid()));
drop policy if exists eco_ledger_own on eco_ledger;     create policy eco_ledger_own on eco_ledger for select using (user_id = (select auth.uid()));

-- рівень спутника за досвідом: 1..10
create or replace function eco_level(p_xp int) returns int language sql immutable set search_path = public as $$
  select count(*)::int from unnest(array[0,40,100,180,280,400,540,700,880,1080]) t where t <= greatest(p_xp, 0);
$$;

create or replace function eco_rule(p_course uuid, p_key text, p_def numeric) returns numeric language sql stable set search_path = public as $$
  select coalesce((select (rules->>p_key)::numeric from eco_rules where course_id = p_course), p_def);
$$;

create or replace function eco_month() returns text language sql stable set search_path = public as $$ select to_char(now() at time zone 'Europe/Warsaw', 'YYYY-MM'); $$;
create or replace function eco_today() returns date language sql stable set search_path = public as $$ select (now() at time zone 'Europe/Warsaw')::date; $$;

-- внутрішнє: нарахувати (ідемпотентно за kind+ref). Повертає фактичну суму.
create or replace function eco_credit(p_uid uuid, p_course uuid, p_kind text, p_ref text, p_amount int) returns int
language plpgsql security definer set search_path = public as $$
declare f text; n int;
begin
  if p_amount is null or p_amount <= 0 then return 0; end if;
  select faction into f from world_profiles where user_id = p_uid and course_id = p_course;
  insert into eco_ledger(user_id, course_id, kind, ref, amount, faction) values (p_uid, p_course, p_kind, p_ref, p_amount, f)
    on conflict do nothing;
  get diagnostics n = row_count;
  if n = 0 then return 0; end if;
  insert into eco_wallets(user_id, course_id) values (p_uid, p_course) on conflict do nothing;
  update eco_wallets set coins = coins + p_amount, earned = earned + p_amount, xp = xp + p_amount, updated_at = now()
    where user_id = p_uid and course_id = p_course;
  return p_amount;
end $$;

-- переможець минулого місяця (ліниво, без cron) + нагорода учасникам фракції-переможця
create or replace function eco_cup_settle(p_course uuid) returns void
language plpgsql security definer set search_path = public as $$
declare pm text := to_char((now() at time zone 'Europe/Warsaw') - interval '1 month', 'YYYY-MM'); w record;
begin
  if exists (select 1 from eco_cup_winners where course_id = p_course and month = pm) then return; end if;
  select faction, sum(amount)::int s into w from eco_ledger
    where course_id = p_course and month = pm and amount > 0 and faction is not null and kind <> 'cup' group by faction order by 2 desc limit 1;
  insert into eco_cup_winners(course_id, month, faction, coins) values (p_course, pm, w.faction, coalesce(w.s, 0)) on conflict do nothing;
end $$;

create or replace function eco_state(p_course uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w eco_wallets; f text; win record; cup int := 0; last date; mood text;
begin
  if uid is null then raise exception 'not logged in'; end if;
  perform eco_cup_settle(p_course);
  insert into eco_wallets(user_id, course_id) values (uid, p_course) on conflict do nothing;
  select faction into f from world_profiles where user_id = uid and course_id = p_course;
  select * into win from eco_cup_winners where course_id = p_course
    and month = to_char((now() at time zone 'Europe/Warsaw') - interval '1 month', 'YYYY-MM');
  if f is not null and win.faction = f then
    cup := eco_credit(uid, p_course, 'cup', win.month, eco_rule(p_course, 'cup', 50)::int);
  end if;
  -- банк (напр. Залізний банк): відсотки раз на тиждень від залишку
  if eco_rule(p_course, 'interest_pct', 0) > 0 then
    select * into w from eco_wallets where user_id = uid and course_id = p_course;
    perform eco_credit(uid, p_course, 'interest', to_char(now() at time zone 'Europe/Warsaw', 'IYYY-IW'),
      least(eco_rule(p_course, 'interest_cap', 40)::int, floor(w.coins * eco_rule(p_course, 'interest_pct', 0) / 100)::int));
  end if;
  select * into w from eco_wallets where user_id = uid and course_id = p_course;
  select max(day) into last from activity where user_id = uid;
  mood := case when last is null then 'new' when eco_today() - last <= 1 then 'happy' when eco_today() - last <= 3 then 'sad' else 'sleepy' end;
  return jsonb_build_object('coins', w.coins, 'earned', w.earned, 'spent', w.spent, 'xp', w.xp, 'level', eco_level(w.xp),
    'boost', w.boost, 'inv', w.inv, 'owned', to_jsonb(w.owned), 'equipped', w.equipped, 'fed_at', w.fed_at,
    'mood', mood, 'last_day', last, 'faction', f, 'cup_reward', cup, 'cup_last', case when win.month is null then null else jsonb_build_object('month', win.month, 'faction', win.faction, 'coins', win.coins) end);
end $$;

create or replace function eco_claim_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); l record; sc int; target int; paid int; delta int; n int; got int := 0; parts jsonb := '[]';
  boss boolean; lv0 int; lv1 int; w eco_wallets; t date := eco_today(); a int; streak int := 0; d date;
begin
  if uid is null then raise exception 'not logged in'; end if;
  select id, course_id, tasks, variants, concat_ws(' ', title, title_pl, title_en) tt into l from lessons where id = p_lesson;
  if not found then raise exception 'no lesson'; end if;
  select max(greatest(score, coalesce(retry_score, 0))) into sc from (
    select score, retry_score from progress where user_id = uid and lesson_id = p_lesson
    union all select score, null::int from progress_lang where user_id = uid and lesson_id = p_lesson) s;
  if sc is null then raise exception 'no progress'; end if;
  sc := least(greatest(sc, 0), 100);
  insert into eco_wallets(user_id, course_id) values (uid, l.course_id) on conflict do nothing;
  select xp into lv0 from eco_wallets where user_id = uid and course_id = l.course_id; lv0 := eco_level(lv0);
  boss := l.tt ~* '(boss|egzamin|exam|іспит|бос)' or (coalesce(l.variants, '{}') ? 'cert');

  -- урок: правильні відповіді + бонуси (доплачуємо різницю, якщо результат покращився)
  target := round(sc * eco_rule(l.course_id, 'correct', 15) / 100)
    + case when sc >= 90 then eco_rule(l.course_id, 'perfect', 10)::int else 0 end
    + case when sc >= 100 then eco_rule(l.course_id, 'flawless', 0)::int else 0 end
    + case when boss and sc >= 50 then (eco_rule(l.course_id, 'boss', 25) * eco_rule(l.course_id, 'boss_mult', 1))::int else 0 end;
  select coalesce(sum(amount), 0), count(*) into paid, n from eco_ledger
    where user_id = uid and course_id = l.course_id and kind = 'lesson' and ref like p_lesson::text || ':%';
  delta := target - paid;
  if delta > 0 then
    a := eco_credit(uid, l.course_id, 'lesson', p_lesson::text || ':' || (n + 1), delta); got := got + a;
    parts := parts || jsonb_build_object('k', 'lesson', 'a', a, 'score', sc, 'boss', boss);
    select * into w from eco_wallets where user_id = uid and course_id = l.course_id;
    if w.boost > 0 and a > 0 then
      update eco_wallets set boost = boost - 1 where user_id = uid and course_id = l.course_id;
      a := eco_credit(uid, l.course_id, 'boost', p_lesson::text || ':' || (n + 1), a); got := got + a;
      parts := parts || jsonb_build_object('k', 'boost', 'a', a);
    end if;
  end if;

  -- день серії (один раз на день на всі курси) + заморозка + бонус за серію
  if not exists (select 1 from eco_ledger where user_id = uid and kind = 'day' and ref = t::text) then
    select * into w from eco_wallets where user_id = uid and course_id = l.course_id;
    if not exists (select 1 from activity where user_id = uid and day = t - 1)
       and exists (select 1 from activity where user_id = uid and day = t - 2)
       and coalesce((w.inv->>'freeze')::int, 0) > 0 then
      insert into activity(user_id, day, lessons, reviews) values (uid, t - 1, 0, 0) on conflict do nothing;
      update eco_wallets set inv = jsonb_set(inv, '{freeze}', to_jsonb(coalesce((inv->>'freeze')::int, 0) - 1)) where user_id = uid and course_id = l.course_id;
      parts := parts || jsonb_build_object('k', 'freeze', 'a', 0);
    end if;
    a := eco_credit(uid, l.course_id, 'day', t::text, eco_rule(l.course_id, 'day', 5)::int); got := got + a;
    if a > 0 then parts := parts || jsonb_build_object('k', 'day', 'a', a); end if;
    d := t; streak := 1;
    while exists (select 1 from activity where user_id = uid and day = d - 1) loop streak := streak + 1; d := d - 1; end loop;
    if eco_rule(l.course_id, 'streak_every', 0) > 0 and streak % eco_rule(l.course_id, 'streak_every', 0)::int = 0 then
      a := eco_credit(uid, l.course_id, 'streak', t::text, eco_rule(l.course_id, 'streak_bonus', 0)::int); got := got + a;
      if a > 0 then parts := parts || jsonb_build_object('k', 'streak', 'a', a, 'n', streak); end if;
    end if;
  end if;

  select * into w from eco_wallets where user_id = uid and course_id = l.course_id;
  lv1 := eco_level(w.xp);
  return jsonb_build_object('gain', got, 'parts', parts, 'coins', w.coins, 'xp', w.xp, 'level_before', lv0, 'level', lv1, 'streak', streak);
end $$;

-- повторення слів: +review за кожне, не більше review_cap монет на день (на всі курси разом)
create or replace function eco_claim_review(p_course uuid, p_n int) returns int
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); t text := eco_today()::text; had int; cap int; per int; a int;
begin
  if uid is null then return 0; end if;
  per := eco_rule(p_course, 'review', 3)::int; cap := eco_rule(p_course, 'review_cap', 30)::int;
  select coalesce(sum(amount), 0) into had from eco_ledger where user_id = uid and kind = 'review' and ref like t || ':%';
  a := least(greatest(p_n, 0) * per, cap - had);
  if a <= 0 then return 0; end if;
  return eco_credit(uid, p_course, 'review', t || ':' || (select count(*) from eco_ledger where user_id = uid and kind = 'review' and ref like t || ':%'), a);
end $$;

create or replace function eco_buy(p_course uuid, p_item text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); it eco_items; w eco_wallets; back int := 0; ref text;
begin
  if uid is null then raise exception 'not logged in'; end if;
  select * into it from eco_items where course_id = p_course and item = p_item;
  if not found then raise exception 'no item'; end if;
  insert into eco_wallets(user_id, course_id) values (uid, p_course) on conflict do nothing;
  select * into w from eco_wallets where user_id = uid and course_id = p_course for update;
  if it.kind in ('frame','theme','sticker','outfit') and p_item = any(w.owned) then raise exception 'owned'; end if;
  if w.coins < it.price then raise exception 'not enough'; end if;
  ref := p_item || ':' || extract(epoch from clock_timestamp())::bigint || ':' || floor(random() * 1e6)::int;
  insert into eco_ledger(user_id, course_id, kind, ref, amount) values (uid, p_course, 'buy', ref, -it.price);
  update eco_wallets set coins = coins - it.price, spent = spent + it.price, updated_at = now(),
    owned = case when it.kind in ('frame','theme','sticker','outfit') then array_append(owned, p_item) else owned end,
    boost = boost + case when it.kind = 'boost' then 1 else 0 end,
    inv = case when it.kind in ('hint','freeze') then jsonb_set(inv, array[it.kind], to_jsonb(coalesce((inv->>it.kind)::int, 0) + 1)) else inv end,
    xp = xp + case when it.kind = 'food' then eco_rule(p_course, 'food_xp', 20)::int else 0 end,
    fed_at = case when it.kind = 'food' then now() else fed_at end,
    equipped = case when it.kind in ('frame','theme','outfit') then jsonb_set(equipped, array[it.kind], to_jsonb(p_item)) else equipped end
    where user_id = uid and course_id = p_course;
  -- кешбек (напр. Зверополіс): частина ціни повертається як «афера»
  if eco_rule(p_course, 'cashback_pct', 0) > 0 then
    back := floor(it.price * eco_rule(p_course, 'cashback_pct', 0) / 100)::int;
    if back > 0 then
      insert into eco_ledger(user_id, course_id, kind, ref, amount) values (uid, p_course, 'cashback', ref, back);
      update eco_wallets set coins = coins + back, spent = spent - back where user_id = uid and course_id = p_course;
    end if;
  end if;
  return eco_state(p_course) || jsonb_build_object('bought', p_item, 'kind', it.kind, 'cashback', back);
end $$;

create or replace function eco_equip(p_course uuid, p_slot text, p_item text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not logged in'; end if;
  if p_slot not in ('frame','theme','outfit') then raise exception 'bad slot'; end if;
  if p_item is null or p_item = '' then
    update eco_wallets set equipped = equipped - p_slot where user_id = uid and course_id = p_course;
  else
    if not exists (select 1 from eco_wallets w join eco_items i on i.course_id = w.course_id and i.item = p_item and i.kind = p_slot
                   where w.user_id = uid and w.course_id = p_course and p_item = any(w.owned)) then raise exception 'not owned'; end if;
    update eco_wallets set equipped = jsonb_set(equipped, array[p_slot], to_jsonb(p_item)) where user_id = uid and course_id = p_course;
  end if;
  return eco_state(p_course);
end $$;

create or replace function eco_use(p_course uuid, p_kind text) returns int
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null or p_kind <> 'hint' then raise exception 'bad'; end if;
  select coalesce((inv->>'hint')::int, 0) into n from eco_wallets where user_id = uid and course_id = p_course for update;
  if coalesce(n, 0) <= 0 then raise exception 'none'; end if;
  update eco_wallets set inv = jsonb_set(inv, '{hint}', to_jsonb(n - 1)) where user_id = uid and course_id = p_course;
  return n - 1;
end $$;

-- кубок місяця: очки фракцій за поточний місяць + переможці минулих
create or replace function eco_cup(p_course uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform eco_cup_settle(p_course);
  return jsonb_build_object('month', eco_month(),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('faction', faction, 'coins', s, 'members', m) order by s desc) from (
      select faction, sum(amount)::int s, count(distinct user_id)::int m from eco_ledger
      where course_id = p_course and month = eco_month() and amount > 0 and faction is not null and kind <> 'cup' group by faction) x), '[]'),
    'winners', coalesce((select jsonb_agg(jsonb_build_object('month', month, 'faction', faction, 'coins', coins) order by month desc)
      from (select * from eco_cup_winners where course_id = p_course and faction is not null order by month desc limit 6) y), '[]'));
end $$;

revoke all on function eco_credit(uuid, uuid, text, text, int) from public, anon, authenticated;
revoke all on function eco_cup_settle(uuid) from public, anon, authenticated;
revoke all on function eco_state(uuid), eco_claim_lesson(uuid), eco_claim_review(uuid, int), eco_buy(uuid, text), eco_equip(uuid, text, text), eco_use(uuid, text) from public, anon;
grant execute on function eco_state(uuid), eco_claim_lesson(uuid), eco_claim_review(uuid, int), eco_buy(uuid, text), eco_equip(uuid, text, text), eco_use(uuid, text) to authenticated;
grant execute on function eco_cup(uuid) to anon, authenticated;

-- 2026-11-27: адмін — покупки без монет (eco_buy), прапорець admin в eco_state, скидання eco_reset(p_course, p_all).
-- Застосовано через патч функцій у базі; актуальні визначення: select pg_get_functiondef('eco_buy(uuid,text)'::regprocedure).
create or replace function eco_reset(p_course uuid, p_all boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null or not is_admin() then raise exception 'admin only'; end if;
  update eco_wallets set owned = '{}', equipped = '{}', inv = '{}', boost = 0, fed_at = null, updated_at = now()
    where user_id = uid and course_id = p_course;
  if p_all then
    update eco_wallets set coins = 0, earned = 0, spent = 0, xp = 0 where user_id = uid and course_id = p_course;
    delete from eco_ledger where user_id = uid and course_id = p_course;
  end if;
  return eco_state(p_course);
end $$;
revoke all on function eco_reset(uuid, boolean) from public, anon;
grant execute on function eco_reset(uuid, boolean) to authenticated;
