import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),kind:text('kind').notNull(),data:text('data').notNull()},t=>[index('records_kind_idx').on(t.kind)]);
export const payments=sqliteTable('payments',{id:text('id').primaryKey(),invoice:text('invoice').notNull(),amount:integer('amount').notNull(),date:text('date').notNull(),method:text('method').notNull()},t=>[index('payments_invoice_idx').on(t.invoice)]);
