import {Injectable} from '@angular/core';
import {Precision} from '../models/precision.model';

@Injectable()
export class PrecisionService {

    constructor() {

    }

    public getPrecisionSpecsForPrecisionDegree(degree: number): Precision {
        degree = degree < 1 ? 1 : (degree > 5 ? 5 : degree);
        const specs: Precision = {
            maxRequestAtWorst: -1, // stub, will be changed later
            candidates: this.getCandidatesValueForPrecisionDegree(degree),
            rounds: this.getRoundsValueForPrecisionDegree(degree),
            volleySize: this.getVolleySizeForPrecisionDegree(degree)
        };
        specs.maxRequestAtWorst = this.findMaxRequestAtWorst(specs);
        return specs;
    }

    private getCandidatesValueForPrecisionDegree(degree: number): number {
        switch (degree) {
            case 1:
                return 1;
            case 2:
                return 1;
            case 3:
                return 2;
            case 4:
                return 2;
            case 5:
                return 3;
            default:
                return this.getCandidatesValueForPrecisionDegree(1);
        }
    }

    private getVolleySizeForPrecisionDegree(degree: number): number {
        switch (degree) {
            case 1:
                return 20;
            case 2:
                return 25;
            case 3:
                return 30;
            case 4:
                return 30;
            case 5:
                return 35;
            default:
                return this.getVolleySizeForPrecisionDegree(1);
        }
    }

    private getRoundsValueForPrecisionDegree(degree: number): number {
        switch (degree) {
            case 1:
                return 2;
            case 2:
                return 2;
            case 3:
                return 2;
            case 4:
                return 3;
            case 5:
                return 3;
            default:
                return this.getRoundsValueForPrecisionDegree(1);
        }
    }

    private findMaxRequestAtWorst(specs: Precision): number {
        let actualRounds: number = 1;
        for (let i: number = 1; i < specs.rounds; i++) {
            actualRounds += Math.pow(specs.candidates, i);
        }
        return actualRounds; // actualRounds * specs.volleySize coordinates informations
    }
}
