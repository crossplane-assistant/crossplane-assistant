export class Reloader {

    intervalId: any | undefined;
    reloadInSeconds: number = 5;
    reloadFunction: ()=> void;

    constructor(
        reload: ()=> void,
    ){
        this.reloadFunction = reload;
    }

    start(): void {

        this.reloadFunction();

        if (!this.intervalId) {
            this.intervalId = setInterval(
                this.reloadFunction,
                this.reloadInSeconds * 1000
            );
        }
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined
        }
    }
}
