import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { HostListener } from "@angular/core";

interface Player {
  id: number;
  name: string;
  team_id: number;
  team: string;
  position: string;
  imageUrl: string;
  jerseyNumber: number;
  stats: {
    avg: number;
    hr: number;
    rbi: number;
    fieldingPct: number;
    war: number;
  };
}

interface TeamStats {
  avg: number;
  hr: number;
  rbi: number;
  defenseRating: number;
  totalWAR: number;
}

@Component({
  selector: "app-fantasy-baseball",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class TeamComponent implements OnInit {
  isDarkMode = false;
  teamName = "";
  positionFilter = "";
  teamFilter = "";
  showDropdown = false;
  teams: any[] = [];
  availablePlayers: Player[] = [];
  selectedTeam: Player[] = [];
  filteredPlayers: Player[] = [];
  searchTerm: string = "";
  teamStats: TeamStats = { avg: 0, hr: 0, rbi: 0, defenseRating: 0, totalWAR: 0 }; // Correctly define this property
  positions: string[] = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
  djangoApiBaseUrl = "http://127.0.0.1:8000/api";
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTeams();
    this.loadDefaultPlayers();
    this.calculateTeamStats();
  }

  loadDefaultPlayers() {
    this.isLoading = true;
    this.http.get<Player[]>(`${this.djangoApiBaseUrl}/default-players/`).subscribe(
      (players) => {
        this.availablePlayers = Array.isArray(players) ? players : [];

        // Map the team_id to the corresponding team name
        this.availablePlayers = this.availablePlayers.map(player => ({
          ...player,
          team: this.teams.find(team => team.id === player.team_id)?.name || "Unknown"
        }));

        this.filteredPlayers = [...this.availablePlayers];
        this.isLoading = false;
      },
      (error) => {
        console.error("Error loading default players:", error);
        this.availablePlayers = [];
        this.isLoading = false;
      }
    );
  }

  fetchTeams() {
    this.isLoading = true;
    this.http.get<any>(`${this.djangoApiBaseUrl}/teams/`).subscribe(
      (data) => {
        this.teams = data.teams.map((team: any) => ({
          name: team.name,
          id: team.id,
        }));
        this.isLoading = false;
      },
      (error) => {
        console.error("Error fetching teams:", error);
        this.isLoading = false;
      }
    );
  }

  fetchPlayers(event: Event) {
  const target = event.target as HTMLSelectElement;
  const teamId = target.value; // Get the selected team ID

  // Clear players if no team is selected
  if (!teamId) {
    this.availablePlayers = [];
    this.filteredPlayers = [];
    return;
  }

  this.isLoading = true; // Show loading indicator
  this.http.get<{ players: Player[] }>(`${this.djangoApiBaseUrl}/teams/${teamId}/players/`).subscribe(
    (response) => {
      if (Array.isArray(response.players)) {
        // Map the team_id to the corresponding team name
        this.availablePlayers = response.players.map(player => ({
          ...player,
          team: this.teams.find(team => team.id === player.team_id)?.name || "Unknown"
        }));

        this.applyFilters(); // Apply current filters
      } else {
        console.error("Invalid response: players is not an array", response);
        this.availablePlayers = [];
        this.filteredPlayers = [];
      }
      this.isLoading = false; // Hide loading indicator
    },
    (error) => {
      console.error("Error fetching players:", error);
      this.availablePlayers = []; // Clear players on error
      this.filteredPlayers = [];
      this.isLoading = false;
    }
  );
}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  selectSearchItem(player: Player) {
    this.searchTerm = player.name;
    this.showDropdown = false; // Hide dropdown when a player is selected
    this.filteredPlayers = [player];
  }
  @HostListener("document:click", ["$event"])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest(".search-container")) {
      this.showDropdown = false; // Hide dropdown if clicked outside
    }
  }

  applyFilters() {
    // Start with the unfiltered list of available players
    let filtered = [...this.availablePlayers];

    // Apply the position filter if it is set
    if (this.positionFilter) {
      filtered = filtered.filter(player => player.position === this.positionFilter);
    }

    this.filteredPlayers = filtered;
  }

  newTeam() {
    this.teamName = "";
    this.resetTeam();
  }

  resetTeam() {
    this.teamName = ""; // Reset the team name
    this.availablePlayers = [...this.availablePlayers, ...this.selectedTeam]; // Move selected players back to available
    this.selectedTeam = [];
    this.calculateTeamStats();
    this.searchPlayers();
  }


