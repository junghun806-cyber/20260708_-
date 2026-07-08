set role anon;

insert into public.directions_clicks (park_name, detail_location, trash_type, gu, had_geolocation)
values ('테스트공원', '테스트 위치', '일반쓰레기', '테스트구', true);

reset role;
