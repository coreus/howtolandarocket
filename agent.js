class Agent
{
    constructor(batchSize,discountFactor){

        this.replayMemory = [];
        this.initModel();
        this.batchSize = batchSize;
        this.discountFactor = discountFactor;
    }

    initModel()
    {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 5, batchInputShape: [null, 7], activation: 'softmax'}));
        this.model.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd'
          });
        this.model.summary();
        
    }

    infer(state)
    {
        var output  = this.model.predict(tf.tensor1d(state).reshape([1,7])).arraySync().flat();
        console.log('prediction:',output);
        return output.indexOf(Math.max(...output));
    }


    pushToMemory(state,action,reward,nextState,done)
    {
        this.replayMemory.push({'state':state,'action':action,'reward':reward,'nextState':nextState,'done':done})
    }


    async train()
    {
        console.log('train');
        var minibatch = this.replayMemory
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value).slice(0,this.batchSize);
        
        var currentStates = minibatch.map(value=>{return value['state'];});
        var nextStates = minibatch.map(value=>{return value['nextState'];});
        
        var currentDecisions = this.model.predict(tf.concat1d(currentStates).reshape([this.batchSize,7])).arraySync();
        var nextDecisions = this.model.predict(tf.concat1d(nextStates).reshape([this.batchSize,7])).arraySync();
        let x =  new Array();
        let y =  new Array();
        minibatch.forEach(
            (value, index) => {
                const currentQ = currentDecisions[index];
                currentQ[value['action']] = value['nextState'] ? value['reward'] + this.discountRate * Math.max(...nextDecisions[index]) : value['reward'];
                x.push(value['state']);
                y.push(currentQ);
            }
        );
        
        x = tf.concat1d(x).reshape([this.batchSize, 7]);
        y = tf.concat1d(y).reshape([this.batchSize, 5]);
        console.log(x.arraySync(),y.arraySync());
        await this.model.fit(x,y, {
            epochs: 5,
            callbacks:{
              onEpochEnd: async(epoch, logs) =>{
                  console.log("Epoch:" + epoch + " Loss:" + logs.loss);
              }
            }
        });
        this.model.getWeights()[0].print();

    }
}