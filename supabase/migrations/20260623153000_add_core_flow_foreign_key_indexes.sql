create index if not exists idx_players_tutor_id
on public.players (tutor_id)
where tutor_id is not null;

create index if not exists idx_players_user_id
on public.players (user_id)
where user_id is not null;

create index if not exists idx_evaluation_results_evaluator_id
on public.evaluation_results (evaluator_id);

create index if not exists idx_evaluation_results_player_id
on public.evaluation_results (player_id);

create index if not exists idx_ranking_changes_player_id
on public.ranking_changes (player_id);

create index if not exists idx_ranking_changes_evaluation_id
on public.ranking_changes (evaluation_id)
where evaluation_id is not null;

create index if not exists idx_ranking_changes_match_id
on public.ranking_changes (match_id)
where match_id is not null;

create index if not exists idx_challenges_challenger_id
on public.challenges (challenger_id);

create index if not exists idx_challenges_challenged_id
on public.challenges (challenged_id);

create index if not exists idx_challenges_reported_by
on public.challenges (reported_by)
where reported_by is not null;

create index if not exists idx_challenges_reported_winner_id
on public.challenges (reported_winner_id)
where reported_winner_id is not null;

create index if not exists idx_challenges_match_id
on public.challenges (match_id)
where match_id is not null;

create index if not exists idx_challenges_cancelled_by
on public.challenges (cancelled_by)
where cancelled_by is not null;

create index if not exists idx_matches_challenge_id
on public.matches (challenge_id)
where challenge_id is not null;
