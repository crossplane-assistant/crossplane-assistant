import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrossplaneExplorerComponent } from './crossplane/explore/crossplane-explorer/crossplane-explorer.component';
import { ListClaimsComponent } from './crossplane/explore/claim/list-claims/list-claims.component';
import { ListCompositionsComponent } from './crossplane/explore/composition/list-compositions/list-compositions.component';
import { ListXrdComponent } from './crossplane/explore/xrd/list-xrd/list-xrd.component';
import { ClaimViewComponent } from './crossplane/explore/claim/claim-view/claim-view.component';
import {ListProvidersComponent} from "./crossplane/explore/provider/list-providers/list-providers.component";
import {ListFunctionsComponent} from "./crossplane/explore/function/list-functions/list-functions.component";
import {
  ListManagedResourcesComponent
} from "./crossplane/explore/managed-resource/list-managed-resources/list-managed-resources.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'explore/xrds' },
  {
    path: 'explore',
    component: CrossplaneExplorerComponent,

    children: [
      {
        path: 'claims',
        component: ListClaimsComponent,
      },
      {
        path: 'claims/:ref',
        component: ClaimViewComponent,
      },

      {
        path: 'compositions',
        component: ListCompositionsComponent,
      },
      {
        path: 'xrds',
        component: ListXrdComponent,
      },
      {
        path: 'managed-resources',
        component: ListManagedResourcesComponent,
      },
      {
        path: 'providers',
        component: ListProvidersComponent,
      },

      {
        path: 'functions',
        component: ListFunctionsComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
