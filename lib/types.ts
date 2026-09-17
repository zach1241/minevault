export const ENTRY_TYPES = ['Memory','Milestone','Build','Discovery','Adventure','Death','Achievement','Screenshot'] as const;
export type EntryType = typeof ENTRY_TYPES[number];
export type World = { id:string; user_id:string; name:string; description:string; edition:'Java'|'Bedrock'; game_mode:'Survival'|'Creative'|'Hardcore'|'Adventure'; seed:string; started_on:string; status:'Active'|'Archived'|'Lost'; version:string; cover_path:string|null; cover_url?:string; created_at:string; updated_at:string };
export type EntryImage = {id:string; entry_id:string; world_id:string; storage_path:string; alt:string; url?:string; created_at:string};
export type Entry = {id:string; world_id:string; title:string; description:string; entry_type:EntryType; occurred_on:string; minecraft_day:number|null; location_name:string; x:number|null; y:number|null; z:number|null; created_at:string; updated_at:string; images:EntryImage[]};
export type WorldInput = Omit<World,'id'|'user_id'|'created_at'|'updated_at'|'cover_url'|'cover_path'>;
export type EntryInput = Omit<Entry,'id'|'world_id'|'created_at'|'updated_at'|'images'>;
export const formatDate=(date:string)=>new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
