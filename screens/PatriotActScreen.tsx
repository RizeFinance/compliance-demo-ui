import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import * as React from 'react';
import { View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { Body, BodySmall, Heading3 } from '../components/Typography';
import { useComplianceWorkflow } from '../contexts/ComplianceWorkflow';
import { RootStackParamList } from '../types';
import RizeClient from '../utils/rizeClient';
import * as Network from 'expo-network';

interface PatriotActScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'PatriotAct'>;
}

export default function PatriotActScreen({ navigation }: PatriotActScreenProps): JSX.Element {
    const { complianceWorkflow, setComplianceWorkflow } = useComplianceWorkflow();
    const rize = RizeClient.getInstance();

    const onSubmit = async (): Promise<void> => {
        if (complianceWorkflow) {
            const externalStorageName = 'usa_ptrt_0';

            // Check if the Patriot Act document is still in pending
            let patriotActDocument = complianceWorkflow
                .current_step_documents_pending
                .find(x => x.external_storage_name === externalStorageName);

            if (patriotActDocument) {
                const ipAddress = await Network.getIpAddressAsync();
                const updatedComplianceWorkflow = await rize.complianceWorkflow.acknowledgeComplianceDocuments(
                    complianceWorkflow.uid,
                    complianceWorkflow.customer.uid,
                    {
                        accept: 'yes',
                        documentUid: patriotActDocument.uid,
                        ipAddress: ipAddress,
                        userName: complianceWorkflow.customer.email
                    }
                );

                await setComplianceWorkflow(updatedComplianceWorkflow);

                navigation.navigate('PII');
            } else {
                // Check if already accepted
                patriotActDocument = complianceWorkflow
                    .accepted_documents
                    .find(x => x.external_storage_name === externalStorageName);

                // If already accepted, redirect to next step
                if (patriotActDocument) {
                    navigation.navigate('PII');
                }
            }
        }
    };
    
    return (
        <Screen useScrollView>
            <Heading3
                textAlign='center'
            >
                USA Patriot Act Notice
            </Heading3>
            
            <BodySmall textAlign='center'>
                Scroll to the bottom of the document to accept.
            </BodySmall>

            <Body>&nbsp;</Body>
            <Body>&nbsp;</Body>

            <View
                style={{
                    paddingHorizontal: 32
                }}
            >
                <Body>
                    Important Information About Procedures for Opening a New Account
                </Body>

                <Body>&nbsp;</Body>

                <Body>
                    To help the government fight the funding of terrorism and mony laundering activities,
                    Federal law requires all financial institutions to obtain, verify, and record information
                    that identifies each person who opens an account.
                </Body>

                <Body>&nbsp;</Body>

                <Body>
                    What this means for you: When you open an account, we will ask for your name, address,
                    date of birth, and other information that will allow us to identify you. We may also ask
                    to see your driver&apos;s license or other identifying documents.
                </Body>
            </View>

            <Body>&nbsp;</Body>
            <Body>&nbsp;</Body>

            <BodySmall textAlign='center'>
                By clicking &quot;I Agree&quot; I am acknowledging that I have read and agree to the USA
                Patriot Act.
            </BodySmall>

            <BodySmall>&nbsp;</BodySmall>

            <Formik
                initialValues={{}}
                onSubmit={onSubmit}
            >
                {({ isSubmitting, handleSubmit }) => (
                    <Button
                        title='I Agree'
                        disabled={isSubmitting}
                        onPress={(): void => handleSubmit()}
                    />
                )}
            </Formik>
        </Screen>
    );
}