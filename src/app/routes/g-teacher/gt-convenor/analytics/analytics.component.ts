import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';
import * as Chartist from 'chartist';
import 'chartist-plugin-zoom';
import 'chartist-plugin-legend';

declare var $:any;

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

	assignedClasses = [];
	units = [];
	selectedClass = null;
	selectedUnit = null;
  studentList = [];

  marktypes = [];
  markHistory = [];
  studentBook = [];
  selectedMarkType = null;
  classMarkHistory = [];

  defaultMarkTypeIndexes = ['First Marktype', 'Second Marktype', 'Third Marktype'];

  selectedMarkTypeIndex = 0;

	loaded = false;
  loaded_class = false;
  loaded_unit = false;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
  	let p1 = new Promise((resolve, reject) => {
	    this.dataService.getClassesList().subscribe(response => {
      	let teacherId = this.dataService.getTeacherID();
        this.assignedClasses = (response.Classes || []).filter((classInfo) => {
        	return classInfo.Teachers.indexOf(teacherId)>-1 || this.authService.getUserRole()=='Convenor';
        });
        resolve();
      });
  	});

  	let p2 = new Promise((resolve, reject) => {
  		if(this.authService.getUserRole()=='Convenor') {
	  		this.dataService.getUnitsList({}).subscribe(response => {
	  			this.units = response.Units;
	  			resolve();
	  		})
	  	} else {
	  		resolve();
	  	}
  	})

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe( (students) => {
        this.studentList = students;
        resolve();
      });
    })

  	Promise.all([p1, p2]).then(() => {
  		this.loaded = true;
  	});
  }

  getIndexOfMark(marks, marktype) {
    let index = -1;
    marks.forEach((mark, i) => {
      if(mark.MarkType == marktype) {
        index = i;
      }
    });
    return index;
  }

  getIndexOfStudents(students, student_id) {
    let index = -1;
    students.forEach((student, i) => {
      if(student._id == student_id) {
        index = i;
      }
    });
    return index;
  }

  chooseClass(classInfo) {
  	this.selectedClass = classInfo;
    this.selectedUnit = null;

    this.loaded_class = false;

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.selectedClass._id }).subscribe(response => {
        this.marktypes = response.MarkTypes;
        resolve();
      });
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getStudentBook({ Class: this.selectedClass._id }).subscribe((response) => {
        this.classMarkHistory = response.MarkHistory;
        resolve();
      });
    })

    Promise.all([p1, p2]).then(() => {

      this.selectedMarkType = this.marktypes[0]._id;
      this.loaded_class = true;

      setTimeout(() => {
        this.resetClassGraph();
      }, 100)
    })
  }

  resetClassGraph() {
    let week_labels = [];
    for(let i=0; i<this.selectedClass.Weeks; i++) {
      week_labels.push(i+1);
    }

    let series_data = this.selectedClass.Students.map((student_id) => {
      return this.classMarkHistory.filter((history) => history.Student==student_id).sort((a,b) => parseFloat(a.Week) - parseFloat(b.Week)).map((history) => history.Marks[this.getIndexOfMark(history.Marks, this.selectedMarkType)].Value);
    });

    let week_by_week_chart_data = {
      labels: week_labels,
      series: series_data
    };

    let week_by_week_chart_options: any = {
      lineSmooth: false,
      axisY: {
          showGrid: true,
          offset: 40
      },
      axisX: {
          showGrid: false,
      },
      low: 0,
      showPoint: true,
      height: '300px',
      plugins: [
        Chartist.plugins.legend({
          legendNames: this.selectedClass.Students.map((student_id) => this.studentList[this.getIndexOfStudents(this.studentList, student_id)].DisplayName)
        })
      ]
    };

    let week_by_week_chart = new Chartist.Line('#week_by_week_graph', week_by_week_chart_data, week_by_week_chart_options);
  }

  chooseUnit(unitInfo) {
  	this.selectedUnit = unitInfo;
    this.selectedClass = null;
    this.loaded_unit = false;

    this.selectedUnit.Classes = this.assignedClasses.filter((classInfo) => {
      return classInfo.Unit == this.selectedUnit._id;
    })

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getStudentBook({}).subscribe((response) => {
        this.studentBook = response.MarkHistory;
        resolve();
      });
    })

    Promise.all([p1]).then(() => {
      this.loaded_unit = true;
      setTimeout(() => {
        this.resetUnitGraph();
      }, 100)
    });
  }

  resetUnitGraph() {
    this.selectedUnit.Classes.forEach((classInfo) => {
      let classMarkHistory = this.studentBook.filter((history) => history.Class == classInfo._id);

      let week_labels = [];
      for(let i=0; i<classInfo.Weeks; i++) {
        week_labels.push(i+1);
      }

      let series_data = [
        week_labels.map((week) => classMarkHistory.filter((history) => history.Week==week).reduce((s, history) => s+history.Marks[this.selectedMarkTypeIndex].Value, 0)/(classInfo.Students.length || 1))
      ]

      let class_chart_data = {
        labels: week_labels,
        series: series_data
      };

      let class_chart_options: any = {
        lineSmooth: false,
        axisY: {
            showGrid: true,
            offset: 40
        },
        axisX: {
            showGrid: false,
        },
        low: 0,
        showPoint: true,
        height: '150px'
      };

      new Chartist.Line('.class_'+classInfo._id, class_chart_data, class_chart_options);
    });
  }
}
