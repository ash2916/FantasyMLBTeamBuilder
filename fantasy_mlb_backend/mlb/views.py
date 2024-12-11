import json
from django.http import JsonResponse
from django.views import View
import os


class TeamListView(View):
    def get(self, request, *args, **kwargs):
        try:
            # Load teams from JSON file
            file_path = os.path.join(os.path.dirname(__file__), 'sample_data', 'teams.json')
            with open(file_path, 'r') as file:
                teams = json.load(file)
            return JsonResponse({"teams": teams}, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class TeamPlayersView(View):
    def get(self, request, team_id, *args, **kwargs):
        try:
            # Load players from JSON file
            file_path = os.path.join(os.path.dirname(__file__), 'sample_data', 'players.json')
            with open(file_path, 'r') as file:
                players = json.load(file)
            # Filter players by team_id
            team_players = [player for player in players if player['team_id'] == team_id]
            return JsonResponse({"players": team_players}, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
import os
import json


def default_players(request):
    file_path = os.path.join(os.path.dirname(__file__), "sample_data/players.json")
    with open(file_path, "r") as file:
        players = json.load(file)
    return JsonResponse(players, safe=False)  # Return only the first 10 players
