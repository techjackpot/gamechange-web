import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderStudentComponent } from './header/header-student/header-student.component';
import { HeaderTeacherComponent } from './header/header-teacher/header-teacher.component';
import { HeaderConvenorComponent } from './header/header-convenor/header-convenor.component';

@NgModule({
  imports: [
  	CommonModule,
    SharedModule
  ],
  declarations: [LayoutComponent, HeaderComponent, FooterComponent, HeaderStudentComponent, HeaderTeacherComponent, HeaderConvenorComponent, SidebarComponent],
  exports: [
  	LayoutComponent,
  	HeaderComponent,
    SidebarComponent,
  	FooterComponent
  ]
})
export class LayoutModule { }
