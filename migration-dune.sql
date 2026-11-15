-- MoviLang: курс «Дюна. Частина перша» / „Diuna. Część pierwsza” / Dune: Part One (B1–B2) — 36 уроків, 6 арок, EN/PL/UA.
-- Можна запускати повторно: курс оновлюється, прогрес учнів зберігається.
-- Supabase → SQL Editor → New query → вставити все → Run.
-- Уроки мають сталі id (з content/dune/dune1.json), тому завдання з content/std/dune-1 підтягнуться автоматично.

alter table public.courses add column if not exists free_first boolean not null default true;
create extension if not exists http with schema extensions;

do $$
declare
  src text := 'https://raw.githubusercontent.com/Movilang/movilang/main/content/dune/dune1.json';
  j jsonb; cid uuid; l jsonb;
begin
  select content::jsonb into j from extensions.http_get(src);
  if j is null or jsonb_array_length(j) <> 36 then raise exception 'Очікувалось 36 уроків: %', src; end if;

  select id into cid from public.courses where slug = 'dune-1';
  if cid is null then
    insert into public.courses (slug, title, title_pl, title_en, kind, level, price, poster, published, free_first, description, description_pl, description_en)
    values ('dune-1',
      'Дюна. Частина перша',
      'Diuna. Część pierwsza',
      'Dune: Part One',
      'film', 'B1–B2', '49 zł', 'p4', false, true,
      'Увесь фільм у 36 уроках. Ти — учень картографа дому Атрідів: малюєш мапи Каладану, летиш на Арракіс, рятуєш робітників від піщаного черв''яка, переживаєш ніч зради, проходиш крізь бурю й знаходиш дім серед фрименів. Граматика B1–B2: часи, модальні дієслова, умовні речення, пасив, непряма мова, фразові дієслова. 6 арок, квести-«боси» і фінальний іспит із сертифікатом.',
      'Cały film w 36 lekcjach. Jesteś uczniem kartografa rodu Atrydów: rysujesz mapy Caladanu, lecisz na Arrakis, ratujesz robotników przed czerwiem pustyni, przeżywasz noc zdrady, przechodzisz przez burzę i znajdujesz dom wśród Fremenów. Gramatyka B1–B2: czasy, czasowniki modalne, tryby warunkowe, strona bierna, mowa zależna, czasowniki frazowe. 6 łuków, questy-„bossowie” i egzamin końcowy z certyfikatem.',
      'The whole film in 36 lessons. You are the apprentice cartographer of House Atreides: you map Caladan, fly to Arrakis, rescue workers from a sandworm, survive the night of betrayal, cross the storm and find a home among the Fremen. B1–B2 grammar: tenses, modals, conditionals, the passive, reported speech, phrasal verbs. 6 arcs, boss quests and a final exam with a certificate.')
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
select count(*) from public.lessons l join public.courses c on c.id = l.course_id where c.slug = 'dune-1';

-- публікація:
update public.courses set published = true where slug = 'dune-1';
