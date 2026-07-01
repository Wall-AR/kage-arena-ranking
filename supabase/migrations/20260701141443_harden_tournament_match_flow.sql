-- Validate player-driven tournament match updates with state transitions.
-- Moderators bypass this trigger through their role checks.

create or replace function public.validate_tournament_match_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_participant_id uuid;
  v_valid_report boolean;
  v_valid_confirm boolean;
  v_valid_dispute boolean;
begin
  if current_setting('app.kage_system_update', true) = 'on' or public.is_moderator(auth.uid()) then
    return new;
  end if;

  if auth.uid() is null then
    raise exception 'Login necessario para atualizar partida de torneio';
  end if;

  select tp.id
  into v_caller_participant_id
  from public.tournament_participants tp
  join public.players p on p.id = tp.player_id
  where p.user_id = auth.uid()
    and tp.id in (old.player1_id, old.player2_id)
  limit 1;

  if v_caller_participant_id is null then
    raise exception 'Voce nao e participante desta partida';
  end if;

  if new.id is distinct from old.id
    or new.tournament_id is distinct from old.tournament_id
    or new.round is distinct from old.round
    or new.match_number is distinct from old.match_number
    or new.player1_id is distinct from old.player1_id
    or new.player2_id is distinct from old.player2_id
    or new.bracket_position is distinct from old.bracket_position
    or new.next_match_id is distinct from old.next_match_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Dados estruturais da chave nao podem ser alterados por jogadores';
  end if;

  v_valid_report :=
    old.status in ('pending', 'in_progress')
    and new.status = 'awaiting_confirmation'
    and new.reported_by = v_caller_participant_id
    and new.reported_winner_id in (old.player1_id, old.player2_id)
    and new.winner_id is null
    and new.confirmed_by is null
    and new.confirmed_at is null
    and coalesce(new.is_disputed, false) is false
    and coalesce(new.player1_score, 0) >= 0
    and coalesce(new.player2_score, 0) >= 0;

  v_valid_confirm :=
    old.status = 'awaiting_confirmation'
    and old.reported_by is not null
    and old.reported_winner_id in (old.player1_id, old.player2_id)
    and v_caller_participant_id <> old.reported_by
    and new.status = 'completed'
    and new.winner_id = old.reported_winner_id
    and new.confirmed_by = v_caller_participant_id
    and new.confirmed_at is not null
    and new.played_at is not null
    and coalesce(new.is_disputed, false) is false
    and new.reported_by is not distinct from old.reported_by
    and new.reported_winner_id is not distinct from old.reported_winner_id
    and new.player1_score is not distinct from old.player1_score
    and new.player2_score is not distinct from old.player2_score
    and new.evidence_url is not distinct from old.evidence_url
    and new.notes is not distinct from old.notes
    and new.player1_character is not distinct from old.player1_character
    and new.player2_character is not distinct from old.player2_character;

  v_valid_dispute :=
    old.status = 'awaiting_confirmation'
    and old.reported_by is not null
    and v_caller_participant_id <> old.reported_by
    and new.status = 'disputed'
    and coalesce(new.is_disputed, false) is true
    and new.winner_id is null
    and new.confirmed_by is null
    and new.confirmed_at is null
    and new.reported_by is not distinct from old.reported_by
    and new.reported_winner_id is not distinct from old.reported_winner_id
    and new.player1_score is not distinct from old.player1_score
    and new.player2_score is not distinct from old.player2_score
    and new.evidence_url is not distinct from old.evidence_url
    and new.notes is not distinct from old.notes
    and new.player1_character is not distinct from old.player1_character
    and new.player2_character is not distinct from old.player2_character;

  if not (v_valid_report or v_valid_confirm or v_valid_dispute) then
    raise exception 'Atualizacao de partida de torneio invalida';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_tournament_match_update on public.tournament_matches;
create trigger trg_validate_tournament_match_update
before update on public.tournament_matches
for each row execute function public.validate_tournament_match_update();

create or replace function public.advance_tournament_winner(p_match_id uuid, p_winner_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_match record;
  v_next record;
  v_caller_player_id uuid;
begin
  select p.id into v_caller_player_id from public.players p where p.user_id = auth.uid();

  select * into v_match from public.tournament_matches where id = p_match_id;
  if not found then raise exception 'Partida de torneio nao encontrada'; end if;
  if p_winner_id not in (v_match.player1_id, v_match.player2_id) then raise exception 'Vencedor invalido para esta partida'; end if;

  if not public.is_moderator(auth.uid()) then
    if v_match.status <> 'completed' or v_match.winner_id <> p_winner_id then
      raise exception 'A partida precisa estar confirmada antes de avancar o vencedor';
    end if;

    if not exists (
      select 1
      from public.tournament_participants tp
      where tp.id in (v_match.player1_id, v_match.player2_id)
        and tp.player_id = v_caller_player_id
    ) then
      raise exception 'Sem permissao para avancar esta partida';
    end if;
  end if;

  update public.tournament_participants set current_match_id = v_match.next_match_id where id = p_winner_id;
  if v_match.next_match_id is null then return; end if;

  if v_match.bracket_position % 2 = 1 then
    update public.tournament_matches set player1_id = p_winner_id where id = v_match.next_match_id;
  else
    update public.tournament_matches set player2_id = p_winner_id where id = v_match.next_match_id;
  end if;

  select * into v_next from public.tournament_matches where id = v_match.next_match_id;
  if v_next.status = 'bye' then
    update public.tournament_matches
    set winner_id = coalesce(v_next.player1_id, v_next.player2_id),
        status = 'completed',
        played_at = now()
    where id = v_next.id;

    perform public.advance_tournament_winner(v_next.id, coalesce(v_next.player1_id, v_next.player2_id));
  end if;
end;
$$;

revoke execute on function public.distribute_tournament_rewards(uuid) from public, anon, authenticated;
revoke execute on function public.update_kage_titles() from public, anon, authenticated;

notify pgrst, 'reload schema';
