-- MoviLang: курс «Менталіст. Сезон 1» / „Mentalista. Sezon 1” / The Mentalist: Season 1 (B2–C1) — 36 уроків, 6 арок, EN/PL/UA.
-- Можна запускати повторно: курс оновлюється, прогрес учнів зберігається.
-- Supabase → SQL Editor → New query → вставити все → Run.
-- Уроки мають сталі id (з content/mentalist/mentalist1.json), тому завдання з content/std/mentalist-1 підтягнуться автоматично.

alter table public.courses add column if not exists free_first boolean not null default true;
create extension if not exists http with schema extensions;

do $$
declare
  src text := 'https://raw.githubusercontent.com/Movilang/movilang/main/content/mentalist/mentalist1.json';
  j jsonb; cid uuid; l jsonb;
begin
  select content::jsonb into j from extensions.http_get(src);
  if j is null or jsonb_array_length(j) <> 36 then raise exception 'Очікувалось 36 уроків: %', src; end if;

  select id into cid from public.courses where slug = 'mentalist-1';
  if cid is null then
    insert into public.courses (slug, title, title_pl, title_en, kind, level, price, poster, published, free_first, description, description_pl, description_en)
    values ('mentalist-1',
      'Менталіст. Сезон 1',
      'Mentalista. Sezon 1',
      'The Mentalist: Season 1',
      'series', 'B2–C1', '69 zł', 'p7', false, true,
      'Увесь перший сезон у 36 уроках. Ти — стажист у команді Терези Лісабон у CBI: допитуєш свідків, пишеш звіти для Мінеллі, свідчиш у суді, стежиш за Джейном і крок за кроком наближаєшся до Червоного Джона. Граматика B2–C1: змішані умовні, інверсія, cleft-речення, каузативи, обережні формулювання, офіційний стиль, subjunctive. 6 арок, квести-«боси» і фінальний іспит із сертифікатом.',
      'Cały pierwszy sezon w 36 lekcjach. Jesteś stażystą w zespole Teresy Lisbon w CBI: przesłuchujesz świadków, piszesz raporty dla Minellego, zeznajesz w sądzie, pilnujesz Jane''a i krok po kroku zbliżasz się do Red Johna. Gramatyka B2–C1: mieszane tryby warunkowe, inwersja, zdania rozszczepione, konstrukcje kauzatywne, język ostrożny, styl formalny, subjunctive. 6 łuków, questy-„bossowie” i egzamin końcowy z certyfikatem.',
      'The whole first season in 36 lessons. You are a trainee on Teresa Lisbon''s CBI team: you question witnesses, write reports for Minelli, testify in court, keep an eye on Jane and step by step close in on Red John. B2–C1 grammar: mixed conditionals, inversion, cleft sentences, causatives, hedging, formal register, the subjunctive. 6 arcs, boss quests and a final exam with a certificate.')
    returning id into cid;
  end if;

  for l in select * from jsonb_array_elements(j) loop
    insert into public.lessons (id, course_id, num, title, title_pl, title_en, grammar, scene, scene_pl, scene_en, tasks, variants)
    values ((l->>'id')::uuid, cid, (l->>'num')::int, l->>'title', l->>'title_pl', l->>'title_en', l->>'grammar', l->>'scene', l->>'scene_pl', l->>'scene_en', l->'tasks', l->'variants')
    on conflict (id) do update set title = excluded.title, title_pl = excluded.title_pl, title_en = excluded.title_en, grammar = excluded.grammar,
      scene = excluded.scene, scene_pl = excluded.scene_pl, scene_en = excluded.scene_en, tasks = excluded.tasks, variants = excluded.variants;
  end loop;
end $$;

drop extension if exists http;

-- перевірка: має бути 36
select count(*) from public.lessons l join public.courses c on c.id = l.course_id where c.slug = 'mentalist-1';

-- публікація:
update public.courses set published = true where slug = 'mentalist-1';
