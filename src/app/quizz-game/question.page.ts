import { Component, OnDestroy, OnInit } from "@angular/core";

const TIME_PER_QUESTION = 20;
const POINTS_PER_CORRECT_ANSWER = 100;

@Component({
    selector: 'app-question',
    templateUrl: 'question.page.html',
    styleUrls: ['question.page.scss'],
})

export class QuestionPage implements OnInit, OnDestroy {
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
    ngOnDestroy(): void {
        throw new Error("Method not implemented.");
    }

}