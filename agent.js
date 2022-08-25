class Agent
{
    constructor(batchSize,discountFactor,inputShape,outputShape){

        this.replayMemory = [];
        this.inputShape = inputShape;
        this.outputShape = outputShape;
        this.initModels();
        this.batchSize = batchSize;
        this.discountFactor = discountFactor;
        
    }

    initModels()
    {
        this.qModel = tf.sequential();
        this.qModel.add(tf.layers.dense({ name:'Dense1', units:128, batchInputShape: [null, this.inputShape], activation: 'relu',kernelInitialize:tf.initializers.heUniform()}));
        this.qModel.add(tf.layers.dense({ name:'Dense2', units:64, activation: 'relu',kernelInitialize:tf.initializers.heUniform()}));
        this.qModel.add(tf.layers.dense({ name:'Dense3', units: this.outputShape, activation: 'linear',kernelInitialize:tf.initializers.heUniform()}));
        this.qModel.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd',
            metrics: ['accuracy']
          });
        this.qModel.summary();
        
        
        this.targetModel = tf.sequential();
        this.targetModel.add(tf.layers.dense({ name:'Dense1', units:128, batchInputShape: [null, this.inputShape], activation: 'relu',kernelInitialize:tf.initializers.heUniform()}));
        this.targetModel.add(tf.layers.dense({ name:'Dense2', units:64, activation: 'relu',kernelInitialize:tf.initializers.heUniform()}));
        this.targetModel.add(tf.layers.dense({ name:'Dense3', units: this.outputShape, activation: 'linear',kernelInitialize:tf.initializers.heUniform()}));
        this.targetModel.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd',
            metrics: ['accuracy']
          });
        this.targetModel.summary();
        this.copyWeights();
    }

    infer(state)
    {
        var output  = this.targetModel.predict(tf.tensor1d(state).reshape([1,this.inputShape])).arraySync().flat();
        //console.log('prediction:',output);
        return output.indexOf(Math.max(...output));
    }


    pushToMemory(state,action,reward,nextState,done)
    {
        if(this.replayMemory.length>=10000)
        {
            this.replayMemory = this.replayMemory.slice(1000,10000);
        }
        this.replayMemory.push({'state':state,'action':action,'reward':reward,'nextState':nextState,'done':done})
    }

    copyWeights()
    {
        this.targetModel.getLayer('Dense1').setWeights(this.qModel.getLayer('Dense1').getWeights());
        this.targetModel.getLayer('Dense2').setWeights(this.qModel.getLayer('Dense2').getWeights());
        this.targetModel.getLayer('Dense3').setWeights(this.qModel.getLayer('Dense3').getWeights());
        this.targetModel.getWeights()[0].print();
    }

    async train()
    {
        if(this.replayMemory.length<this.batchSize)
        {
            return;
        }
        console.log('train');
        var minibatch = this.replayMemory
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value).slice(0,this.batchSize);
        
        var currentStates = minibatch.map(value=>{return value['state'];});
        var nextStates = minibatch.map(value=>{return value['nextState'];});
        
        var currentDecisions = this.targetModel.predict(tf.concat1d(currentStates).reshape([this.batchSize,this.inputShape])).arraySync();
        var nextDecisions = this.targetModel.predict(tf.concat1d(nextStates).reshape([this.batchSize,this.inputShape])).arraySync();
        let x =  new Array();
        let y =  new Array();
        //console.log(currentDecisions);
        minibatch.forEach(
            (value, index) => {
                const currentQ = currentDecisions[index];
                //currentQ[value['action']] = value['reward'] + this.discountRate * Math.max(...nextDecisions[index]);
                currentQ[value['action']] = value['reward'] + this.discountFactor * Math.max(...nextDecisions[index]);
                x.push(value['state']);
                y.push(currentQ);
            }
        );
        //console.log(currentDecisions,y);
        x = tf.concat1d(x).reshape([this.batchSize, this.inputShape]);
        y = tf.concat1d(y).reshape([this.batchSize, this.outputShape]);
        //console.log(x.arraySync(),y.arraySync());
        //console.log(y.arraySync());
        await this.qModel.fit(x,y, {
            epochs: 1,
            verbose: 2,
            callbacks:{
              onEpochEnd: async(epoch, logs) =>{
                  console.log("Epoch:" + epoch + " Loss:" + logs.loss);
              }
            }
        });
        
        x.dispose();
        y.dispose();
    }
}