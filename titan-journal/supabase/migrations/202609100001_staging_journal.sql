-- Run ONLY in a separate, empty Supabase TEST project. No production data.
begin;
create table public.journal_sync_staging (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1 check (revision > 0),
  document jsonb not null,
  updated_at timestamptz not null default now(),
  constraint document_shape check (
    (document->>'app' = 'titan-journal' and document->>'version' = '1'
    and jsonb_typeof(document->'trades') = 'array'
    and jsonb_typeof(document->'playbooks') = 'array'
    and jsonb_typeof(document->'profile') = 'object'
    and jsonb_typeof(document->'preferences') = 'object'
    and octet_length(document::text) <= 4500000) is true
  )
);
alter table public.journal_sync_staging enable row level security;
alter table public.journal_sync_staging force row level security;
revoke all on public.journal_sync_staging from public, anon, authenticated;
grant select, insert, update on public.journal_sync_staging to authenticated;
create policy owner_read on public.journal_sync_staging for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.journal_sync_staging for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.journal_sync_staging for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- A trigger makes the revision monotonic even for direct REST updates.
create function public.journal_staging_revision() returns trigger language plpgsql
set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then new.revision := 1;
  else new.revision := old.revision + 1; end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger staging_revision before insert or update on public.journal_sync_staging
for each row execute function public.journal_staging_revision();

-- Caller identity always comes from the verified JWT, never from an input owner ID.
create function public.save_journal_staging(expected_revision bigint, next_document jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.journal_sync_staging;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if expected_revision = 0 then
    insert into public.journal_sync_staging(user_id, document) values (auth.uid(), next_document)
    on conflict (user_id) do nothing returning * into saved;
  else
    update public.journal_sync_staging set document = next_document
      where user_id = auth.uid() and revision = expected_revision returning * into saved;
  end if;
  if saved.user_id is null then raise exception 'Revision conflict' using errcode = '40001'; end if;
  return jsonb_build_object('revision', saved.revision, 'document', saved.document);
end;
$$;
revoke all on function public.save_journal_staging(bigint, jsonb) from public, anon;
grant execute on function public.save_journal_staging(bigint, jsonb) to authenticated;
revoke all on function public.journal_staging_revision() from public, anon, authenticated;
commit;
