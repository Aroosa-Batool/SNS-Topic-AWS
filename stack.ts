import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SnsTopicWithEmailSubscription } from './sns-topic';

class MyStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new SnsTopicWithEmailSubscription(this, 'MyEncryptedSnsTopic', {
            displayName: 'My Encrypted SNS Topic',
            topicName: 'my-encrypted-sns-topic',
            statementId: 'MyStatementId',
            principal: 'sns.amazonaws.com',
            emailAddress: 'example@example.com',
            kmsKeyAlias: 'alias/my-key-alias' // Use KMS key alias
        });
    }
}

const app = new cdk.App();
new MyStack(app, 'MyStack');
app.synth();
