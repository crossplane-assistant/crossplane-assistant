import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CrossplaneExplorerComponent } from './crossplane/explore/crossplane-explorer/crossplane-explorer.component';
import { ListClaimsComponent } from './crossplane/explore/claim/list-claims/list-claims.component';
import { ListCompositionsComponent } from './crossplane/explore/composition/list-compositions/list-compositions.component';
import { ListXrdComponent } from './crossplane/explore/xrd/list-xrd/list-xrd.component';
import { SlidingPanelComponent } from './core/sliding-panel/sliding-panel.component';
import { CompositionViewerComponent } from './crossplane/explore/composition/composition-viewer/composition-viewer.component';
import { TruncateNamePipe } from './core/pipe/tuncate';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ApiClient } from './core/api.service';
import { EventsListComponent } from './crossplane/explore/common/events-list/events-list.component';
import { DynamicResourceViewerComponent } from './crossplane/explore/composition/composition-viewer/viewer/resources/dynamic-resource-viewer/dynamic-resource-viewer.component';
import { DurationPipe } from './core/pipe/duration';
import { ResourceDependencyViewerComponent } from './crossplane/explore/composition/dependencies/resource-dependency-viewer/resource-dependency-viewer.component';
import { ClaimGraphComponent } from './crossplane/explore/claim/graph/claim-graph/claim-graph.component';
import { ClaimViewComponent } from './crossplane/explore/claim/claim-view/claim-view.component';
import { NodeComponent } from './crossplane/explore/claim/graph/node/node.component';
import { GraphComponent } from './crossplane/explore/claim/graph/graph/graph.component';
import { ListProvidersComponent } from "./crossplane/explore/provider/list-providers/list-providers.component";
import { ListFunctionsComponent } from "./crossplane/explore/function/list-functions/list-functions.component";
import { MarketLinkComponent } from './crossplane/explore/common/market-link/market-link.component';
import { SchemaViewerComponent } from "./crossplane/explore/schema/viewer/schema-viewer/schema-viewer.component";
import { CreateXrdComponent } from './crossplane/explore/xrd/create-xrd/create-xrd.component';
import { CreateCompositionComponent } from './crossplane/explore/composition/create-composition/create-composition.component';
import { CreateClaimComponent } from './crossplane/explore/claim/create-claim/create-claim.component';
import { CreateProviderComponent } from './crossplane/explore/provider/create-provider/create-provider.component';
import { CreateFunctionComponent } from './crossplane/explore/function/create-function/create-function.component';
import { ToasterService } from './core/toaster/toaster.service';
import {ToasterComponent} from "./core/toaster/toaster/toaster.component";
import {
    CreateManageResourceComponent
} from "./crossplane/explore/managed-resource/create-manage-resource/create-manage-resource.component";
import {NgSelectModule} from "@ng-select/ng-select";

@NgModule({
  declarations: [
    AppComponent,
    CrossplaneExplorerComponent,
    ListClaimsComponent,
    ListCompositionsComponent,
    ListXrdComponent,
    ListProvidersComponent,
    ListFunctionsComponent,
    CompositionViewerComponent,
    TruncateNamePipe,
    ClaimGraphComponent,
    ClaimViewComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        MonacoEditorModule.forRoot(),
        EventsListComponent,
        DynamicResourceViewerComponent,
        ResourceDependencyViewerComponent,
        NodeComponent,
        GraphComponent,
        DurationPipe,
        MarketLinkComponent,
        SchemaViewerComponent,
        SlidingPanelComponent,
        CreateXrdComponent,
        CreateCompositionComponent,
        CreateClaimComponent,
        CreateFunctionComponent,
        CreateProviderComponent,
        CreateManageResourceComponent,
        ToasterComponent,
        NgSelectModule,
        FormsModule,
    ],
  providers: [ApiClient, ToasterService],
  bootstrap: [AppComponent],
})
export class AppModule {}
