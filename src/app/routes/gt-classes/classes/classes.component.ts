import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  chooseClass() {
    this.router.navigate(['/classes/classes/students']);
  }
}
