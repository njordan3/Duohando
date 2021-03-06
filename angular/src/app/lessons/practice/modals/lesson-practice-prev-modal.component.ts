import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { goBack, getAnswers } from '../lesson-practice';

@Component({
  selector: 'LessonPracticePrevModal',
  template: `
    <div class="modal-header">
        <h4 class="modal-title" id="modal-title">Practice Results</h4>
        <button type="button" class="close" aria-label="Close button" aria-describedby="modal-title" (click)="dismiss()">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="modal-body" style="text-align: center">

        <ng-template [ngIf]="grade === 100.0">
            <div>
                <p><strong>100% of your answers correct!</strong></p>
                <p>You gave <span style="color:green">{{answers_correct}}</span> correct answers out of <span style="color:green">{{answers_count}}</span> possible.</p>
                <p>You seem ready to move on to the quiz, but if you want to get more comfortable with the lesson you can go back to the lecture. You will have to eventually submit your practice if you want to unlock the quiz.</p>
            </div>
        </ng-template>

        <ng-template [ngIf]="grade < 100.0">
            <div>
                <p><strong>Are you sure you want to go back to the lecture?</strong></p>
                <p>You currently have <span style="color:blue">{{answers_correct}}</span> correct answers out of <span style="color:blue">{{answers_count}}</span> possible.</p>
                <p>Feel free to get more comfortable with the lecture. You will have to eventually submit your practice if you want to unlock the quiz.</p>
            </div>
        </ng-template>
    </div>
    <div class="modal-footer">
        <button type="button" ngbAutofocus class="btn btn-danger" (click)="submit()" #closeBtn>Go back to the lecture</button>
    </div>
  `,
})
export class LessonPracticePrevModal {
    static answers_correct: number = 0;
    static answers_count: number = 0;
    static grade: number = 0;

    constructor(private modalService: NgbModal) {}

    dismiss() {
        this.modalService.dismissAll();
    }
    submit() {
        this.modalService.dismissAll();
        goBack();
    }

    get answers_correct(): number {
        return LessonPracticePrevModal.answers_correct;
    }

    get answers_count(): number {
        return LessonPracticePrevModal.answers_count;
    }

    get grade(): number {
        return LessonPracticePrevModal.grade;
    }

    static updateResults() {
        let {answers_correct, answers_count} = getAnswers();
        this.answers_correct = answers_correct;
        this.answers_count = answers_count;
        this.grade = (answers_correct / answers_count)*100;
    }
}