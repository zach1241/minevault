-- MineVault: private, normalized world journals. Apply through Supabase migrations.
begin;
create extension if not exists pgcrypto;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (length(display_name)<=100),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.worlds (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 100),
 description text not null default '' check(length(description)<=2000),
 edition text not null check(edition in ('Java','Bedrock')),
 game_mode text not null check(game_mode in ('Survival','Creative','Hardcore','Adventure')),
 seed text not null default '' check(length(seed)<=100),
 started_on date not null default current_date,
 status text not null default 'Active' check(status in ('Active','Archived','Lost')),
 version text not null default '' check(length(version)<=30),
 cover_path text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint own_cover_path check(cover_path is null or (split_part(cover_path,'/',1)=user_id::text and split_part(cover_path,'/',2)=id::text and split_part(cover_path,'/',3)<>''))
);
create table public.journal_entries (
 id uuid primary key default gen_random_uuid(), world_id uuid not null references public.worlds(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 160),
 description text not null default '' check(length(description)<=20000),
 entry_type text not null check(entry_type in ('Memory','Milestone','Build','Discovery','Adventure','Death','Achievement','Screenshot')),
 occurred_on date not null default current_date,
 minecraft_day integer check(minecraft_day>=0),
 location_name text not null default '' check(length(location_name)<=160),
 x integer check(x between -30000000 and 30000000),
 y integer check(y between -30000000 and 30000000),
 z integer check(z between -30000000 and 30000000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,world_id),
 constraint complete_coordinates check((x is null and y is null and z is null) or (x is not null and y is not null and z is not null))
);
create table public.entry_images (
 id uuid primary key default gen_random_uuid(), entry_id uuid not null,world_id uuid not null,
 storage_path text not null unique,alt text not null default '' check(length(alt)<=500),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(entry_id,world_id) references public.journal_entries(id,world_id) on delete cascade
);
-- Retry storage cleanup safely after relational deletion; private owner paths remain deletable.
create table public.storage_cleanup (
 id uuid primary key default gen_random_uuid(), user_id uuid not null,
 bucket text not null check(bucket in ('world-covers','journal-screenshots')), path text not null,
 created_at timestamptz not null default now(), unique(bucket,path)
);
create index worlds_user_updated_idx on public.worlds(user_id,updated_at desc);
create index entries_world_date_idx on public.journal_entries(world_id,occurred_on desc,created_at desc);
create index entries_world_type_idx on public.journal_entries(world_id,entry_type);
create index entries_places_idx on public.journal_entries(world_id) where x is not null;
create index images_entry_idx on public.entry_images(entry_id);
create index images_world_idx on public.entry_images(world_id);
create index cleanup_user_idx on public.storage_cleanup(user_id);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end;$$;
create trigger worlds_updated before update on public.worlds for each row execute function public.touch_updated_at();
create trigger entries_updated before update on public.journal_entries for each row execute function public.touch_updated_at();
create trigger images_updated before update on public.entry_images for each row execute function public.touch_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create function public.create_profile() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id) values(new.id);return new;end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
-- A user cannot reparent entries/images or change a world's owner after creation.
create function public.prevent_reparenting() returns trigger language plpgsql set search_path='' as $$begin
 if tg_table_name='worlds' then
  if new.user_id<>old.user_id or new.id<>old.id then raise exception 'Immutable ownership';end if;
 elsif tg_table_name='journal_entries' then
  if new.world_id<>old.world_id or new.id<>old.id then raise exception 'Immutable ownership';end if;
 elsif tg_table_name='entry_images' then
  if new.world_id<>old.world_id or new.entry_id<>old.entry_id or new.id<>old.id or new.storage_path<>old.storage_path then raise exception 'Immutable ownership';end if;
 end if;return new;end;$$;
create trigger immutable_world before update on public.worlds for each row execute function public.prevent_reparenting();
create trigger immutable_entry before update on public.journal_entries for each row execute function public.prevent_reparenting();
create trigger immutable_image before update on public.entry_images for each row execute function public.prevent_reparenting();
alter table public.profiles enable row level security;
alter table public.worlds enable row level security;
alter table public.journal_entries enable row level security;
alter table public.entry_images enable row level security;
alter table public.storage_cleanup enable row level security;
create policy own_profile_select on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy own_profile_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy own_worlds on public.worlds for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy own_entries on public.journal_entries for all to authenticated
 using(exists(select 1 from public.worlds w where w.id=world_id and w.user_id=(select auth.uid())))
 with check(exists(select 1 from public.worlds w where w.id=world_id and w.user_id=(select auth.uid())));
