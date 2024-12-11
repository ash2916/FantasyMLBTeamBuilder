import { RouterModule, Routes } from '@angular/router';
import { TeamComponent } from './team/team.component';
import {NgModule} from '@angular/core';

export const routes: Routes = [
  { path: '', component: TeamComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
