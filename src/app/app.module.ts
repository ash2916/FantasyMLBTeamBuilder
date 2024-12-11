import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { TeamComponent } from './team/team.component';

@NgModule({
  declarations: [AppComponent, TeamComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    BrowserAnimationsModule, // Required for Angular Material animations
    MatToolbarModule, // Import MatToolbarModule here
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()) // Add this to configure HttpClient
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
