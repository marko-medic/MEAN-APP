import { NgModule } from '@angular/core';
import {
  MatInputModule,
  MatButtonModule,
  MatCardModule,
  MatToolbarModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatDialogModule
} from '@angular/material';

// NgModule automatski doda import: [MatInput,...]
@NgModule({
  exports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule
  ]
})
export class AngularMaterialModule {}
