// Генерує SQL для eco_rules / eco_items з eco.js: node tools/eco_seed.js > /tmp/eco.sql
global.window = {}; require('../eco.js');
const E = window.MOVILANG_ECO, q = s => "'" + String(s).replace(/'/g, "''") + "'";
let out = ['begin;'];
for (const [slug, e] of Object.entries(E)) {
  const cid = `(select id from courses where slug = ${q(slug)})`;
  out.push(`insert into eco_rules(course_id, rules) select ${cid}, ${q(JSON.stringify(e.rules))}::jsonb where ${cid} is not null on conflict (course_id) do update set rules = excluded.rules;`);
  out.push(`delete from eco_items where course_id = ${cid} and item not in (${e.items.map(i => q(i.id)).join(',')});`);
  for (const i of e.items) out.push(`insert into eco_items(course_id, item, kind, price) select ${cid}, ${q(i.id)}, ${q(i.kind)}, ${i.price} where ${cid} is not null on conflict (course_id, item) do update set kind = excluded.kind, price = excluded.price;`);
}
out.push('commit;'); console.log(out.join('\n'));