create policy own_images on public.entry_images for all to authenticated
 using(exists(select 1 from public.worlds w where w.id=world_id and w.user_id=(select auth.uid())))
 with check(split_part(storage_path,'/',1)=(select auth.uid())::text and split_part(storage_path,'/',2)=world_id::text and split_part(storage_path,'/',3)<>'' and exists(select 1 from public.worlds w where w.id=world_id and w.user_id=(select auth.uid())));
create policy own_cleanup_read on public.storage_cleanup for select to authenticated using(user_id=(select auth.uid()));
create policy own_cleanup_delete on public.storage_cleanup for delete to authenticated using(user_id=(select auth.uid()));
-- Security-definer trigger can queue deletions during cascades. No caller-controlled owner.
create function public.queue_storage_cleanup() returns trigger language plpgsql security definer set search_path='' as $$begin
 if tg_table_name='worlds' then
  if old.cover_path is not null and (tg_op='DELETE' or old.cover_path is distinct from new.cover_path) then
   insert into public.storage_cleanup(user_id,bucket,path) values(old.user_id,'world-covers',old.cover_path) on conflict do nothing;
  end if;
 else
  insert into public.storage_cleanup(user_id,bucket,path) values(split_part(old.storage_path,'/',1)::uuid,'journal-screenshots',old.storage_path) on conflict do nothing;
 end if;
 if tg_op='DELETE' then return old;else return new;end if;end;$$;
create trigger world_storage_cleanup after update of cover_path or delete on public.worlds for each row execute function public.queue_storage_cleanup();
create trigger image_storage_cleanup after delete on public.entry_images for each row execute function public.queue_storage_cleanup();
-- Atomic entry + image metadata mutation. Invoker privileges keep RLS authoritative.
create function public.save_journal_entry(p_id uuid,p_world_id uuid,p_entry jsonb,p_images jsonb default '[]'::jsonb,p_removed uuid[] default '{}') returns uuid
 language plpgsql security invoker set search_path='' as $$begin
 if auth.uid() is null or not exists(select 1 from public.worlds where id=p_world_id and user_id=auth.uid()) then raise exception 'Not authorized';end if;
 if jsonb_array_length(p_images)>12 then raise exception 'Too many images';end if;
 insert into public.journal_entries(id,world_id,title,description,entry_type,occurred_on,minecraft_day,location_name,x,y,z)
 values(p_id,p_world_id,p_entry->>'title',coalesce(p_entry->>'description',''),p_entry->>'entry_type',(p_entry->>'occurred_on')::date,(p_entry->>'minecraft_day')::integer,coalesce(p_entry->>'location_name',''),(p_entry->>'x')::integer,(p_entry->>'y')::integer,(p_entry->>'z')::integer)
 on conflict(id) do update set title=excluded.title,description=excluded.description,entry_type=excluded.entry_type,occurred_on=excluded.occurred_on,minecraft_day=excluded.minecraft_day,location_name=excluded.location_name,x=excluded.x,y=excluded.y,z=excluded.z
 where public.journal_entries.world_id=p_world_id;
 if not found then raise exception 'Wrong world';end if;
 delete from public.entry_images where entry_id=p_id and id=any(p_removed);
 insert into public.entry_images(id,entry_id,world_id,storage_path,alt)
 select (i->>'id')::uuid,p_id,p_world_id,i->>'storage_path',coalesce(i->>'alt','') from jsonb_array_elements(p_images) i;
 return p_id;
end;$$;
revoke all on function public.save_journal_entry(uuid,uuid,jsonb,jsonb,uuid[]) from public,anon;
grant execute on function public.save_journal_entry(uuid,uuid,jsonb,jsonb,uuid[]) to authenticated;
revoke all on function public.create_profile() from public,anon,authenticated;
revoke all on function public.queue_storage_cleanup() from public,anon,authenticated;
grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.worlds,public.journal_entries,public.entry_images to authenticated;
grant select,delete on public.storage_cleanup to authenticated;
revoke all on public.profiles,public.worlds,public.journal_entries,public.entry_images,public.storage_cleanup from anon;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('world-covers','world-covers',false,10485760,array['image/jpeg','image/png','image/webp']),
 ('journal-screenshots','journal-screenshots',false,10485760,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy minevault_storage_select on storage.objects for select to authenticated using(bucket_id in ('world-covers','journal-screenshots') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy minevault_storage_insert on storage.objects for insert to authenticated with check(bucket_id in ('world-covers','journal-screenshots') and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.worlds where id::text=(storage.foldername(storage.objects.name))[2] and user_id=(select auth.uid())));
-- No overwrite policy: every upload gets a fresh UUID. Deletion works after world removal.
create policy minevault_storage_delete on storage.objects for delete to authenticated using(bucket_id in ('world-covers','journal-screenshots') and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
