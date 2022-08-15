class Game
{
    
    constructor()
    {
        this.actions = [];
        this.states = [];
    }

    getPossibleActions()
    {
        return this.actions;
    }

    play(action)
    {
        //play

        state = this.getState();
        this.states.push(state);
    }
    reset()
    {

    }
    rewind()
    {

    }
    isOver()
    {

    }
    isWon()
    {

    }
    getState()
    {

    }

    run()
    {
        document.addEventListener('keypress',(e)=>{
            switch(e.code)
            {
                case Game.LEFT_ARROW:

                    break;
                case Game.RIGHT_ARROW:
                    break;
                case Game.UP_ARROW:
                    break;
                case Game.DOWN_ARROW:
                    break;
            }
        });
    }

}