import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import * as kms from 'aws-cdk-lib/aws-kms';

export interface SnsTopicWithEmailSubscriptionProps {
    readonly displayName: string;
    readonly topicName: string;
    readonly statementId: string;
    readonly principal: string;
    readonly emailAddress: string;
    readonly kmsKeyAlias?: string; // Optional parameter to pass KMS key alias
}

export class SnsTopicWithEmailSubscription extends Construct {
    private readonly props: SnsTopicWithEmailSubscriptionProps;
    private readonly _topic: sns.Topic;

    constructor(scope: Construct, id: string, props: SnsTopicWithEmailSubscriptionProps) {
        super(scope, id);
        this.props = props;
        const kmsKey = props.kmsKeyAlias ? kms.Alias.fromAliasName(this, 'ImportedKeyAlias', props.kmsKeyAlias) : new kms.Key(this, 'TopicKey');
        this._topic = this.createSnsTopic(this, id, props.displayName, props.topicName, kmsKey);
        SnsTopicWithEmailSubscription.addPublishPolicyStatement(this._topic, props.statementId, props.principal);
        SnsTopicWithEmailSubscription.addEmailSubscription(this._topic, props.emailAddress);
    }

    public getTopic(): sns.Topic {
        return this._topic;
    }

    private createSnsTopic = (scope: Construct, id: string, displayName: string, topicName: string, kmsKey: kms.IKey) => {
        return new sns.Topic(scope, id, {
            displayName: displayName,
            topicName: topicName,
            masterKey: kmsKey // Enable encryption with the KMS key
        });
    }

    private static addPublishPolicyStatement(topic: sns.Topic, sid: string, principal: string): void {
        topic.addToResourcePolicy(new PolicyStatement({
            sid: sid,
            effect: Effect.ALLOW,
            principals: [new ServicePrincipal(principal)],
            actions: ['SNS:Publish'],
            resources: [topic.topicArn]
        }));
    }

    private static addEmailSubscription(topic: sns.Topic, emailAddress: string): void {
        topic.addSubscription(new EmailSubscription(emailAddress));
    }
}
