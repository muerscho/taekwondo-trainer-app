import type { Database } from 'sql.js';
import { GURTGRADE_DEFAULT, SCHWERPUNKTE_DEFAULT, BLOCK_KATEGORIEN_DEFAULT } from '@/design/tokens';
import { uuid, nowIso } from '@/domain/derivations';

export function seedDefaults(db: Database) {
  const ts = nowIso();

  for (const b of GURTGRADE_DEFAULT) {
    db.run(
      `INSERT OR IGNORE INTO belt_ranks(id,label,color_name,color_hex,color_border_hex,text_color_hex,sort_order,is_dan,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [b.id, b.label, b.colorName, b.bg, b.border, b.fg ?? null, b.sort, b.isDan ? 1 : 0, ts, ts]
    );
  }

  for (const f of SCHWERPUNKTE_DEFAULT) {
    db.run(
      `INSERT OR IGNORE INTO focus_areas(id,name,color_hex,weight_percent,sort_order,is_main,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [f.id, f.name, f.color, f.weight, f.sort, 1, ts, ts]
    );
  }

  for (const c of BLOCK_KATEGORIEN_DEFAULT) {
    db.run(
      `INSERT OR IGNORE INTO block_categories(id,name,focus_area_id,sort_order) VALUES (?,?,?,?)`,
      [c.id, c.name, c.mapTo, c.sort]
    );
  }

  const groups = [
    { id: uuid(), name: 'Einsteiger', level: 'Einsteiger', minAge: 6, maxAge: 14, sort: 0 },
    { id: uuid(), name: 'Jugend',     level: 'Fortgeschritten', minAge: 10, maxAge: 17, sort: 1 },
    { id: uuid(), name: 'Erwachsene', level: 'Erwachsene', minAge: 18, maxAge: 99, sort: 2 }
  ];
  for (const g of groups) {
    db.run(
      `INSERT OR IGNORE INTO groups(id,name,level,min_age,max_age,sort_order,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [g.id, g.name, g.level, g.minAge, g.maxAge, g.sort, ts, ts]
    );
  }

  db.run(
    `INSERT OR IGNORE INTO ai_config(id,provider,model,updated_at) VALUES ('default','Claude','claude-sonnet-4-6',?)`,
    [ts]
  );

  const fns = ['einheit','phasenplan','dashboard','progress','variation','bibliothek'];
  for (const fn of fns) db.run(`INSERT OR IGNORE INTO ai_function_toggles(function_id,enabled) VALUES (?,1)`, [fn]);

  db.run(`INSERT OR IGNORE INTO alert_thresholds(kind,value) VALUES ('low_attendance','60')`);
  db.run(`INSERT OR IGNORE INTO alert_thresholds(kind,value) VALUES ('no_goals','1')`);
}
