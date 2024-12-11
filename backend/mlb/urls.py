from django.urls import path
from .views import TeamListView, TeamPlayersView, default_players

urlpatterns = [
    path('api/default-players/', default_players, name='default-players'),
    path('api/teams/', TeamListView.as_view(), name='team-list'),
    path('api/teams/<int:team_id>/players/', TeamPlayersView.as_view(), name='team-players'),
]