saveTeam() {
  if (!this.teamName.trim()) {
    alert("Team Name is required to save the team.");
    return;
  }

  const teamData = {
    name: this.teamName,
    players: this.selectedTeam, // Include the selected players
  };

  const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${this.teamName || "fantasy-team"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}


loadTeam() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const teamData = JSON.parse(e.target.result);

        if (teamData && teamData.name && Array.isArray(teamData.players)) {
          this.teamName = teamData.name; // Load the team name
          this.selectedTeam = teamData.players; // Load the players into the selected team

          // Remove loaded players from available players
          this.availablePlayers = this.availablePlayers.filter(
            player => !this.selectedTeam.some(selected => selected.id === player.id)
          );

          // Recalculate stats and filters
          this.calculateTeamStats();
          this.applyFilters();

        } else {
          console.error("Invalid team data:", teamData);
          alert("The team data is invalid or incorrectly formatted.");
        }
      } catch (error) {
        console.error("Error parsing team file:", error);
        alert("The selected file is not a valid team JSON.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}


  searchPlayers() {
    if (!this.searchTerm.trim()) {
      this.filteredPlayers = [...this.availablePlayers];
      this.showDropdown = false; // Hide dropdown if no search term
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPlayers = this.availablePlayers.filter(player =>
      player.name.toLowerCase().includes(searchLower) ||
      player.team.toLowerCase().includes(searchLower) ||
      player.jerseyNumber.toString().includes(searchLower)
    );
    this.showDropdown = true; // Show dropdown if results are found
  }

  addToTeam(player: Player) {
  // Find if there is already a player in the selected team for the same position
  const existingPlayerIndex = this.selectedTeam.findIndex(p => p.position === player.position);

  if (existingPlayerIndex !== -1) {
    // Remove the existing player from the team
    const removedPlayer = this.selectedTeam.splice(existingPlayerIndex, 1)[0];

    // Add the removed player back to available players
    this.availablePlayers.push(removedPlayer);

    // Reapply filters to reflect changes
    this.applyFilters();
  }

  // Add the new player to the team
  const index = this.availablePlayers.indexOf(player);
  if (index > -1) {
    this.availablePlayers.splice(index, 1);
    this.selectedTeam.push(player);
    this.calculateTeamStats();
    this.applyFilters();
  }
}


  removeFromTeam(player: Player) {
    const index = this.selectedTeam.indexOf(player);
    if (index > -1) {
      this.selectedTeam.splice(index, 1);
      this.availablePlayers.push(player);
      this.calculateTeamStats();
      this.searchPlayers();
    }
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.calculateTeamStats();
    this.searchPlayers();
  }

  getPlayerByPosition(position: string): Player | undefined {
    return this.selectedTeam.find(player => player.position === position);
  }

  calculateTeamStats() {
    if (this.selectedTeam.length === 0) {
      this.teamStats = { avg: 0, hr: 0, rbi: 0, defenseRating: 0, totalWAR: 0 };
      return;
    }

    const totals = this.selectedTeam.reduce((acc, player) => {
      return {
        avg: acc.avg + player.stats.avg,
        hr: acc.hr + player.stats.hr,
        rbi: acc.rbi + player.stats.rbi,
        defenseRating: acc.defenseRating + player.stats.fieldingPct,
        totalWAR: acc.totalWAR + player.stats.war
      };
    }, { avg: 0, hr: 0, rbi: 0, defenseRating: 0, totalWAR: 0 });

    this.teamStats = {
      avg: totals.avg / this.selectedTeam.length,
      hr: totals.hr,
      rbi: totals.rbi,
      defenseRating: totals.defenseRating / this.selectedTeam.length,
      totalWAR: totals.totalWAR
    };
  }
}
